/** Combination classification, comparison, and legal play enumeration. */
import type { DoudizhuAction, DoudizhuCardId, DoudizhuCombination, DoudizhuPlayRecord } from './types.ts';
/**
 * Classify one exact physical-card selection.
 * @param input - non-empty, duplicate-free canonical card identities.
 * @returns canonical combination, or null when the cards form no legal play.
 */
export declare function classifyDoudizhuCombination(input: readonly DoudizhuCardId[]): DoudizhuCombination | null;
/**
 * Decide whether one classified play beats the current play.
 * @param challenger - proposed classified play.
 * @param current - current trick play.
 * @returns true exactly when the challenger is legal over the current play.
 */
export declare function beatsDoudizhuCombination(challenger: DoudizhuCombination, current: DoudizhuCombination): boolean;
/**
 * Enumerate one canonical physical-card action for every legal rank multiset.
 * @param hand - current seat's private hand.
 * @param current - current trick play, absent when the seat leads.
 * @returns stable strength-ordered legal play actions plus pass when following.
 */
export declare function legalDoudizhuPlayActions(hand: readonly DoudizhuCardId[], current?: DoudizhuPlayRecord): DoudizhuAction[];
//# sourceMappingURL=combination.d.ts.map