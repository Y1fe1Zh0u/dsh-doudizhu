/** Canonical deck, card lookup, ordering, and injected shuffle utilities. */
import { DoudizhuCardId, type DoudizhuCard, type DoudizhuRank } from './types.ts';
/** Rank order from the lowest three through the big joker. */
export declare const DOUDIZHU_RANKS: readonly ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2", "SJ", "BJ"];
/** Canonical 54-card deck in stable rank/suit order. */
export declare const DOUDIZHU_DECK: readonly DoudizhuCard[];
/**
 * Resolve a canonical physical card.
 * @param id - exact canonical card identity.
 * @returns immutable card metadata.
 */
export declare function doudizhuCard(id: DoudizhuCardId): DoudizhuCard;
/**
 * Return one rank's numeric comparison index.
 * @param rank - canonical strength rank.
 * @returns zero-based low-to-high index.
 */
export declare function doudizhuRankIndex(rank: DoudizhuRank): number;
/**
 * Sort physical identities by strength and stable id.
 * @param cards - canonical physical identities.
 * @returns detached sorted identities.
 */
export declare function sortDoudizhuCards(cards: readonly DoudizhuCardId[]): DoudizhuCardId[];
/**
 * Validate one exact permutation of the canonical deck.
 * @param deck - candidate physical-card order.
 */
export declare function validateDoudizhuDeck(deck: readonly DoudizhuCardId[]): void;
/**
 * Deterministically shuffle the canonical deck through an injected random source.
 * @param random - returns a finite number in the half-open range [0, 1).
 * @returns shuffled canonical card identities.
 */
export declare function shuffleDoudizhuDeck(random: () => number): DoudizhuCardId[];
//# sourceMappingURL=cards.d.ts.map