/** Pure game creation, state transitions, settlement, and seat-private projection. */
import type { ApplyDoudizhuActionRequest, CreateDoudizhuRequest, DoudizhuPrivateView, DoudizhuPublicView, DoudizhuSeat, DoudizhuState } from './types.ts';
/**
 * Create one dealt bidding state from an injected exact deck permutation.
 * @param request - validated deck order and bidding starter.
 * @returns initial immutable bidding state.
 */
export declare function createDoudizhuGame(request: CreateDoudizhuRequest): DoudizhuState;
/**
 * Build the public game projection with no private hand identities.
 * @param state - complete coordinator state.
 * @returns detached public projection.
 */
export declare function doudizhuPublicView(state: DoudizhuState): DoudizhuPublicView;
/**
 * Apply one current-seat bid, play, or pass.
 * @param request - state, addressed seat, and proposed action.
 * @returns detached validated next state.
 */
export declare function applyDoudizhuAction(request: ApplyDoudizhuActionRequest): DoudizhuState;
/**
 * Build the only state and legal actions one seat may receive.
 * @param state - complete coordinator state.
 * @param seat - addressed private seat.
 * @returns detached seat-private projection.
 */
export declare function doudizhuPrivateView(state: DoudizhuState, seat: DoudizhuSeat): DoudizhuPrivateView;
/**
 * Return invariant failures without changing the supplied state.
 * @param state - candidate typed engine state.
 * @returns diagnostics; empty means every relationship holds.
 */
export declare function validateDoudizhuState(state: DoudizhuState): string[];
//# sourceMappingURL=engine.d.ts.map