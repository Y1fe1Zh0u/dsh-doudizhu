/** Public runtime projections for coordinator-owned DouDizhu matches. */
import type { DoudizhuPublicView, DoudizhuResult } from '../doudizhu/client.ts';
/** Why the coordinator replaced a model decision with a deterministic legal fallback. */
export type DoudizhuFallbackReason = 'timeout' | 'disconnected' | 'invalid-response' | 'transport-error';
/** Public provenance aligned to one committed entry in the current deal history. */
export interface DoudizhuDecisionOutcome {
    readonly historyIndex: number;
    readonly afterStateVersion: number;
    readonly seat: 0 | 1 | 2;
    readonly source: 'agent' | 'fallback';
    readonly fallbackReason?: DoudizhuFallbackReason;
}
/** Public multi-round match values shared by running and settled snapshots. */
export interface DoudizhuMatchPublicView {
    readonly round: number;
    readonly totalRounds: number;
    /** One-based deal epoch inside this round; increments after every all-pass redeal. */
    readonly deal: number;
    readonly totalScores: readonly [number, number, number];
    readonly roundResults: readonly DoudizhuResult[];
    /** Seat whose decision is currently pending, absent only outside bidding/playing. */
    readonly decisionSeat?: 0 | 1 | 2;
    readonly decisionOutcomes: readonly DoudizhuDecisionOutcome[];
    readonly state: DoudizhuPublicView;
}
/** Public browser payload carried by the generic LAN room transport. */
export type DoudizhuTableSnapshot = ({
    readonly game: 'doudizhu';
    readonly status: 'running' | 'round-finished' | 'finished';
} & DoudizhuMatchPublicView) | {
    readonly game: 'doudizhu';
    readonly status: 'failed';
    readonly error: string;
};
/** Current coordinator runtime row. */
export interface DoudizhuGameRuntimeView {
    readonly roomId: string;
    readonly stateVersion: number;
    readonly phase: 'bidding' | 'playing' | 'redeal' | 'finished';
}
/** Active-runtime change notification. */
export interface DoudizhuGameRuntimeChanged {
    readonly kind: 'updated' | 'removed';
    readonly game: DoudizhuGameRuntimeView;
}
//# sourceMappingURL=types.d.ts.map