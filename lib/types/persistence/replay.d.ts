/** Pure event replay and checkpoint validation for durable DouDizhu matches. */
import { type MatchCheckpoint, type MatchEvent, type MatchRecord, type PendingDecision } from './spec.ts';
/** Complete deterministic projection reconstructed from an event prefix. */
export interface MatchReplay {
    readonly checkpoint: MatchCheckpoint;
    readonly pendingDecision?: PendingDecision;
    readonly matchFinished: boolean;
    readonly roomClosed: boolean;
}
/** Replay failure with the offending durable event sequence when known. */
export declare class LanGameReplayError extends Error {
    readonly seq?: number | undefined;
    /** Stable machine-readable error code. */
    readonly code: "LAN_GAME_REPLAY_INVALID";
    constructor(message: string, seq?: number | undefined);
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
export declare function replayMatchEvents(events: readonly MatchEvent[], asOfSeq?: number): MatchReplay;
/**
 * Return checkpoint mismatches without mutating or throwing for ordinary invalid input.
 *
 * @param events - Durable events used to reconstruct the checkpoint.
 * @param checkpoint - Persisted checkpoint to compare with deterministic replay.
 * @returns Human-readable invariant failures, or an empty array when valid.
 */
export declare function validateMatchCheckpoint(events: readonly MatchEvent[], checkpoint: MatchCheckpoint): string[];
/**
 * Validate record identity, replay, checkpoint, terminal fields, and pending-decision recovery state.
 *
 * @param record - Durable match record to validate.
 * @param roomId - Expected storage key for the match record.
 * @returns Human-readable invariant failures, or an empty array when valid.
 */
export declare function validateMatchRecord(record: MatchRecord, roomId?: string): string[];
//# sourceMappingURL=replay.d.ts.map