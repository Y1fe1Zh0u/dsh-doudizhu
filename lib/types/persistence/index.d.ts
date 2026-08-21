/** Production persistence boundary for resumable experimental LAN matches. */
import { Context, Service } from '@deepseek-ai/cordis';
import { type LocalBinding, type MatchRecord } from './spec.ts';
export * from './error.ts';
export * from './replay.ts';
export { doudizhuActionSchema, doudizhuDecisionOutcomeSchema, doudizhuResultSchema, doudizhuStateSchema, lanGameDomainSpec, localBindingSchema, matchCheckpointSchema, matchEventSchema, matchRecordSchema, pendingDecisionSchema, } from './spec.ts';
export type { DoudizhuActionRecord, LocalBinding, MatchCheckpoint, MatchEvent, MatchRecord, PendingDecision, } from './spec.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        lanGamePersistence: LanGamePersistence;
    }
}
/** Both optimistic guards required by every mutation of an existing match. */
export interface MatchRevisionGuard {
    readonly expectedRecordRevision: number;
    readonly expectedCheckpointStateVersion: number;
}
/**
 * Single-writer service over the `lan_game` storage domain. Match mutations
 * serialize locally and use the table's atomic update slot for their final
 * record/checkpoint compare-and-set.
 */
export default class LanGamePersistence extends Service {
    static inject: string[];
    private matches?;
    private bindings?;
    private operationTail;
    private mutationAdmissionOpen;
    constructor(ctx: Context);
    /** Open, validate, and own the production LAN game storage domain. */
    protected [Service.init](): Promise<void>;
    /**
     * Create one room match at record revision zero.
     *
     * @param record - Initial durable match snapshot.
     * @returns A detached snapshot of the newly persisted match.
     */
    create(record: MatchRecord): Promise<MatchRecord>;
    /**
     * Replace an existing record behind both optimistic guards. The service,
     * not the caller, advances `recordRevision` exactly once.
     *
     * @param record - Replacement match contents.
     * @param guard - Expected record and checkpoint revisions.
     * @returns A detached snapshot of the committed replacement.
     */
    put(record: MatchRecord, guard: MatchRevisionGuard): Promise<MatchRecord>;
    /**
     * Atomically transform an existing full match record behind both guards.
     *
     * @param roomId - Durable room identifier.
     * @param guard - Expected record and checkpoint revisions.
     * @param transform - Pure transformation applied to a detached current snapshot.
     * @returns A detached snapshot of the committed result.
     */
    update(roomId: string, guard: MatchRevisionGuard, transform: (current: MatchRecord) => MatchRecord): Promise<MatchRecord>;
    /**
     * Return one detached durable match snapshot.
     *
     * @param roomId - Durable room identifier.
     * @returns The detached match snapshot, or `undefined` when absent.
     */
    get(roomId: string): MatchRecord | undefined;
    /**
     * Return detached durable matches in stable room-id order.
     *
     * @returns All detached match snapshots ordered by room identifier.
     */
    list(): MatchRecord[];
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
    archive(roomId: string, guard: MatchRevisionGuard, closedAt?: string): Promise<MatchRecord>;
    /**
     * Create or replace the one installation-local binding for a room.
     *
     * @param binding - Installation-local room and session binding.
     * @returns A detached snapshot of the persisted binding.
     */
    putBinding(binding: LocalBinding): Promise<LocalBinding>;
    /**
     * Return the detached local binding for a room.
     *
     * @param roomId - Durable room identifier.
     * @returns The detached local binding, or `undefined` when absent.
     */
    getBinding(roomId: string): LocalBinding | undefined;
    /**
     * Return detached local bindings, optionally restricted to one room.
     *
     * @param roomId - Optional room identifier used to restrict the result.
     * @returns Detached bindings ordered by room identifier.
     */
    listBindings(roomId?: string): LocalBinding[];
    private updateKnown;
    private assertGuard;
    private assertValid;
    private enqueue;
    private requireMatches;
    private requireBindings;
}
//# sourceMappingURL=index.d.ts.map