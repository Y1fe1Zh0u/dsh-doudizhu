/** Canonical deck, card lookup, ordering, and injected shuffle utilities. */
import { DoudizhuCardId, } from "./types.js";
/** Rank order from the lowest three through the big joker. */
export const DOUDIZHU_RANKS = [
    '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', 'SJ', 'BJ',
];
const SUITS = [
    ['C', 'clubs'], ['D', 'diamonds'], ['H', 'hearts'], ['S', 'spades'],
];
/** Canonical 54-card deck in stable rank/suit order. */
export const DOUDIZHU_DECK = Object.freeze([
    ...DOUDIZHU_RANKS.slice(0, 13).flatMap(rank => SUITS.map(([prefix, suit]) => ({
        id: DoudizhuCardId(`${prefix}${rank}`),
        rank,
        suit,
    }))),
    { id: DoudizhuCardId('joker-small'), rank: 'SJ' },
    { id: DoudizhuCardId('joker-big'), rank: 'BJ' },
]);
const CARDS = new Map(DOUDIZHU_DECK.map(card => [card.id, card]));
const RANK_INDEX = new Map(DOUDIZHU_RANKS.map((rank, index) => [rank, index]));
/**
 * Resolve a canonical physical card.
 * @param id - exact canonical card identity.
 * @returns immutable card metadata.
 */
export function doudizhuCard(id) {
    const card = CARDS.get(id);
    if (card === undefined)
        throw new Error(`unknown DouDizhu card ${JSON.stringify(id)}`);
    return card;
}
/**
 * Return one rank's numeric comparison index.
 * @param rank - canonical strength rank.
 * @returns zero-based low-to-high index.
 */
export function doudizhuRankIndex(rank) {
    const index = RANK_INDEX.get(rank);
    if (index === undefined)
        throw new Error(`unknown DouDizhu rank ${JSON.stringify(rank)}`);
    return index;
}
/**
 * Sort physical identities by strength and stable id.
 * @param cards - canonical physical identities.
 * @returns detached sorted identities.
 */
export function sortDoudizhuCards(cards) {
    return [...cards].sort((left, right) => {
        const rank = doudizhuRankIndex(doudizhuCard(left).rank) - doudizhuRankIndex(doudizhuCard(right).rank);
        return rank === 0 ? left.localeCompare(right) : rank;
    });
}
/**
 * Validate one exact permutation of the canonical deck.
 * @param deck - candidate physical-card order.
 */
export function validateDoudizhuDeck(deck) {
    if (deck.length !== DOUDIZHU_DECK.length)
        throw new Error('DouDizhu deck must contain exactly 54 cards');
    const ids = new Set(deck);
    if (ids.size !== deck.length)
        throw new Error('DouDizhu deck contains duplicate cards');
    for (const card of DOUDIZHU_DECK) {
        if (!ids.has(card.id))
            throw new Error(`DouDizhu deck is missing ${card.id}`);
    }
}
/**
 * Deterministically shuffle the canonical deck through an injected random source.
 * @param random - returns a finite number in the half-open range [0, 1).
 * @returns shuffled canonical card identities.
 */
export function shuffleDoudizhuDeck(random) {
    const deck = DOUDIZHU_DECK.map(card => card.id);
    for (let index = deck.length - 1; index > 0; index -= 1) {
        const sample = random();
        if (!Number.isFinite(sample) || sample < 0 || sample >= 1)
            throw new Error('DouDizhu random source must return values in [0, 1)');
        const target = Math.floor(sample * (index + 1));
        const held = required(deck[index], 'shuffle source');
        deck[index] = required(deck[target], 'shuffle target');
        deck[target] = held;
    }
    return deck;
}
function required(value, label) {
    if (value === undefined)
        throw new Error(`DouDizhu internal invariant failed: missing ${label}`);
    return value;
}
//# sourceMappingURL=cards.js.map