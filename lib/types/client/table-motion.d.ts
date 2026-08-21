/** Snapshot-diffed motion events for the DouDizhu table. */
import type { DoudizhuCardId, DoudizhuPublicView, DoudizhuResult, DoudizhuSeat } from '../doudizhu/client.ts';
import type { DoudizhuTableSnapshot } from '../doudizhu-runtime/client.ts';
type RunningSnapshot = Exclude<DoudizhuTableSnapshot, {
    readonly status: 'failed';
}>;
/** One short-lived presentation event. No event is required for game correctness. */
export type TableMotionEvent = {
    readonly key: string;
    readonly kind: 'deal';
} | {
    readonly key: string;
    readonly kind: 'pass';
    readonly seat: DoudizhuSeat;
} | {
    readonly key: string;
    readonly kind: 'trick-reset';
} | {
    readonly key: string;
    readonly kind: 'play';
    readonly seat: DoudizhuSeat;
    readonly cards: readonly DoudizhuCardId[];
} | {
    readonly key: string;
    readonly kind: 'impact';
    readonly impact: 'bomb' | 'rocket';
} | {
    readonly key: string;
    readonly kind: 'settlement';
    readonly final: boolean;
    readonly round: number;
    readonly result?: DoudizhuResult;
};
type TableRoomPhase = 'lobby' | 'locked' | 'running' | 'finished';
/**
 * Derive presentation events from two committed snapshots.
 * Replaced/non-prefix histories are treated as hydration, never replayed.
 *
 * @param previous - Previously committed playable snapshot.
 * @param current - Newly committed playable snapshot.
 * @returns Presentation events needed to animate the transition.
 */
export declare function diffTableMotion(previous: RunningSnapshot, current: RunningSnapshot): readonly TableMotionEvent[];
/**
 * Stable identity for recent-action rows, including repeated identical actions.
 *
 * @param history - Public action history containing the row.
 * @param index - Zero-based index of the row to identify.
 * @returns A signature with an occurrence suffix unique within the history.
 */
export declare function historyEntryKey(history: DoudizhuPublicView['history'], index: number): string;
/**
 * Keep at most four logical actions; beyond that, hydrate instead of playing catch-up.
 *
 * @param queued - Presentation events already waiting to run.
 * @param incoming - Newly derived presentation events.
 * @returns The bounded event queue, or only the latest settlement when overloaded.
 */
export declare function appendMotionEvents(queued: readonly TableMotionEvent[], incoming: readonly TableMotionEvent[]): readonly TableMotionEvent[];
/**
 * Run committed events one at a time and flush all animation work while hidden.
 *
 * @param snapshot - Latest table snapshot, when one has been received.
 * @param roomPhase - Current room lifecycle phase used to detect the initial deal.
 * @returns Current motion presentation state for the table renderer.
 */
export declare function useTableMotion(snapshot: DoudizhuTableSnapshot | undefined, roomPhase: TableRoomPhase): {
    readonly event: TableMotionEvent | undefined;
    readonly finalSettlement: Extract<TableMotionEvent, {
        readonly kind: 'settlement';
    }> | undefined;
    readonly hideLastPlay: boolean;
    readonly reducedMotion: boolean;
};
export {};
//# sourceMappingURL=table-motion.d.ts.map