/** Coordinator runtime connecting deterministic rules to local and remote hidden Game Sessions. */
import { randomInt, randomUUID } from 'node:crypto';
import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { DoudizhuCardId, DoudizhuError, applyDoudizhuAction, createDoudizhuGame, doudizhuPrivateView, doudizhuPublicView, shuffleDoudizhuDeck, } from "../doudizhu/index.js";
import { LanMemberId } from "../room/index.js";
const MAX_REDEALS = 8;
/** Starts and drives authoritative matches for locally coordinated running rooms. */
export default class DoudizhuGames extends Service {
    static inject = ['lanRooms', 'lanRoomTransport'];
    static Config = z.object({
        roundsPerMatch: z.number().default(3),
        roundPauseMs: z.number().default(2_000),
        decisionTimeoutMs: z.number().default(50_000),
    });
    games = new Map();
    listeners = new Set();
    config;
    /** Subscribe to room lifecycle and own every running match until settlement or close. */
    constructor(ctx, config = {}) {
        super(ctx, 'doudizhuGames');
        this.config = {
            roundsPerMatch: positiveInteger(config.roundsPerMatch ?? 3, 'roundsPerMatch'),
            roundPauseMs: nonNegativeInteger(config.roundPauseMs ?? 2_000, 'roundPauseMs'),
            decisionTimeoutMs: positiveInteger(config.decisionTimeoutMs ?? 50_000, 'decisionTimeoutMs'),
        };
        ctx.effect(() => ctx.lanRooms.onChanged(({ kind, room }) => {
            if (kind === 'removed') {
                this.games.get(room.id)?.abort.abort(new Error('room closed'));
                return;
            }
            if (room.phase === 'running' && room.coordinatorId === room.members[0]?.id && !this.games.has(room.id))
                this.start(room);
        }), 'doudizhu-games: follow authoritative rooms');
        ctx.effect(() => async () => {
            const entries = [...this.games.values()];
            for (const entry of entries)
                entry.abort.abort(new Error('DouDizhu runtime disposed'));
            await Promise.allSettled(entries.map(entry => entry.done));
            this.games.clear();
        }, 'doudizhu-games: stop matches');
    }
    /**
     * Return detached active runtime rows.
     * @returns current coordinator matches in insertion order.
     */
    list() {
        return [...this.games.values()].map(entry => ({
            roomId: entry.roomId,
            stateVersion: entry.state.version,
            phase: entry.state.phase,
        }));
    }
    /**
     * Subscribe to active runtime row updates and removals.
     * @param listener - callback receiving committed runtime views.
     * @returns disposer that stops future notifications.
     */
    onChanged(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
    /**
     * Resume a restored coordinator room from its validated durable checkpoint.
     * @param room - exact authoritative room rehydrated from the same match record.
     * @returns true when recovery starts or projects an already durable settlement.
     */
    resume(room) {
        if (room.phase !== 'running' || this.games.has(room.id))
            return false;
        return this.start(room);
    }
    start(room) {
        const durable = this.ctx.get('lanGamePersistence')?.get(room.id);
        if (durable?.finishedAt !== undefined && durable.closedAt === undefined) {
            const settled = recoveredEntry(room, durable);
            this.publish(settled, 'finished');
            this.finishRoom(room.id, durable.room.result ?? compactResult(settled));
            return true;
        }
        const recovered = this.recoverableRecord(room);
        const abort = new AbortController();
        let initialDeal;
        let state;
        if (recovered === undefined) {
            initialDeal = freshDeal();
            state = initialDeal.state;
        }
        else {
            state = recoveredState(recovered.checkpoint.state);
        }
        const entry = {
            roomId: room.id,
            members: room.members.map(member => ({ ...member })),
            abort,
            state,
            round: recovered?.checkpoint.round ?? 1,
            deal: recovered?.checkpoint.deal ?? 1,
            totalScores: recovered === undefined ? [0, 0, 0] : [...recovered.checkpoint.totalScores],
            roundResults: recovered === undefined ? [] : recovered.checkpoint.roundResults.map(result => recoveredResult(result)),
            decisionOutcomes: recovered === undefined ? [] : recovered.checkpoint.decisionOutcomes.map(outcome => ({
                historyIndex: outcome.historyIndex,
                afterStateVersion: outcome.afterStateVersion,
                seat: outcome.seat,
                source: outcome.source,
                ...(outcome.fallbackReason === undefined ? {} : { fallbackReason: outcome.fallbackReason }),
            })),
            recordRevision: recovered?.recordRevision,
            done: Promise.resolve(),
        };
        this.games.set(room.id, entry);
        this.notify(entry);
        const execution = initialDeal === undefined
            ? this.continueMatch(entry, room, recovered?.pendingDecision)
            : this.run(entry, room, initialDeal);
        entry.done = execution.catch((error) => {
            if (abort.signal.aborted)
                return;
            const message = messageOf(error).slice(0, 220);
            this.publishFailure(room.id, message);
            this.finishRoom(room.id, `doudizhu failed: ${message}`);
        }).finally(() => {
            this.games.delete(room.id);
            this.notify(entry, 'removed');
        });
        return true;
    }
    async run(entry, room, initialDeal) {
        entry.state = initialDeal.state;
        entry.decisionOutcomes = [];
        await this.createDurableMatch(entry, room, initialDeal);
        await this.continueMatch(entry, room);
    }
    async continueMatch(entry, room, recoveredPending) {
        let pending = recoveredPending;
        while (entry.round <= this.config.roundsPerMatch) {
            let redeals = 0;
            this.notify(entry);
            if (pending === undefined && entry.state.phase !== 'finished')
                this.publish(entry, 'running');
            while (!entry.abort.signal.aborted && entry.state.phase !== 'finished') {
                if (entry.state.phase === 'redeal') {
                    redeals += 1;
                    if (redeals > MAX_REDEALS)
                        throw new Error(`all players passed bidding ${MAX_REDEALS} times`);
                    entry.deal += 1;
                    const redeal = freshDeal();
                    await this.persistDealStarted(entry, redeal);
                    entry.state = redeal.state;
                    entry.decisionOutcomes = [];
                    this.notify(entry);
                    this.publish(entry, 'running');
                    continue;
                }
                await this.step(entry, room, pending);
                pending = undefined;
            }
            if (entry.abort.signal.aborted)
                return;
            const result = entry.state.result;
            if (result === undefined)
                throw new Error('finished round has no result');
            if (entry.roundResults.length < entry.round) {
                const roundResults = [...entry.roundResults, result];
                const totalScores = [...entry.totalScores];
                for (const seat of [0, 1, 2])
                    totalScores[seat] += result.scores[seat];
                await this.persistRoundFinished(entry, result, totalScores, roundResults);
                entry.roundResults = roundResults;
                entry.totalScores = totalScores;
            }
            if (entry.round === this.config.roundsPerMatch)
                await this.persistMatchFinished(entry);
            this.notify(entry);
            this.publish(entry, entry.round === this.config.roundsPerMatch ? 'finished' : 'round-finished');
            if (entry.round === this.config.roundsPerMatch)
                break;
            await abortableDelay(this.config.roundPauseMs, entry.abort.signal);
            entry.round += 1;
            entry.deal = 1;
            const deal = freshDeal();
            await this.persistDealStarted(entry, deal);
            entry.state = deal.state;
            entry.decisionOutcomes = [];
        }
        this.finishRoom(entry.roomId, compactResult(entry));
    }
    async step(entry, room, recoveredPending) {
        const seat = currentSeat(entry.state);
        const member = room.members.find(candidate => candidate.seat === seat);
        if (member === undefined)
            throw new Error(`room has no member in seat ${seat}`);
        const view = doudizhuPrivateView(entry.state, seat);
        const requestId = `doudizhu-r${entry.round}-v${entry.state.version}-${randomUUID()}`;
        const requestedAt = new Date();
        const deadlineAt = recoveredPending === undefined
            ? new Date(requestedAt.getTime() + this.config.decisionTimeoutMs)
            : new Date(recoveredPending.deadlineAt);
        const remainingMs = deadlineAt.getTime() - requestedAt.getTime();
        await this.persistDecisionRequested(entry, requestId, seat, requestedAt, deadlineAt, recoveredPending);
        const timeout = AbortSignal.timeout(Math.max(1, remainingMs));
        const signal = AbortSignal.any([entry.abort.signal, timeout]);
        let action;
        let source = 'agent';
        let reason;
        try {
            if (remainingMs <= 0)
                throw new DecisionDeadlineExpired();
            const response = await this.ctx.lanRoomTransport.requestDecision({
                roomId: entry.roomId,
                memberId: LanMemberId(member.id),
                requestId,
                stateVersion: entry.state.version,
                state: json(view),
                signal,
            });
            try {
                action = parseAction(response);
                // Validate before durable commit; the authoritative state advances only after storage succeeds.
                applyDoudizhuAction({ state: entry.state, seat, action });
            }
            catch {
                action = doudizhuFallbackAction(view);
                source = 'fallback';
                reason = 'invalid-response';
            }
        }
        catch (error) {
            if (entry.abort.signal.aborted)
                return;
            action = doudizhuFallbackAction(view);
            source = 'fallback';
            reason = error instanceof DecisionDeadlineExpired
                ? 'timeout'
                : fallbackReason(this.ctx.lanRooms.get(entry.roomId), seat, timeout);
        }
        const nextState = applyDoudizhuAction({ state: entry.state, seat, action });
        const outcome = {
            historyIndex: nextState.history.length - 1,
            afterStateVersion: nextState.version,
            seat,
            source,
            ...(reason === undefined ? {} : { fallbackReason: reason }),
        };
        await this.persistActionCommitted(entry, requestId, action, nextState, outcome);
        entry.state = nextState;
        entry.decisionOutcomes.push(outcome);
        this.notify(entry);
        if (entry.state.phase !== 'finished')
            this.publish(entry, 'running');
    }
    async createDurableMatch(entry, room, deal) {
        const persistence = this.ctx.get('lanGamePersistence');
        if (persistence === undefined)
            return;
        const at = new Date();
        const event = {
            type: 'deal-started', seq: 0, at: at.toISOString(), round: entry.round, deal: entry.deal,
            deck: [...deal.deck], biddingStarter: deal.biddingStarter,
        };
        const record = {
            schemaVersion: 1,
            game: 'doudizhu',
            rulesetVersion: 1,
            recordRevision: 0,
            authorityEpoch: 0,
            createdAt: at.toISOString(),
            updatedAt: at.toISOString(),
            expiresAt: new Date(at.getTime() + 24 * 60 * 60 * 1_000).toISOString(),
            room: persistedRoom(room, resumeTokens(this.ctx.lanRoomTransport, room.id)),
            config: { ...this.config },
            events: [event],
            checkpoint: this.checkpoint(entry, event.seq, deal.state, []),
        };
        const created = await persistence.create(record);
        entry.recordRevision = created.recordRevision;
    }
    async persistDealStarted(entry, deal) {
        await this.updateDurable(entry, (record, at) => {
            const event = {
                type: 'deal-started', seq: nextEventSeq(record), at, round: entry.round, deal: entry.deal,
                deck: [...deal.deck], biddingStarter: deal.biddingStarter,
            };
            return {
                ...record,
                updatedAt: at,
                room: this.currentPersistedRoom(entry),
                events: [...record.events, event],
                checkpoint: this.checkpoint(entry, event.seq, deal.state, []),
                pendingDecision: undefined,
            };
        });
    }
    async persistDecisionRequested(entry, requestId, seat, requestedAt, deadlineAt, recoveredPending) {
        await this.updateDurable(entry, (record, at) => {
            const events = [...record.events];
            if (recoveredPending !== undefined) {
                events.push({
                    type: 'decision-abandoned',
                    seq: nextEventSeq(events),
                    at,
                    requestId: recoveredPending.requestId,
                    reason: 'superseded',
                });
            }
            const event = {
                type: 'decision-requested',
                seq: nextEventSeq(events),
                at,
                requestId,
                attempt: (recoveredPending?.attempt ?? 0) + 1,
                seat,
                stateVersion: entry.state.version,
                requestedAt: requestedAt.toISOString(),
                deadlineAt: deadlineAt.toISOString(),
            };
            return {
                ...record,
                updatedAt: at,
                room: this.currentPersistedRoom(entry),
                events: [...events, event],
                checkpoint: this.checkpoint(entry, event.seq, entry.state, entry.decisionOutcomes),
                pendingDecision: {
                    requestId,
                    attempt: event.attempt,
                    seat,
                    stateVersion: entry.state.version,
                    requestedAt: requestedAt.toISOString(),
                    deadlineAt: deadlineAt.toISOString(),
                },
            };
        });
    }
    async persistActionCommitted(entry, requestId, action, nextState, outcome) {
        await this.updateDurable(entry, (record, at) => {
            const events = [...record.events];
            if (outcome.source === 'fallback') {
                events.push({
                    type: 'decision-abandoned',
                    seq: nextEventSeq(events),
                    at,
                    requestId,
                    reason: outcome.fallbackReason ?? 'transport-error',
                });
            }
            const event = {
                type: 'action-committed',
                seq: nextEventSeq(events),
                at,
                requestId,
                seat: outcome.seat,
                beforeStateVersion: entry.state.version,
                action: persistedAction(action),
                source: outcome.source,
                ...(outcome.fallbackReason === undefined ? {} : { fallbackReason: outcome.fallbackReason }),
                afterStateVersion: nextState.version,
            };
            events.push(event);
            return {
                ...record,
                updatedAt: at,
                room: this.currentPersistedRoom(entry),
                events,
                checkpoint: this.checkpoint(entry, event.seq, nextState, [...entry.decisionOutcomes, outcome]),
                pendingDecision: undefined,
            };
        });
    }
    async persistRoundFinished(entry, result, totalScores, roundResults) {
        await this.updateDurable(entry, (record, at) => {
            const event = {
                type: 'round-finished', seq: nextEventSeq(record), at, round: entry.round,
                result: persistedResult(result), totalScores: [...totalScores],
            };
            return {
                ...record,
                updatedAt: at,
                room: this.currentPersistedRoom(entry),
                events: [...record.events, event],
                checkpoint: this.checkpoint(entry, event.seq, entry.state, entry.decisionOutcomes, totalScores, roundResults),
            };
        });
    }
    async persistMatchFinished(entry) {
        await this.updateDurable(entry, (record, at) => {
            const currentRoom = this.currentPersistedRoom(entry);
            const event = {
                type: 'match-finished', seq: nextEventSeq(record), at,
                totalScores: [...entry.totalScores],
                roundResults: entry.roundResults.map(persistedResult),
            };
            return {
                ...record,
                updatedAt: at,
                finishedAt: at,
                room: {
                    ...currentRoom,
                    revision: currentRoom.revision + 1,
                    phase: 'finished',
                    result: compactResult(entry),
                },
                events: [...record.events, event],
                checkpoint: this.checkpoint(entry, event.seq, entry.state, entry.decisionOutcomes),
            };
        });
    }
    async updateDurable(entry, transform) {
        const persistence = this.ctx.get('lanGamePersistence');
        if (persistence === undefined)
            return;
        if (entry.recordRevision === undefined)
            throw new Error('durable LAN match has no record revision');
        const updated = await persistence.update(entry.roomId, {
            expectedRecordRevision: entry.recordRevision,
            expectedCheckpointStateVersion: entry.state.version,
        }, record => transform(record, new Date().toISOString()));
        entry.recordRevision = updated.recordRevision;
    }
    checkpoint(entry, asOfSeq, state, decisionOutcomes, totalScores = entry.totalScores, roundResults = entry.roundResults) {
        return {
            asOfSeq,
            round: entry.round,
            deal: entry.deal,
            state: persistedState(state),
            totalScores: [...totalScores],
            roundResults: roundResults.map(persistedResult),
            decisionOutcomes: decisionOutcomes.map(outcome => ({ ...outcome })),
        };
    }
    currentPersistedRoom(entry) {
        const room = this.ctx.lanRooms.get(entry.roomId);
        if (room === undefined)
            throw new Error(`room ${JSON.stringify(entry.roomId)} disappeared before durable commit`);
        return persistedRoom(room, resumeTokens(this.ctx.lanRoomTransport, room.id));
    }
    recoverableRecord(room) {
        const record = this.ctx.get('lanGamePersistence')?.get(room.id);
        if (record === undefined)
            return undefined;
        if (record.finishedAt !== undefined || record.closedAt !== undefined)
            return undefined;
        if (record.checkpoint.asOfSeq !== record.events.at(-1)?.seq) {
            throw new Error(`durable match ${JSON.stringify(room.id)} checkpoint is not at the event-log tail`);
        }
        if (JSON.stringify(record.config) !== JSON.stringify(this.config)) {
            throw new Error(`durable match ${JSON.stringify(room.id)} config differs from the active runtime`);
        }
        if (!sameRoomIdentity(record.room, room)) {
            throw new Error(`durable match ${JSON.stringify(room.id)} does not match the restored room`);
        }
        return record;
    }
    publish(entry, status) {
        const pendingSeat = decisionSeat(entry.state);
        const snapshot = {
            game: 'doudizhu',
            status,
            round: entry.round,
            totalRounds: this.config.roundsPerMatch,
            deal: entry.deal,
            totalScores: [...entry.totalScores],
            roundResults: entry.roundResults.map(result => ({ ...result, scores: [...result.scores] })),
            ...(pendingSeat === undefined ? {} : { decisionSeat: pendingSeat }),
            decisionOutcomes: entry.decisionOutcomes.map(outcome => ({ ...outcome })),
            state: doudizhuPublicView(entry.state),
        };
        this.ctx.lanRoomTransport.publishGameSnapshot(entry.roomId, json(snapshot));
        for (const member of entry.members) {
            const seat = member.seat;
            this.ctx.lanRoomTransport.publishPrivateGameSnapshot(entry.roomId, LanMemberId(member.id), json(doudizhuPrivateView(entry.state, seat)));
        }
    }
    publishFailure(roomId, error) {
        this.ctx.lanRoomTransport.publishGameSnapshot(roomId, json({ game: 'doudizhu', status: 'failed', error }));
    }
    finishRoom(roomId, result) {
        const room = this.ctx.lanRooms.get(roomId);
        if (room?.phase !== 'running')
            return;
        this.ctx.lanRooms.finish({
            roomId,
            coordinatorId: room.coordinatorId,
            expectedRevision: room.revision,
            result: result.slice(0, 256),
        });
    }
    notify(entry, kind = 'updated') {
        const game = {
            roomId: entry.roomId,
            stateVersion: entry.state.version,
            phase: entry.state.phase,
        };
        for (const listener of this.listeners)
            listener({ kind, game });
    }
}
function freshDeal() {
    const deck = shuffleDoudizhuDeck(() => randomInt(0, 0x1_0000_0000) / 0x1_0000_0000);
    const biddingStarter = randomInt(0, 3);
    return { deck, biddingStarter, state: createDoudizhuGame({ deck, biddingStarter }) };
}
function persistedRoom(room, resumeTokens = {}) {
    return {
        id: room.id,
        code: room.code,
        revision: room.revision,
        phase: room.phase,
        coordinatorId: room.coordinatorId,
        maxMembers: room.maxMembers,
        members: room.members.map(member => ({
            ...member,
            ...(resumeTokens[member.id] === undefined ? {} : { resumeToken: resumeTokens[member.id] }),
        })),
        ...(room.result === undefined ? {} : { result: room.result }),
    };
}
class DecisionDeadlineExpired extends Error {
}
function recoveredState(state) {
    return JSON.parse(JSON.stringify(state));
}
function recoveredEntry(room, record) {
    return {
        roomId: room.id,
        members: room.members.map(member => ({ ...member })),
        abort: new AbortController(),
        state: recoveredState(record.checkpoint.state),
        round: record.checkpoint.round,
        deal: record.checkpoint.deal,
        totalScores: [...record.checkpoint.totalScores],
        roundResults: record.checkpoint.roundResults.map(recoveredResult),
        decisionOutcomes: record.checkpoint.decisionOutcomes.map(outcome => ({
            historyIndex: outcome.historyIndex,
            afterStateVersion: outcome.afterStateVersion,
            seat: outcome.seat,
            source: outcome.source,
            ...(outcome.fallbackReason === undefined ? {} : { fallbackReason: outcome.fallbackReason }),
        })),
        recordRevision: record.recordRevision,
        done: Promise.resolve(),
    };
}
function recoveredResult(result) {
    return { ...result, scores: [...result.scores] };
}
function sameRoomIdentity(record, room) {
    return record.id === room.id
        && record.code === room.code
        && record.revision === room.revision
        && record.phase === room.phase
        && record.coordinatorId === room.coordinatorId
        && record.maxMembers === room.maxMembers
        && record.members.length === room.members.length
        && record.members.every((member, index) => {
            const current = room.members[index];
            return current !== undefined && member.id === current.id && member.seat === current.seat;
        });
}
function resumeTokens(transport, roomId) {
    const candidate = transport;
    return candidate.resumeTokens?.(roomId) ?? {};
}
function nextEventSeq(recordOrEvents) {
    const events = 'events' in recordOrEvents ? recordOrEvents.events : recordOrEvents;
    return (events.at(-1)?.seq ?? -1) + 1;
}
function persistedAction(action) {
    if (action.type === 'play')
        return { type: 'play', cards: [...action.cards] };
    if (action.type === 'bid')
        return { type: 'bid', score: action.score };
    return { type: 'pass' };
}
function persistedResult(result) {
    return { ...result, scores: [...result.scores] };
}
function persistedState(state) {
    return JSON.parse(JSON.stringify(state));
}
function currentSeat(state) {
    if (state.phase === 'bidding')
        return state.bidder;
    if (state.phase === 'playing' && state.currentSeat !== undefined)
        return state.currentSeat;
    throw new DoudizhuError(`phase ${state.phase} has no decision seat`, 'DOUDIZHU_INVALID_STATE');
}
function decisionSeat(state) {
    if (state.phase === 'bidding')
        return state.bidder;
    if (state.phase === 'playing')
        return state.currentSeat;
    return undefined;
}
function fallbackReason(room, seat, timeout) {
    if (timeout.aborted)
        return 'timeout';
    if (room?.members.find(member => member.seat === seat)?.connected === false)
        return 'disconnected';
    return 'transport-error';
}
function parseAction(value) {
    if (!record(value) || typeof value.type !== 'string')
        throw new Error('decision action must be an object with type');
    if (value.type === 'pass')
        return { type: 'pass' };
    if (value.type === 'bid' && (value.score === 0 || value.score === 1 || value.score === 2 || value.score === 3)) {
        return { type: 'bid', score: value.score };
    }
    if (value.type === 'play' && Array.isArray(value.cards) && value.cards.every(card => typeof card === 'string')) {
        return { type: 'play', cards: value.cards.map(card => DoudizhuCardId(card)) };
    }
    throw new Error('decision action is not a supported bid, play, or pass');
}
/**
 * Choose a deliberately small timeout fallback without trying to replace the model's strategy.
 * Passing remains the default, except when the previous opponent is within two cards of winning;
 * then the lowest enumerated legal response is used to keep the game alive.
 * @param view - authoritative seat-private state and ordered legal actions.
 * @returns one legal action already enumerated by the rules engine.
 */
export function doudizhuFallbackAction(view) {
    const pass = view.legalActions.find(action => action.type === 'pass');
    if (pass === undefined) {
        return view.legalActions[0] ?? (() => { throw new Error('current seat has no legal fallback action'); })();
    }
    const previousSeat = view.lastPlay?.seat;
    const landlord = view.landlord;
    const previousIsOpponent = previousSeat !== undefined && landlord !== undefined
        && (view.yourSeat === landlord ? previousSeat !== landlord : previousSeat === landlord);
    if (previousIsOpponent && view.cardCounts[previousSeat] <= 2) {
        return view.legalActions.find(action => action.type !== 'pass') ?? pass;
    }
    return pass;
}
function compactResult(entry) {
    return JSON.stringify({ rounds: entry.roundResults.length, scores: entry.totalScores });
}
function json(value) {
    const parsed = JSON.parse(JSON.stringify(value));
    return parsed;
}
function record(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
function positiveInteger(value, field) {
    if (!Number.isSafeInteger(value) || value < 1)
        throw new Error(`${field} must be a positive safe integer`);
    return value;
}
function nonNegativeInteger(value, field) {
    if (!Number.isSafeInteger(value) || value < 0)
        throw new Error(`${field} must be a non-negative safe integer`);
    return value;
}
function abortableDelay(milliseconds, signal) {
    if (milliseconds === 0)
        return Promise.resolve();
    return new Promise((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer);
            reject(signal.reason instanceof Error ? signal.reason : new Error('round pause aborted'));
        };
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, milliseconds);
        signal.addEventListener('abort', onAbort, { once: true });
        if (signal.aborted)
            onAbort();
    });
}
//# sourceMappingURL=index.js.map