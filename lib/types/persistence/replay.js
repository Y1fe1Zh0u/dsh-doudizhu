/** Pure event replay and checkpoint validation for durable DouDizhu matches. */
import { applyDoudizhuAction, createDoudizhuGame, validateDoudizhuState, } from "../doudizhu/index.js";
import { matchCheckpointSchema, pendingDecisionSchema, } from "./spec.js";
/** Replay failure with the offending durable event sequence when known. */
export class LanGameReplayError extends Error {
    seq;
    /** Stable machine-readable error code. */
    code = 'LAN_GAME_REPLAY_INVALID';
    constructor(message, seq) {
        super(seq === undefined ? message : `event ${seq}: ${message}`);
        this.seq = seq;
        this.name = 'LanGameReplayError';
    }
}
/**
 * Rebuild one match from its first deal through an inclusive event sequence.
 * No storage or clock is consulted, so callers can use it for recovery,
 * migration audits, and tests with identical results.
 *
 * @param events - Complete durable event stream in sequence order.
 * @param asOfSeq - Optional inclusive event sequence at which replay stops.
 * @returns The deterministic match projection at the requested sequence.
 */
export function replayMatchEvents(events, asOfSeq) {
    const first = events[0];
    const last = events.at(-1);
    if (first === undefined || last === undefined)
        throw new LanGameReplayError('match event log is empty');
    assertSequence(events);
    const target = asOfSeq ?? last.seq;
    if (!Number.isSafeInteger(target) || target < first.seq || target > last.seq) {
        throw new LanGameReplayError(`checkpoint sequence ${String(target)} is outside the event log`);
    }
    if (!events.some(event => event.seq === target)) {
        throw new LanGameReplayError(`checkpoint sequence ${target} is absent from the event log`);
    }
    let state;
    let round = 0;
    let deal = 0;
    let totalScores = [0, 0, 0];
    const roundResults = [];
    let decisionOutcomes = [];
    let pendingDecision;
    const requested = new Set();
    let matchFinished = false;
    let roomClosed = false;
    for (const event of events) {
        if (event.seq > target)
            break;
        try {
            switch (event.type) {
                case 'deal-started': {
                    if (state !== undefined) {
                        const isRedeal = state.phase === 'redeal' && event.round === round && event.deal === deal + 1;
                        const isNextRound = state.phase === 'finished'
                            && roundResults.length === round
                            && event.round === round + 1
                            && event.deal === 1;
                        if (!isRedeal && !isNextRound)
                            throw new Error('deal does not follow redeal or settled round');
                    }
                    else if (event.round !== 1 || event.deal !== 1) {
                        throw new Error('first deal must be round 1 deal 1');
                    }
                    state = createDoudizhuGame({ deck: event.deck, biddingStarter: event.biddingStarter });
                    round = event.round;
                    deal = event.deal;
                    decisionOutcomes = [];
                    pendingDecision = undefined;
                    requested.clear();
                    break;
                }
                case 'decision-requested': {
                    const current = requireState(state);
                    if (pendingDecision !== undefined)
                        throw new Error('a second decision was requested while one is pending');
                    if (event.stateVersion !== current.version)
                        throw new Error('decision stateVersion does not match replay state');
                    if (event.seat !== decisionSeat(current))
                        throw new Error('decision seat is not the current seat');
                    if (requested.has(event.requestId))
                        throw new Error('decision requestId is reused in the deal');
                    requested.add(event.requestId);
                    pendingDecision = pendingDecisionSchema.parse({
                        requestId: event.requestId,
                        attempt: event.attempt,
                        seat: event.seat,
                        stateVersion: event.stateVersion,
                        requestedAt: event.requestedAt,
                        deadlineAt: event.deadlineAt,
                    });
                    break;
                }
                case 'decision-abandoned':
                    if (!requested.has(event.requestId))
                        throw new Error('abandoned decision was never requested');
                    if (pendingDecision?.requestId === event.requestId)
                        pendingDecision = undefined;
                    break;
                case 'action-committed': {
                    const current = requireState(state);
                    if (!requested.has(event.requestId))
                        throw new Error('action decision was never requested');
                    if (event.beforeStateVersion !== current.version)
                        throw new Error('beforeStateVersion does not match replay state');
                    if (event.seat !== decisionSeat(current))
                        throw new Error('action seat is not the current seat');
                    if (event.source === 'fallback' && event.fallbackReason === undefined) {
                        throw new Error('fallback action is missing fallbackReason');
                    }
                    if (event.source === 'agent' && event.fallbackReason !== undefined) {
                        throw new Error('agent action must not carry fallbackReason');
                    }
                    state = applyDoudizhuAction({
                        state: current,
                        seat: event.seat,
                        action: event.action,
                    });
                    if (event.afterStateVersion !== state.version)
                        throw new Error('afterStateVersion does not match replay state');
                    decisionOutcomes = [
                        ...decisionOutcomes,
                        {
                            historyIndex: state.history.length - 1,
                            afterStateVersion: state.version,
                            seat: event.seat,
                            source: event.source,
                            ...(event.fallbackReason === undefined ? {} : { fallbackReason: event.fallbackReason }),
                        },
                    ];
                    if (pendingDecision?.requestId === event.requestId)
                        pendingDecision = undefined;
                    break;
                }
                case 'round-finished': {
                    const current = requireState(state);
                    if (current.phase !== 'finished' || current.result === undefined)
                        throw new Error('round finished before engine settlement');
                    if (event.round !== round)
                        throw new Error('round-finished round does not match active round');
                    if (!sameJson(event.result, current.result))
                        throw new Error('round-finished result does not match replay result');
                    if (roundResults.length !== round - 1)
                        throw new Error('round-finished is duplicated or out of order');
                    roundResults.push(current.result);
                    totalScores = addScores(totalScores, current.result.scores);
                    if (!sameJson(event.totalScores, totalScores))
                        throw new Error('round-finished totalScores do not match replay totals');
                    break;
                }
                case 'match-finished':
                    if (roundResults.length === 0)
                        throw new Error('match finished without a settled round');
                    if (!sameJson(event.totalScores, totalScores))
                        throw new Error('match-finished totalScores do not match replay totals');
                    if (!sameJson(event.roundResults, roundResults))
                        throw new Error('match-finished roundResults do not match replay results');
                    matchFinished = true;
                    break;
                case 'room-closed':
                    roomClosed = true;
                    pendingDecision = undefined;
                    break;
            }
        }
        catch (error) {
            if (error instanceof LanGameReplayError)
                throw error;
            throw new LanGameReplayError(messageOf(error), event.seq);
        }
    }
    const finalState = requireState(state);
    const stateFailures = validateDoudizhuState(finalState);
    if (stateFailures.length > 0)
        throw new LanGameReplayError(stateFailures.join('; '), target);
    const checkpoint = matchCheckpointSchema.parse({
        asOfSeq: target,
        round,
        deal,
        state: finalState,
        totalScores,
        roundResults,
        decisionOutcomes,
    });
    return {
        checkpoint,
        ...(pendingDecision === undefined ? {} : { pendingDecision }),
        matchFinished,
        roomClosed,
    };
}
/**
 * Return checkpoint mismatches without mutating or throwing for ordinary invalid input.
 *
 * @param events - Durable events used to reconstruct the checkpoint.
 * @param checkpoint - Persisted checkpoint to compare with deterministic replay.
 * @returns Human-readable invariant failures, or an empty array when valid.
 */
export function validateMatchCheckpoint(events, checkpoint) {
    try {
        const replayed = replayMatchEvents(events, checkpoint.asOfSeq).checkpoint;
        return sameJson(replayed, checkpoint) ? [] : ['checkpoint does not equal deterministic event replay'];
    }
    catch (error) {
        return [messageOf(error)];
    }
}
/**
 * Validate record identity, replay, checkpoint, terminal fields, and pending-decision recovery state.
 *
 * @param record - Durable match record to validate.
 * @param roomId - Expected storage key for the match record.
 * @returns Human-readable invariant failures, or an empty array when valid.
 */
export function validateMatchRecord(record, roomId = record.room.id) {
    const failures = [];
    if (record.room.id !== roomId)
        failures.push('matches table key must equal room.id');
    failures.push(...validateMatchCheckpoint(record.events, record.checkpoint));
    try {
        const replayed = replayMatchEvents(record.events);
        if (!sameJson(replayed.pendingDecision, record.pendingDecision)) {
            failures.push('pendingDecision does not equal the latest event replay state');
        }
        if (record.finishedAt !== undefined && !replayed.matchFinished) {
            failures.push('finishedAt requires a match-finished event');
        }
        if (record.closedAt !== undefined && !replayed.roomClosed) {
            failures.push('closedAt requires a room-closed event');
        }
    }
    catch (error) {
        failures.push(messageOf(error));
    }
    if (record.closedAt !== undefined) {
        if (record.pendingDecision !== undefined)
            failures.push('closed record must not retain pendingDecision');
        if (record.room.members.some(member => member.resumeToken !== undefined)) {
            failures.push('closed record must not retain member resume tokens');
        }
    }
    return [...new Set(failures)];
}
function assertSequence(events) {
    let previous;
    for (const event of events) {
        if (previous !== undefined && event.seq !== previous.seq + 1) {
            throw new LanGameReplayError('event sequences must be contiguous', event.seq);
        }
        previous = event;
    }
}
function requireState(state) {
    if (state === undefined)
        throw new Error('event requires an earlier deal-started event');
    return state;
}
function decisionSeat(state) {
    if (state.phase === 'bidding')
        return state.bidder;
    if (state.phase === 'playing' && state.currentSeat !== undefined)
        return state.currentSeat;
    throw new Error(`phase ${state.phase} has no decision seat`);
}
function addScores(left, right) {
    return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}
function sameJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=replay.js.map