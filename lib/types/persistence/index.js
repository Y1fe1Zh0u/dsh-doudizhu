/** Production persistence boundary for resumable experimental LAN matches. */
import { Context, Service } from '@deepseek-ai/cordis';
import { LanGameInvalidRecordError, LanGameMatchExistsError, LanGameMatchNotFoundError, LanGamePersistenceClosedError, LanGameStaleRevisionError, } from "./error.js";
import { validateMatchRecord } from "./replay.js";
import { lanGameDomainSpec, localBindingSchema, matchRecordSchema, } from "./spec.js";
export * from "./error.js";
export * from "./replay.js";
export { doudizhuActionSchema, doudizhuDecisionOutcomeSchema, doudizhuResultSchema, doudizhuStateSchema, lanGameDomainSpec, localBindingSchema, matchCheckpointSchema, matchEventSchema, matchRecordSchema, pendingDecisionSchema, } from "./spec.js";
/**
 * Single-writer service over the `lan_game` storage domain. Match mutations
 * serialize locally and use the table's atomic update slot for their final
 * record/checkpoint compare-and-set.
 */
export default class LanGamePersistence extends Service {
    static inject = ['storageDomain'];
    matches;
    bindings;
    operationTail = Promise.resolve();
    mutationAdmissionOpen = true;
    constructor(ctx) {
        super(ctx, 'lanGamePersistence');
    }
    /** Open, validate, and own the production LAN game storage domain. */
    async [Service.init]() {
        const domain = await this.ctx.storageDomain.open(lanGameDomainSpec);
        this.matches = domain.table('matches');
        this.bindings = domain.table('bindings');
        this.ctx.effect(() => async () => {
            this.mutationAdmissionOpen = false;
            await this.operationTail;
            await domain.close();
        }, 'lan-game-persistence.domainClose');
        for (const [roomId, record] of this.matches.entries())
            this.assertValid(roomId, record);
        for (const [roomId, binding] of this.bindings.entries()) {
            if (binding.roomId !== roomId) {
                throw new LanGameInvalidRecordError(roomId, ['bindings table key must equal binding.roomId']);
            }
        }
    }
    /**
     * Create one room match at record revision zero.
     *
     * @param record - Initial durable match snapshot.
     * @returns A detached snapshot of the newly persisted match.
     */
    create(record) {
        return this.enqueue(async () => {
            const table = this.requireMatches();
            const parsed = snapshotMatch(record);
            const roomId = parsed.room.id;
            if (table.get(roomId) !== undefined)
                throw new LanGameMatchExistsError(roomId);
            if (parsed.recordRevision !== 0) {
                throw new LanGameInvalidRecordError(roomId, ['new match recordRevision must be zero']);
            }
            this.assertValid(roomId, parsed);
            await table.put(roomId, parsed);
            return snapshotMatch(parsed);
        });
    }
    /**
     * Replace an existing record behind both optimistic guards. The service,
     * not the caller, advances `recordRevision` exactly once.
     *
     * @param record - Replacement match contents.
     * @param guard - Expected record and checkpoint revisions.
     * @returns A detached snapshot of the committed replacement.
     */
    put(record, guard) {
        return this.update(record.room.id, guard, () => record);
    }
    /**
     * Atomically transform an existing full match record behind both guards.
     *
     * @param roomId - Durable room identifier.
     * @param guard - Expected record and checkpoint revisions.
     * @param transform - Pure transformation applied to a detached current snapshot.
     * @returns A detached snapshot of the committed result.
     */
    update(roomId, guard, transform) {
        return this.enqueue(() => this.updateKnown(roomId, guard, transform));
    }
    /**
     * Return one detached durable match snapshot.
     *
     * @param roomId - Durable room identifier.
     * @returns The detached match snapshot, or `undefined` when absent.
     */
    get(roomId) {
        const record = this.requireMatches().get(roomId);
        return record === undefined ? undefined : snapshotMatch(record);
    }
    /**
     * Return detached durable matches in stable room-id order.
     *
     * @returns All detached match snapshots ordered by room identifier.
     */
    list() {
        return [...this.requireMatches().entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([, record]) => snapshotMatch(record));
    }
    /**
     * Close and redact one match. Local secrets are scrubbed before the match
     * record commits, so a later match-write failure cannot leave a strategy
     * prompt or resume token behind.
     *
     * @param roomId - Durable room identifier.
     * @param guard - Expected record and checkpoint revisions.
     * @param closedAt - Timestamp recorded on the closure event and snapshots.
     * @returns A detached snapshot of the archived match.
     */
    archive(roomId, guard, closedAt = new Date().toISOString()) {
        return this.enqueue(async () => {
            const current = this.requireMatches().get(roomId);
            if (current === undefined)
                throw new LanGameMatchNotFoundError(roomId);
            this.assertGuard(roomId, current, guard);
            const binding = this.requireBindings().get(roomId);
            if (binding !== undefined) {
                await this.requireBindings().put(roomId, snapshotBinding({
                    ...binding,
                    strategyPrompt: undefined,
                    resumeToken: undefined,
                    state: 'archived',
                    updatedAt: closedAt,
                }));
            }
            return await this.updateKnown(roomId, guard, value => redactMatch(value, closedAt));
        });
    }
    /**
     * Create or replace the one installation-local binding for a room.
     *
     * @param binding - Installation-local room and session binding.
     * @returns A detached snapshot of the persisted binding.
     */
    putBinding(binding) {
        return this.enqueue(async () => {
            const parsed = snapshotBinding(binding);
            await this.requireBindings().put(parsed.roomId, parsed);
            return snapshotBinding(parsed);
        });
    }
    /**
     * Return the detached local binding for a room.
     *
     * @param roomId - Durable room identifier.
     * @returns The detached local binding, or `undefined` when absent.
     */
    getBinding(roomId) {
        const binding = this.requireBindings().get(roomId);
        return binding === undefined ? undefined : snapshotBinding(binding);
    }
    /**
     * Return detached local bindings, optionally restricted to one room.
     *
     * @param roomId - Optional room identifier used to restrict the result.
     * @returns Detached bindings ordered by room identifier.
     */
    listBindings(roomId) {
        return [...this.requireBindings().entries()]
            .filter(([key]) => roomId === undefined || key === roomId)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([, binding]) => snapshotBinding(binding));
    }
    async updateKnown(roomId, guard, transform) {
        let missing = false;
        try {
            const next = await this.requireMatches().update(roomId, (current) => {
                this.assertGuard(roomId, current, guard);
                const transformed = transform(snapshotMatch(current));
                const parsed = snapshotMatch({ ...transformed, recordRevision: current.recordRevision + 1 });
                this.assertValid(roomId, parsed);
                return parsed;
            });
            return snapshotMatch(next);
        }
        catch (error) {
            if (isMissingKey(error))
                missing = true;
            if (!missing)
                throw error;
        }
        throw new LanGameMatchNotFoundError(roomId);
    }
    assertGuard(roomId, current, guard) {
        const actualStateVersion = current.checkpoint.state.version;
        if (current.recordRevision !== guard.expectedRecordRevision
            || actualStateVersion !== guard.expectedCheckpointStateVersion) {
            throw new LanGameStaleRevisionError(roomId, guard.expectedRecordRevision, current.recordRevision, guard.expectedCheckpointStateVersion, actualStateVersion);
        }
    }
    assertValid(roomId, record) {
        const failures = validateMatchRecord(record, roomId);
        if (failures.length > 0)
            throw new LanGameInvalidRecordError(roomId, failures);
    }
    enqueue(operation) {
        if (!this.mutationAdmissionOpen)
            return Promise.reject(new LanGamePersistenceClosedError());
        const run = this.operationTail.then(operation, operation);
        this.operationTail = run.then(() => { }, () => { });
        return run;
    }
    requireMatches() {
        if (this.matches === undefined)
            throw new Error('LAN game persistence has not initialized');
        return this.matches;
    }
    requireBindings() {
        if (this.bindings === undefined)
            throw new Error('LAN game persistence has not initialized');
        return this.bindings;
    }
}
function redactMatch(record, closedAt) {
    const last = record.events[record.events.length - 1];
    const events = last?.type === 'room-closed'
        ? record.events
        : [...record.events, {
                type: 'room-closed',
                seq: (last?.seq ?? -1) + 1,
                at: closedAt,
                reason: 'archived',
            }];
    return {
        ...record,
        updatedAt: closedAt,
        closedAt,
        room: {
            ...record.room,
            members: record.room.members.map(({ resumeToken: _resumeToken, ...member }) => member),
        },
        events,
        pendingDecision: undefined,
    };
}
function snapshotMatch(record) {
    return matchRecordSchema.parse(record);
}
function snapshotBinding(binding) {
    return localBindingSchema.parse(binding);
}
function isMissingKey(error) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'missing-key';
}
//# sourceMappingURL=index.js.map