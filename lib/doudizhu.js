//#region lib/types/doudizhu/types.js
/** Public immutable values for the deterministic three-player DouDizhu engine. */
/**
* Brand one validated canonical card identity.
* @param value - canonical physical card string.
* @returns the same value with the card-id brand.
*/
function DoudizhuCardId(value) {
	return value;
}
//#endregion
//#region lib/types/doudizhu/cards.js
/** Canonical deck, card lookup, ordering, and injected shuffle utilities. */
/** Rank order from the lowest three through the big joker. */
const DOUDIZHU_RANKS = [
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"J",
	"Q",
	"K",
	"A",
	"2",
	"SJ",
	"BJ"
];
const SUITS = [
	["C", "clubs"],
	["D", "diamonds"],
	["H", "hearts"],
	["S", "spades"]
];
/** Canonical 54-card deck in stable rank/suit order. */
const DOUDIZHU_DECK = Object.freeze([
	...DOUDIZHU_RANKS.slice(0, 13).flatMap((rank) => SUITS.map(([prefix, suit]) => ({
		id: DoudizhuCardId(`${prefix}${rank}`),
		rank,
		suit
	}))),
	{
		id: DoudizhuCardId("joker-small"),
		rank: "SJ"
	},
	{
		id: DoudizhuCardId("joker-big"),
		rank: "BJ"
	}
]);
const CARDS = new Map(DOUDIZHU_DECK.map((card) => [card.id, card]));
const RANK_INDEX = new Map(DOUDIZHU_RANKS.map((rank, index) => [rank, index]));
/**
* Resolve a canonical physical card.
* @param id - exact canonical card identity.
* @returns immutable card metadata.
*/
function doudizhuCard(id) {
	const card = CARDS.get(id);
	if (card === void 0) throw new Error(`unknown DouDizhu card ${JSON.stringify(id)}`);
	return card;
}
/**
* Return one rank's numeric comparison index.
* @param rank - canonical strength rank.
* @returns zero-based low-to-high index.
*/
function doudizhuRankIndex(rank) {
	const index = RANK_INDEX.get(rank);
	if (index === void 0) throw new Error(`unknown DouDizhu rank ${JSON.stringify(rank)}`);
	return index;
}
/**
* Sort physical identities by strength and stable id.
* @param cards - canonical physical identities.
* @returns detached sorted identities.
*/
function sortDoudizhuCards(cards) {
	return [...cards].sort((left, right) => {
		const rank = doudizhuRankIndex(doudizhuCard(left).rank) - doudizhuRankIndex(doudizhuCard(right).rank);
		return rank === 0 ? left.localeCompare(right) : rank;
	});
}
/**
* Validate one exact permutation of the canonical deck.
* @param deck - candidate physical-card order.
*/
function validateDoudizhuDeck(deck) {
	if (deck.length !== DOUDIZHU_DECK.length) throw new Error("DouDizhu deck must contain exactly 54 cards");
	const ids = new Set(deck);
	if (ids.size !== deck.length) throw new Error("DouDizhu deck contains duplicate cards");
	for (const card of DOUDIZHU_DECK) if (!ids.has(card.id)) throw new Error(`DouDizhu deck is missing ${card.id}`);
}
/**
* Deterministically shuffle the canonical deck through an injected random source.
* @param random - returns a finite number in the half-open range [0, 1).
* @returns shuffled canonical card identities.
*/
function shuffleDoudizhuDeck(random) {
	const deck = DOUDIZHU_DECK.map((card) => card.id);
	for (let index = deck.length - 1; index > 0; index -= 1) {
		const sample = random();
		if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error("DouDizhu random source must return values in [0, 1)");
		const target = Math.floor(sample * (index + 1));
		const held = required$2(deck[index], "shuffle source");
		deck[index] = required$2(deck[target], "shuffle target");
		deck[target] = held;
	}
	return deck;
}
function required$2(value, label) {
	if (value === void 0) throw new Error(`DouDizhu internal invariant failed: missing ${label}`);
	return value;
}
//#endregion
//#region lib/types/doudizhu/combination.js
/** Combination classification, comparison, and legal play enumeration. */
/**
* Classify one exact physical-card selection.
* @param input - non-empty, duplicate-free canonical card identities.
* @returns canonical combination, or null when the cards form no legal play.
*/
function classifyDoudizhuCombination(input) {
	if (input.length === 0 || new Set(input).size !== input.length) return null;
	let cards;
	try {
		cards = sortDoudizhuCards(input);
	} catch {
		return null;
	}
	const groups = rankGroups(cards);
	const counts = groups.map((group) => group.cards.length).sort((left, right) => right - left);
	if (cards.length === 2 && groups.length === 2 && groups.some((group) => group.rank === "SJ") && groups.some((group) => group.rank === "BJ")) return combination("rocket", cards, "BJ", 1);
	if (groups.length === 1) {
		const rank = required$1(groups[0], "single rank group").rank;
		if (cards.length === 1) return combination("single", cards, rank, 1);
		if (cards.length === 2 && rank !== "SJ" && rank !== "BJ") return combination("pair", cards, rank, 1);
		if (cards.length === 3) return combination("triple", cards, rank, 1);
		if (cards.length === 4) return combination("bomb", cards, rank, 1);
	}
	if (cards.length === 4 && counts.join(",") === "3,1") return bodyCombination("triple-single", cards, groups, 3);
	if (cards.length === 5 && counts.join(",") === "3,2") return bodyCombination("triple-pair", cards, groups, 3);
	if (cards.length >= 5 && groups.every((group) => group.cards.length === 1) && consecutive(groups, 5)) return combination("straight", cards, required$1(groups.at(-1), "straight tail").rank, groups.length);
	if (cards.length >= 6 && groups.every((group) => group.cards.length === 2) && consecutive(groups, 3)) return combination("pair-straight", cards, required$1(groups.at(-1), "pair-straight tail").rank, groups.length);
	for (const [kind, mode, unit] of [
		[
			"airplane",
			"none",
			3
		],
		[
			"airplane-single",
			"single",
			4
		],
		[
			"airplane-pair",
			"pair",
			5
		]
	]) {
		if (cards.length % unit !== 0) continue;
		const chainLength = cards.length / unit;
		if (chainLength < 2) continue;
		const primary = airplanePrimary(groups, chainLength, mode);
		if (primary !== void 0) return combination(kind, cards, primary, chainLength);
	}
	if (cards.length === 6 && counts[0] === 4) {
		const body = groups.find((group) => group.cards.length === 4);
		const wings = groups.filter((group) => group !== body);
		if (body !== void 0 && !containsRocket(wings) && wings.reduce((sum, group) => sum + group.cards.length, 0) === 2) return combination("four-two-single", cards, body.rank, 1);
	}
	if (cards.length === 8 && counts.join(",") === "4,2,2") return bodyCombination("four-two-pair", cards, groups, 4);
	return null;
}
/**
* Decide whether one classified play beats the current play.
* @param challenger - proposed classified play.
* @param current - current trick play.
* @returns true exactly when the challenger is legal over the current play.
*/
function beatsDoudizhuCombination(challenger, current) {
	if (challenger.kind === "rocket") return current.kind !== "rocket";
	if (current.kind === "rocket") return false;
	if (challenger.kind === "bomb" && current.kind !== "bomb") return true;
	if (current.kind === "bomb" && challenger.kind !== "bomb") return false;
	return challenger.kind === current.kind && challenger.cards.length === current.cards.length && challenger.chainLength === current.chainLength && doudizhuRankIndex(challenger.primaryRank) > doudizhuRankIndex(current.primaryRank);
}
/**
* Enumerate one canonical physical-card action for every legal rank multiset.
* @param hand - current seat's private hand.
* @param current - current trick play, absent when the seat leads.
* @returns stable strength-ordered legal play actions plus pass when following.
*/
function legalDoudizhuPlayActions(hand, current) {
	const groups = rankGroups(sortDoudizhuCards(hand));
	const byRank = new Map(groups.map((group) => [group.rank, group]));
	const plays = /* @__PURE__ */ new Map();
	const add = (cards) => {
		const sorted = sortDoudizhuCards(cards);
		const classified = classifyDoudizhuCombination(sorted);
		if (classified === null) return;
		if (current !== void 0 && !beatsDoudizhuCombination(classified, current.combination)) return;
		plays.set(sorted.join("\0"), {
			action: {
				type: "play",
				cards: sorted
			},
			combination: classified
		});
	};
	for (const group of groups) {
		add(group.cards.slice(0, 1));
		if (group.cards.length >= 2 && !isJoker(group.rank)) add(group.cards.slice(0, 2));
		if (group.cards.length >= 3) add(group.cards.slice(0, 3));
		if (group.cards.length === 4) add(group.cards);
	}
	const smallJoker = byRank.get("SJ");
	const bigJoker = byRank.get("BJ");
	if (smallJoker !== void 0 && bigJoker !== void 0) add([required$1(smallJoker.cards[0], "small joker"), required$1(bigJoker.cards[0], "big joker")]);
	for (const body of groups.filter((group) => group.cards.length >= 3)) for (const wing of groups.filter((group) => group.rank !== body.rank)) {
		add([...body.cards.slice(0, 3), required$1(wing.cards[0], "single wing")]);
		if (wing.cards.length >= 2 && !isJoker(wing.rank)) add([...body.cards.slice(0, 3), ...wing.cards.slice(0, 2)]);
	}
	for (const run of consecutiveRuns(groups.filter((group) => group.cards.length >= 1), 5)) add(run.map((group) => required$1(group.cards[0], "straight card")));
	for (const run of consecutiveRuns(groups.filter((group) => group.cards.length >= 2), 3)) add(run.flatMap((group) => group.cards.slice(0, 2)));
	for (const body of consecutiveRuns(groups.filter((group) => group.cards.length >= 3), 2)) {
		const bodyRanks = new Set(body.map((group) => group.rank));
		const core = body.flatMap((group) => group.cards.slice(0, 3));
		add(core);
		const singleWings = groups.filter((group) => !bodyRanks.has(group.rank) && group.cards.length < 4);
		for (const wings of choose(singleWings, body.length)) if (!containsRocket(wings)) add([...core, ...wings.map((group) => required$1(group.cards[0], "airplane wing"))]);
		const pairWings = groups.filter((group) => !bodyRanks.has(group.rank) && group.cards.length >= 2 && group.cards.length < 4 && !isJoker(group.rank));
		for (const wings of choose(pairWings, body.length)) add([...core, ...wings.flatMap((group) => group.cards.slice(0, 2))]);
	}
	for (const body of groups.filter((group) => group.cards.length === 4)) {
		const wings = groups.filter((group) => group.rank !== body.rank && group.cards.length < 4);
		for (const pair of choose(wings, 2)) {
			const left = required$1(pair[0], "left four-two wing");
			const right = required$1(pair[1], "right four-two wing");
			if (!containsRocket(pair)) add([
				...body.cards,
				required$1(left.cards[0], "left four-two card"),
				required$1(right.cards[0], "right four-two card")
			]);
		}
		for (const wing of wings.filter((group) => group.cards.length >= 2 && !isJoker(group.rank))) add([...body.cards, ...wing.cards.slice(0, 2)]);
		const pairWings = wings.filter((group) => group.cards.length >= 2 && !isJoker(group.rank));
		for (const pair of choose(pairWings, 2)) add([...body.cards, ...pair.flatMap((group) => group.cards.slice(0, 2))]);
	}
	const sorted = [...plays.values()].sort((left, right) => combinationOrder(left.combination) - combinationOrder(right.combination) || left.combination.cards.length - right.combination.cards.length || doudizhuRankIndex(left.combination.primaryRank) - doudizhuRankIndex(right.combination.primaryRank)).map((play) => play.action);
	return current === void 0 ? sorted : [...sorted, { type: "pass" }];
}
function rankGroups(cards) {
	const grouped = /* @__PURE__ */ new Map();
	for (const id of cards) {
		const rank = doudizhuCard(id).rank;
		const group = grouped.get(rank) ?? [];
		group.push(id);
		grouped.set(rank, group);
	}
	return [...grouped].map(([rank, ids]) => ({
		rank,
		cards: sortDoudizhuCards(ids)
	})).sort((left, right) => doudizhuRankIndex(left.rank) - doudizhuRankIndex(right.rank));
}
function combination(kind, cards, primaryRank, chainLength) {
	return {
		kind,
		cards: sortDoudizhuCards(cards),
		primaryRank,
		chainLength
	};
}
function bodyCombination(kind, cards, groups, count) {
	const body = groups.find((group) => group.cards.length === count);
	return body === void 0 ? null : combination(kind, cards, body.rank, 1);
}
function consecutive(groups, minimum) {
	if (groups.length < minimum || groups.some((group) => doudizhuRankIndex(group.rank) > doudizhuRankIndex("A"))) return false;
	return groups.every((group, index) => index === 0 || doudizhuRankIndex(group.rank) === doudizhuRankIndex(required$1(groups[index - 1], "previous chain rank").rank) + 1);
}
function airplanePrimary(groups, chainLength, mode) {
	const bodyCandidates = consecutiveRuns(groups.filter((group) => group.cards.length >= 3), chainLength).filter((run) => run.length === chainLength);
	const valid = [];
	for (const body of bodyCandidates) {
		const bodyRanks = new Set(body.map((group) => group.rank));
		const remainder = groups.flatMap((group) => {
			const remove = bodyRanks.has(group.rank) ? 3 : 0;
			return Array.from({ length: group.cards.length - remove }, () => group.rank);
		});
		const primary = required$1(body.at(-1), "airplane body tail").rank;
		if (mode === "none" && remainder.length === 0) valid.push(primary);
		if (mode === "single" && remainder.length === chainLength) {
			if (rankCounts(remainder).every(([, count]) => count === 1) && !containsRocketRanks(remainder)) valid.push(primary);
		}
		if (mode === "pair" && remainder.length === chainLength * 2) {
			const wingGroups = rankCounts(remainder);
			if (wingGroups.length === chainLength && wingGroups.every(([rank, count]) => count === 2 && !isJoker(rank))) valid.push(primary);
		}
	}
	return valid.sort((left, right) => doudizhuRankIndex(right) - doudizhuRankIndex(left))[0];
}
function consecutiveRuns(groups, minimum) {
	const eligible = groups.filter((group) => doudizhuRankIndex(group.rank) <= doudizhuRankIndex("A"));
	const maximal = [];
	let current = [];
	for (const group of eligible) if (current.length === 0 || doudizhuRankIndex(group.rank) === doudizhuRankIndex(required$1(current.at(-1), "current run tail").rank) + 1) current.push(group);
	else {
		if (current.length >= minimum) maximal.push(current);
		current = [group];
	}
	if (current.length >= minimum) maximal.push(current);
	const result = [];
	for (const run of maximal) for (let length = minimum; length <= run.length; length += 1) for (let start = 0; start + length <= run.length; start += 1) result.push(run.slice(start, start + length));
	return result;
}
function choose(items, count) {
	if (count === 0) return [[]];
	const result = [];
	for (let index = 0; index <= items.length - count; index += 1) for (const tail of choose(items.slice(index + 1), count - 1)) result.push([required$1(items[index], "combination choice"), ...tail]);
	return result;
}
function rankCounts(ranks) {
	const counts = /* @__PURE__ */ new Map();
	for (const rank of ranks) counts.set(rank, (counts.get(rank) ?? 0) + 1);
	return [...counts];
}
function containsRocket(groups) {
	return groups.some((group) => group.rank === "SJ") && groups.some((group) => group.rank === "BJ");
}
function containsRocketRanks(ranks) {
	return ranks.includes("SJ") && ranks.includes("BJ");
}
function isJoker(rank) {
	return rank === "SJ" || rank === "BJ";
}
function combinationOrder(value) {
	return DOUDIZHU_RANKS.length * COMBINATION_ORDER.indexOf(value.kind);
}
const COMBINATION_ORDER = [
	"single",
	"pair",
	"triple",
	"triple-single",
	"triple-pair",
	"straight",
	"pair-straight",
	"airplane",
	"airplane-single",
	"airplane-pair",
	"four-two-single",
	"four-two-pair",
	"bomb",
	"rocket"
];
function required$1(value, label) {
	if (value === void 0) throw new Error(`DouDizhu internal invariant failed: missing ${label}`);
	return value;
}
//#endregion
//#region lib/types/doudizhu/error.js
/** Engine rejection with a stable machine-readable reason. */
var DoudizhuError = class extends Error {
	code;
	/** @param message - diagnostic detail. @param code - stable rejection category. */
	constructor(message, code) {
		super(message);
		this.code = code;
		this.name = "DoudizhuError";
	}
};
//#endregion
//#region lib/types/doudizhu/engine.js
/** Pure game creation, state transitions, settlement, and seat-private projection. */
/**
* Create one dealt bidding state from an injected exact deck permutation.
* @param request - validated deck order and bidding starter.
* @returns initial immutable bidding state.
*/
function createDoudizhuGame(request) {
	assertSeat(request.biddingStarter);
	try {
		validateDoudizhuDeck(request.deck);
	} catch (error) {
		throw new DoudizhuError(messageOf(error), "DOUDIZHU_INVALID_DECK");
	}
	const hands = [
		[],
		[],
		[]
	];
	for (let index = 0; index < 51; index += 1) hands[index % 3].push(required(request.deck[index], "dealt card"));
	const bottom = request.deck.slice(51);
	const state = {
		version: 0,
		phase: "bidding",
		bidder: request.biddingStarter,
		biddingStarter: request.biddingStarter,
		bids: [],
		highestBid: 0,
		highestBidder: void 0,
		landlord: void 0,
		currentSeat: void 0,
		hands: [
			sortDoudizhuCards(hands[0]),
			sortDoudizhuCards(hands[1]),
			sortDoudizhuCards(hands[2])
		],
		bottom: [
			required(bottom[0], "first bottom card"),
			required(bottom[1], "second bottom card"),
			required(bottom[2], "third bottom card")
		],
		lastPlay: void 0,
		consecutivePasses: 0,
		multiplier: 1,
		playsBySeat: [
			0,
			0,
			0
		],
		history: [],
		result: void 0
	};
	assertDoudizhuState(state);
	return state;
}
/**
* Build the public game projection with no private hand identities.
* @param state - complete coordinator state.
* @returns detached public projection.
*/
function doudizhuPublicView(state) {
	assertDoudizhuState(state);
	return {
		version: state.version,
		phase: state.phase,
		cardCounts: [
			state.hands[0].length,
			state.hands[1].length,
			state.hands[2].length
		],
		bottom: state.phase === "bidding" ? [] : [...state.bottom],
		...state.currentSeat === void 0 ? {} : { currentSeat: state.currentSeat },
		...state.landlord === void 0 ? {} : { landlord: state.landlord },
		highestBid: state.highestBid,
		bids: state.bids.map((bid) => ({ ...bid })),
		...state.lastPlay === void 0 ? {} : { lastPlay: clonePlay(state.lastPlay) },
		consecutivePasses: state.consecutivePasses,
		multiplier: state.multiplier,
		history: state.history.map(cloneHistoryEntry),
		...state.result === void 0 ? {} : { result: cloneResult(state.result) }
	};
}
/**
* Apply one current-seat bid, play, or pass.
* @param request - state, addressed seat, and proposed action.
* @returns detached validated next state.
*/
function applyDoudizhuAction(request) {
	assertDoudizhuState(request.state);
	assertSeat(request.seat);
	if (request.state.phase === "bidding") return applyBid(request.state, request.seat, request.action);
	if (request.state.phase === "playing") return applyPlay(request.state, request.seat, request.action);
	throw new DoudizhuError(`cannot act in phase ${JSON.stringify(request.state.phase)}`, "DOUDIZHU_INVALID_ACTION");
}
/**
* Build the only state and legal actions one seat may receive.
* @param state - complete coordinator state.
* @param seat - addressed private seat.
* @returns detached seat-private projection.
*/
function doudizhuPrivateView(state, seat) {
	assertDoudizhuState(state);
	assertSeat(seat);
	const legalActions = legalActionsFor(state, seat);
	return {
		version: state.version,
		phase: state.phase,
		yourSeat: seat,
		...state.landlord === void 0 ? {} : { yourRole: state.landlord === seat ? "landlord" : "farmer" },
		yourCards: [...state.hands[seat]],
		cardCounts: [
			state.hands[0].length,
			state.hands[1].length,
			state.hands[2].length
		],
		bottom: state.phase === "bidding" ? [] : [...state.bottom],
		...state.currentSeat === void 0 ? {} : { currentSeat: state.currentSeat },
		...state.landlord === void 0 ? {} : { landlord: state.landlord },
		highestBid: state.highestBid,
		bids: state.bids.map((bid) => ({ ...bid })),
		...state.lastPlay === void 0 ? {} : { lastPlay: clonePlay(state.lastPlay) },
		multiplier: state.multiplier,
		history: state.history.map(cloneHistoryEntry),
		legalActions,
		...state.result === void 0 ? {} : { result: cloneResult(state.result) }
	};
}
/**
* Return invariant failures without changing the supplied state.
* @param state - candidate typed engine state.
* @returns diagnostics; empty means every relationship holds.
*/
function validateDoudizhuState(state) {
	const failures = [];
	if (!Number.isSafeInteger(state.version) || state.version < 0) failures.push("version must be a non-negative safe integer");
	if (![
		"bidding",
		"playing",
		"redeal",
		"finished"
	].includes(state.phase)) failures.push("phase is unsupported");
	const allCards = state.phase === "bidding" || state.phase === "redeal" ? [...state.hands.flat(), ...state.bottom] : state.hands.flat();
	const expectedCount = state.phase === "bidding" || state.phase === "redeal" ? 54 : 54 - state.history.filter((entry) => "combination" in entry).reduce((sum, entry) => sum + entry.combination.cards.length, 0);
	if (allCards.length !== expectedCount) failures.push(`remaining card count ${allCards.length} does not match expected ${expectedCount}`);
	if (new Set(allCards).size !== allCards.length) failures.push("remaining cards contain duplicate identities");
	try {
		for (const id of allCards) sortDoudizhuCards([id]);
	} catch (error) {
		failures.push(messageOf(error));
	}
	if (state.phase === "bidding" && state.bids.length > 2 && state.highestBid !== 3) failures.push("three completed bids must settle bidding");
	if ((state.phase === "playing" || state.phase === "finished") && state.landlord === void 0) failures.push("playing state requires a landlord");
	if (state.phase === "playing" && state.currentSeat === void 0) failures.push("playing state requires a current seat");
	if (state.phase === "finished" && state.result === void 0) failures.push("finished state requires a result");
	if (state.phase !== "finished" && state.result !== void 0) failures.push("only finished state may carry a result");
	if (!Number.isSafeInteger(state.multiplier) || state.multiplier < 1) failures.push("multiplier must be a positive safe integer");
	return failures;
}
function applyBid(state, seat, action) {
	if (seat !== state.bidder) throw new DoudizhuError("only the current bidder may act", "DOUDIZHU_NOT_CURRENT_SEAT");
	if (action.type !== "bid") throw new DoudizhuError("bidding accepts only bid actions", "DOUDIZHU_INVALID_ACTION");
	if (action.score !== 0 && action.score <= state.highestBid) throw new DoudizhuError("a non-zero bid must exceed the current highest bid", "DOUDIZHU_ILLEGAL_BID");
	const bid = {
		seat,
		score: action.score
	};
	const bids = [...state.bids, bid];
	const highestBid = action.score > state.highestBid ? action.score : state.highestBid;
	const highestBidder = action.score > state.highestBid ? seat : state.highestBidder;
	if (action.score === 3 || bids.length === 3) {
		if (highestBidder === void 0 || highestBid === 0) return checked({
			...state,
			version: state.version + 1,
			phase: "redeal",
			bids,
			highestBid,
			highestBidder: void 0,
			landlord: void 0,
			currentSeat: void 0,
			history: [...state.history, bid]
		});
		const hands = state.hands.map((hand) => [...hand]);
		hands[highestBidder].push(...state.bottom);
		hands[highestBidder] = sortDoudizhuCards(hands[highestBidder]);
		return checked({
			...state,
			version: state.version + 1,
			phase: "playing",
			bids,
			highestBid,
			highestBidder,
			landlord: highestBidder,
			currentSeat: highestBidder,
			hands,
			history: [...state.history, bid]
		});
	}
	return checked({
		...state,
		version: state.version + 1,
		bidder: nextSeat(seat),
		bids,
		highestBid,
		highestBidder,
		history: [...state.history, bid]
	});
}
function applyPlay(state, seat, action) {
	if (seat !== state.currentSeat) throw new DoudizhuError("only the current player may act", "DOUDIZHU_NOT_CURRENT_SEAT");
	if (action.type === "bid") throw new DoudizhuError("play phase rejects bids", "DOUDIZHU_INVALID_ACTION");
	if (action.type === "pass") {
		if (state.lastPlay === void 0) throw new DoudizhuError("the trick leader cannot pass", "DOUDIZHU_INVALID_ACTION");
		const passes = state.consecutivePasses + 1;
		const reset = passes === 2;
		return checked({
			...state,
			version: state.version + 1,
			currentSeat: reset ? state.lastPlay.seat : nextSeat(seat),
			lastPlay: reset ? void 0 : state.lastPlay,
			consecutivePasses: reset ? 0 : passes,
			history: [...state.history, {
				seat,
				pass: true
			}]
		});
	}
	const cards = sortDoudizhuCards(action.cards);
	if (cards.length === 0 || new Set(cards).size !== cards.length) throw new DoudizhuError("play must contain unique cards", "DOUDIZHU_ILLEGAL_COMBINATION");
	if (!containsCards(state.hands[seat], cards)) throw new DoudizhuError("play contains a card outside the seat hand", "DOUDIZHU_CARD_NOT_OWNED");
	const combination = classifyDoudizhuCombination(cards);
	if (combination === null) throw new DoudizhuError("cards form no legal combination", "DOUDIZHU_ILLEGAL_COMBINATION");
	if (state.lastPlay !== void 0 && !beatsDoudizhuCombination(combination, state.lastPlay.combination)) throw new DoudizhuError("play does not beat the current combination", "DOUDIZHU_PLAY_DOES_NOT_BEAT");
	const hands = state.hands.map((hand) => [...hand]);
	const removed = new Set(cards);
	hands[seat] = hands[seat].filter((card) => !removed.has(card));
	const play = {
		seat,
		combination
	};
	const playsBySeat = [...state.playsBySeat];
	playsBySeat[seat] += 1;
	const multiplier = state.multiplier * (combination.kind === "bomb" || combination.kind === "rocket" ? 2 : 1);
	if (hands[seat].length === 0) {
		const result = settle(state, seat, multiplier, playsBySeat);
		return checked({
			...state,
			version: state.version + 1,
			phase: "finished",
			currentSeat: void 0,
			hands,
			lastPlay: play,
			consecutivePasses: 0,
			multiplier: result.multiplier,
			playsBySeat,
			history: [...state.history, play],
			result
		});
	}
	return checked({
		...state,
		version: state.version + 1,
		currentSeat: nextSeat(seat),
		hands,
		lastPlay: play,
		consecutivePasses: 0,
		multiplier,
		playsBySeat,
		history: [...state.history, play]
	});
}
function legalActionsFor(state, seat) {
	if (state.phase === "bidding" && state.bidder === seat) {
		const actions = [{
			type: "bid",
			score: 0
		}];
		for (const score of [
			1,
			2,
			3
		]) if (score > state.highestBid) actions.push({
			type: "bid",
			score
		});
		return actions;
	}
	if (state.phase === "playing" && state.currentSeat === seat) return legalDoudizhuPlayActions(state.hands[seat], state.lastPlay);
	return [];
}
function settle(state, winningSeat, multiplier, playsBySeat) {
	const landlord = state.landlord;
	if (landlord === void 0 || state.highestBid === 0) throw new DoudizhuError("settlement requires landlord and bid", "DOUDIZHU_INVALID_STATE");
	const landlordWon = winningSeat === landlord;
	const farmers = [
		0,
		1,
		2
	].filter((seat) => seat !== landlord);
	const landlordSpring = landlordWon && farmers.every((seat) => playsBySeat[seat] === 0);
	const farmerSpring = !landlordWon && playsBySeat[landlord] === 1;
	const spring = landlordSpring ? "landlord" : farmerSpring ? "farmers" : "none";
	const finalMultiplier = multiplier * (spring === "none" ? 1 : 2);
	const unit = state.highestBid * finalMultiplier;
	const scores = [
		0,
		0,
		0
	];
	scores[landlord] = landlordWon ? unit * 2 : -unit * 2;
	for (const farmer of farmers) scores[farmer] = landlordWon ? -unit : unit;
	return {
		winner: landlordWon ? "landlord" : "farmers",
		spring,
		baseScore: state.highestBid,
		multiplier: finalMultiplier,
		scores
	};
}
function checked(state) {
	assertDoudizhuState(state);
	return state;
}
function assertDoudizhuState(state) {
	const failures = validateDoudizhuState(state);
	if (failures.length > 0) throw new DoudizhuError(failures.join("; "), "DOUDIZHU_INVALID_STATE");
}
function assertSeat(value) {
	if (value !== 0 && value !== 1 && value !== 2) throw new DoudizhuError(`invalid seat ${value}`, "DOUDIZHU_INVALID_STATE");
}
function nextSeat(seat) {
	return (seat + 1) % 3;
}
function containsCards(hand, cards) {
	const available = new Set(hand);
	return cards.every((card) => available.has(card));
}
function clonePlay(play) {
	return {
		seat: play.seat,
		combination: {
			...play.combination,
			cards: [...play.combination.cards]
		}
	};
}
function cloneResult(result) {
	return {
		...result,
		scores: [...result.scores]
	};
}
function cloneHistoryEntry(entry) {
	if ("combination" in entry) return clonePlay(entry);
	return { ...entry };
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
function required(value, label) {
	if (value === void 0) throw new Error(`DouDizhu internal invariant failed: missing ${label}`);
	return value;
}
//#endregion
export { DOUDIZHU_DECK, DOUDIZHU_RANKS, DoudizhuCardId, DoudizhuError, applyDoudizhuAction, beatsDoudizhuCombination, classifyDoudizhuCombination, createDoudizhuGame, doudizhuCard, doudizhuPrivateView, doudizhuPublicView, doudizhuRankIndex, legalDoudizhuPlayActions, shuffleDoudizhuDeck, sortDoudizhuCards, validateDoudizhuDeck, validateDoudizhuState };
