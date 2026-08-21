import { DoudizhuCardId, applyDoudizhuAction, createDoudizhuGame, validateDoudizhuState } from "./doudizhu.js";
import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
//#region lib/types/persistence/spec.js
/** Durable schemas for resumable LAN game matches and local installation bindings. */
const timestamp = z.string().min(1);
const seat = z.union([
	z.literal(0),
	z.literal(1),
	z.literal(2)
]);
const cardId = z.string().transform(DoudizhuCardId);
const score = z.union([
	z.literal(0),
	z.literal(1),
	z.literal(2),
	z.literal(3)
]);
/** Schema for a committed bid, play, or pass action. */
const doudizhuActionSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("bid"),
		score
	}),
	z.object({
		type: z.literal("play"),
		cards: z.array(cardId)
	}),
	z.object({ type: z.literal("pass") })
]);
const combinationSchema = z.object({
	kind: z.enum([
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
	]),
	cards: z.array(cardId),
	primaryRank: z.enum([
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
	]),
	chainLength: z.number().int().nonnegative()
});
const bidRecordSchema = z.object({
	seat,
	score
});
const playRecordSchema = z.object({
	seat,
	combination: combinationSchema
});
const passRecordSchema = z.object({
	seat,
	pass: z.literal(true)
});
/** Schema for the winner, multiplier, and seat scores of one settled round. */
const doudizhuResultSchema = z.object({
	winner: z.enum(["landlord", "farmers"]),
	spring: z.enum([
		"landlord",
		"farmers",
		"none"
	]),
	baseScore: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3)
	]),
	multiplier: z.number().int().positive(),
	scores: z.tuple([
		z.number(),
		z.number(),
		z.number()
	])
});
/** Schema for the complete deterministic DouDizhu engine state. */
const doudizhuStateSchema = z.object({
	version: z.number().int().nonnegative(),
	phase: z.enum([
		"bidding",
		"playing",
		"redeal",
		"finished"
	]),
	bidder: seat,
	biddingStarter: seat,
	bids: z.array(bidRecordSchema),
	highestBid: score,
	highestBidder: seat.optional(),
	landlord: seat.optional(),
	currentSeat: seat.optional(),
	hands: z.tuple([
		z.array(cardId),
		z.array(cardId),
		z.array(cardId)
	]),
	bottom: z.tuple([
		cardId,
		cardId,
		cardId
	]),
	lastPlay: playRecordSchema.optional(),
	consecutivePasses: z.number().int().nonnegative(),
	multiplier: z.number().int().positive(),
	playsBySeat: z.tuple([
		z.number().int().nonnegative(),
		z.number().int().nonnegative(),
		z.number().int().nonnegative()
	]),
	history: z.array(z.union([
		bidRecordSchema,
		playRecordSchema,
		passRecordSchema
	])),
	result: doudizhuResultSchema.optional()
});
/** Schema linking a committed history entry to its agent or fallback decision source. */
const doudizhuDecisionOutcomeSchema = z.object({
	historyIndex: z.number().int().nonnegative(),
	afterStateVersion: z.number().int().nonnegative(),
	seat,
	source: z.enum(["agent", "fallback"]),
	fallbackReason: z.enum([
		"timeout",
		"disconnected",
		"invalid-response",
		"transport-error"
	]).optional()
});
/** Schema for a replayable match projection at a specific event sequence. */
const matchCheckpointSchema = z.object({
	asOfSeq: z.number().int().nonnegative(),
	round: z.number().int().positive(),
	deal: z.number().int().positive(),
	state: doudizhuStateSchema,
	totalScores: z.tuple([
		z.number(),
		z.number(),
		z.number()
	]),
	roundResults: z.array(doudizhuResultSchema),
	decisionOutcomes: z.array(doudizhuDecisionOutcomeSchema)
});
/** Schema for a decision request that remains recoverable after restart. */
const pendingDecisionSchema = z.object({
	requestId: z.string().min(1),
	attempt: z.number().int().positive(),
	seat,
	stateVersion: z.number().int().nonnegative(),
	requestedAt: timestamp,
	deadlineAt: timestamp
});
const eventBase = {
	seq: z.number().int().nonnegative(),
	at: timestamp
};
/** Schema for every durable event in a LAN game match log. */
const matchEventSchema = z.discriminatedUnion("type", [
	z.object({
		...eventBase,
		type: z.literal("deal-started"),
		round: z.number().int().positive(),
		deal: z.number().int().positive(),
		deck: z.array(cardId).length(54),
		biddingStarter: seat
	}),
	z.object({
		...eventBase,
		type: z.literal("decision-requested"),
		requestId: z.string().min(1),
		attempt: z.number().int().positive(),
		seat,
		stateVersion: z.number().int().nonnegative(),
		requestedAt: timestamp,
		deadlineAt: timestamp
	}),
	z.object({
		...eventBase,
		type: z.literal("decision-abandoned"),
		requestId: z.string().min(1),
		reason: z.enum([
			"timeout",
			"disconnected",
			"invalid-response",
			"transport-error",
			"superseded",
			"closed"
		])
	}),
	z.object({
		...eventBase,
		type: z.literal("action-committed"),
		requestId: z.string().min(1),
		seat,
		beforeStateVersion: z.number().int().nonnegative(),
		action: doudizhuActionSchema,
		source: z.enum(["agent", "fallback"]),
		fallbackReason: z.enum([
			"timeout",
			"disconnected",
			"invalid-response",
			"transport-error"
		]).optional(),
		afterStateVersion: z.number().int().nonnegative()
	}),
	z.object({
		...eventBase,
		type: z.literal("round-finished"),
		round: z.number().int().positive(),
		result: doudizhuResultSchema,
		totalScores: z.tuple([
			z.number(),
			z.number(),
			z.number()
		])
	}),
	z.object({
		...eventBase,
		type: z.literal("match-finished"),
		totalScores: z.tuple([
			z.number(),
			z.number(),
			z.number()
		]),
		roundResults: z.array(doudizhuResultSchema)
	}),
	z.object({
		...eventBase,
		type: z.literal("room-closed"),
		reason: z.string().min(1).optional()
	})
]);
const persistedMemberSchema = z.object({
	id: z.string().min(1),
	seat: z.number().int().nonnegative(),
	ready: z.boolean(),
	connected: z.boolean(),
	promptHash: z.string().min(1).optional(),
	resumeToken: z.string().min(1).optional()
});
const persistedRoomSchema = z.object({
	id: z.string().min(1),
	code: z.string().min(1),
	revision: z.number().int().nonnegative(),
	phase: z.enum([
		"lobby",
		"locked",
		"running",
		"finished"
	]),
	coordinatorId: z.string().min(1),
	maxMembers: z.number().int().positive(),
	members: z.array(persistedMemberSchema),
	result: z.string().optional()
});
/** Schema for the durable room, event log, and latest validated checkpoint. */
const matchRecordSchema = z.object({
	schemaVersion: z.literal(1),
	game: z.literal("doudizhu"),
	rulesetVersion: z.literal(1),
	recordRevision: z.number().int().nonnegative(),
	authorityEpoch: z.number().int().nonnegative(),
	createdAt: timestamp,
	updatedAt: timestamp,
	expiresAt: timestamp,
	room: persistedRoomSchema,
	config: z.object({
		roundsPerMatch: z.number().int().positive(),
		roundPauseMs: z.number().int().nonnegative(),
		decisionTimeoutMs: z.number().int().positive()
	}),
	events: z.array(matchEventSchema),
	checkpoint: matchCheckpointSchema,
	pendingDecision: pendingDecisionSchema.optional(),
	finishedAt: timestamp.optional(),
	closedAt: timestamp.optional()
});
/** Schema for installation-local session and credential references for one room. */
const localBindingSchema = z.object({
	schemaVersion: z.literal(1),
	roomId: z.string().min(1),
	role: z.enum(["coordinator", "participant"]),
	memberId: z.string().min(1),
	parentSessionId: z.string().min(1),
	gameSessionId: z.string().min(1).optional(),
	strategyPrompt: z.string().min(1).optional(),
	promptHash: z.string().min(1),
	coordinatorUrl: z.string().min(1),
	resumeToken: z.string().min(1).optional(),
	state: z.enum([
		"active",
		"finished",
		"closed",
		"archived"
	]),
	updatedAt: timestamp
});
/** The complete LAN game durable layout: room matches plus installation-local bindings. */
const lanGameDomainSpec = defineDomain({
	name: "lan_game",
	version: 1,
	tables: {
		matches: domainTable(matchRecordSchema),
		bindings: domainTable(localBindingSchema)
	}
});
//#endregion
//#region lib/types/persistence/replay.js
/** Pure event replay and checkpoint validation for durable DouDizhu matches. */
/** Replay failure with the offending durable event sequence when known. */
var LanGameReplayError = class extends Error {
	seq;
	/** Stable machine-readable error code. */
	code = "LAN_GAME_REPLAY_INVALID";
	constructor(message, seq) {
		super(seq === void 0 ? message : `event ${seq}: ${message}`);
		this.seq = seq;
		this.name = "LanGameReplayError";
	}
};
/**
* Rebuild one match from its first deal through an inclusive event sequence.
* No storage or clock is consulted, so callers can use it for recovery,
* migration audits, and tests with identical results.
*
* @param events - Complete durable event stream in sequence order.
* @param asOfSeq - Optional inclusive event sequence at which replay stops.
* @returns The deterministic match projection at the requested sequence.
*/
function replayMatchEvents(events, asOfSeq) {
	const first = events[0];
	const last = events.at(-1);
	if (first === void 0 || last === void 0) throw new LanGameReplayError("match event log is empty");
	assertSequence(events);
	const target = asOfSeq ?? last.seq;
	if (!Number.isSafeInteger(target) || target < first.seq || target > last.seq) throw new LanGameReplayError(`checkpoint sequence ${String(target)} is outside the event log`);
	if (!events.some((event) => event.seq === target)) throw new LanGameReplayError(`checkpoint sequence ${target} is absent from the event log`);
	let state;
	let round = 0;
	let deal = 0;
	let totalScores = [
		0,
		0,
		0
	];
	const roundResults = [];
	let decisionOutcomes = [];
	let pendingDecision;
	const requested = /* @__PURE__ */ new Set();
	let matchFinished = false;
	let roomClosed = false;
	for (const event of events) {
		if (event.seq > target) break;
		try {
			switch (event.type) {
				case "deal-started":
					if (state !== void 0) {
						const isRedeal = state.phase === "redeal" && event.round === round && event.deal === deal + 1;
						const isNextRound = state.phase === "finished" && roundResults.length === round && event.round === round + 1 && event.deal === 1;
						if (!isRedeal && !isNextRound) throw new Error("deal does not follow redeal or settled round");
					} else if (event.round !== 1 || event.deal !== 1) throw new Error("first deal must be round 1 deal 1");
					state = createDoudizhuGame({
						deck: event.deck,
						biddingStarter: event.biddingStarter
					});
					round = event.round;
					deal = event.deal;
					decisionOutcomes = [];
					pendingDecision = void 0;
					requested.clear();
					break;
				case "decision-requested": {
					const current = requireState(state);
					if (pendingDecision !== void 0) throw new Error("a second decision was requested while one is pending");
					if (event.stateVersion !== current.version) throw new Error("decision stateVersion does not match replay state");
					if (event.seat !== decisionSeat(current)) throw new Error("decision seat is not the current seat");
					if (requested.has(event.requestId)) throw new Error("decision requestId is reused in the deal");
					requested.add(event.requestId);
					pendingDecision = pendingDecisionSchema.parse({
						requestId: event.requestId,
						attempt: event.attempt,
						seat: event.seat,
						stateVersion: event.stateVersion,
						requestedAt: event.requestedAt,
						deadlineAt: event.deadlineAt
					});
					break;
				}
				case "decision-abandoned":
					if (!requested.has(event.requestId)) throw new Error("abandoned decision was never requested");
					if (pendingDecision?.requestId === event.requestId) pendingDecision = void 0;
					break;
				case "action-committed": {
					const current = requireState(state);
					if (!requested.has(event.requestId)) throw new Error("action decision was never requested");
					if (event.beforeStateVersion !== current.version) throw new Error("beforeStateVersion does not match replay state");
					if (event.seat !== decisionSeat(current)) throw new Error("action seat is not the current seat");
					if (event.source === "fallback" && event.fallbackReason === void 0) throw new Error("fallback action is missing fallbackReason");
					if (event.source === "agent" && event.fallbackReason !== void 0) throw new Error("agent action must not carry fallbackReason");
					state = applyDoudizhuAction({
						state: current,
						seat: event.seat,
						action: event.action
					});
					if (event.afterStateVersion !== state.version) throw new Error("afterStateVersion does not match replay state");
					decisionOutcomes = [...decisionOutcomes, {
						historyIndex: state.history.length - 1,
						afterStateVersion: state.version,
						seat: event.seat,
						source: event.source,
						...event.fallbackReason === void 0 ? {} : { fallbackReason: event.fallbackReason }
					}];
					if (pendingDecision?.requestId === event.requestId) pendingDecision = void 0;
					break;
				}
				case "round-finished": {
					const current = requireState(state);
					if (current.phase !== "finished" || current.result === void 0) throw new Error("round finished before engine settlement");
					if (event.round !== round) throw new Error("round-finished round does not match active round");
					if (!sameJson(event.result, current.result)) throw new Error("round-finished result does not match replay result");
					if (roundResults.length !== round - 1) throw new Error("round-finished is duplicated or out of order");
					roundResults.push(current.result);
					totalScores = addScores(totalScores, current.result.scores);
					if (!sameJson(event.totalScores, totalScores)) throw new Error("round-finished totalScores do not match replay totals");
					break;
				}
				case "match-finished":
					if (roundResults.length === 0) throw new Error("match finished without a settled round");
					if (!sameJson(event.totalScores, totalScores)) throw new Error("match-finished totalScores do not match replay totals");
					if (!sameJson(event.roundResults, roundResults)) throw new Error("match-finished roundResults do not match replay results");
					matchFinished = true;
					break;
				case "room-closed":
					roomClosed = true;
					pendingDecision = void 0;
			}
		} catch (error) {
			if (error instanceof LanGameReplayError) throw error;
			throw new LanGameReplayError(messageOf(error), event.seq);
		}
	}
	const finalState = requireState(state);
	const stateFailures = validateDoudizhuState(finalState);
	if (stateFailures.length > 0) throw new LanGameReplayError(stateFailures.join("; "), target);
	return {
		checkpoint: matchCheckpointSchema.parse({
			asOfSeq: target,
			round,
			deal,
			state: finalState,
			totalScores,
			roundResults,
			decisionOutcomes
		}),
		...pendingDecision === void 0 ? {} : { pendingDecision },
		matchFinished,
		roomClosed
	};
}
/**
* Return checkpoint mismatches without mutating or throwing for ordinary invalid input.
*
* @param events - Durable events used to reconstruct the checkpoint.
* @param checkpoint - Persisted checkpoint to compare with deterministic replay.
* @returns Human-readable invariant failures, or an empty array when valid.
*/
function validateMatchCheckpoint(events, checkpoint) {
	try {
		const replayed = replayMatchEvents(events, checkpoint.asOfSeq).checkpoint;
		return sameJson(replayed, checkpoint) ? [] : ["checkpoint does not equal deterministic event replay"];
	} catch (error) {
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
function validateMatchRecord(record, roomId = record.room.id) {
	const failures = [];
	if (record.room.id !== roomId) failures.push("matches table key must equal room.id");
	failures.push(...validateMatchCheckpoint(record.events, record.checkpoint));
	try {
		const replayed = replayMatchEvents(record.events);
		if (!sameJson(replayed.pendingDecision, record.pendingDecision)) failures.push("pendingDecision does not equal the latest event replay state");
		if (record.finishedAt !== void 0 && !replayed.matchFinished) failures.push("finishedAt requires a match-finished event");
		if (record.closedAt !== void 0 && !replayed.roomClosed) failures.push("closedAt requires a room-closed event");
	} catch (error) {
		failures.push(messageOf(error));
	}
	if (record.closedAt !== void 0) {
		if (record.pendingDecision !== void 0) failures.push("closed record must not retain pendingDecision");
		if (record.room.members.some((member) => member.resumeToken !== void 0)) failures.push("closed record must not retain member resume tokens");
	}
	return [...new Set(failures)];
}
function assertSequence(events) {
	let previous;
	for (const event of events) {
		if (previous !== void 0 && event.seq !== previous.seq + 1) throw new LanGameReplayError("event sequences must be contiguous", event.seq);
		previous = event;
	}
}
function requireState(state) {
	if (state === void 0) throw new Error("event requires an earlier deal-started event");
	return state;
}
function decisionSeat(state) {
	if (state.phase === "bidding") return state.bidder;
	if (state.phase === "playing" && state.currentSeat !== void 0) return state.currentSeat;
	throw new Error(`phase ${state.phase} has no decision seat`);
}
function addScores(left, right) {
	return [
		left[0] + right[0],
		left[1] + right[1],
		left[2] + right[2]
	];
}
function sameJson(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
export { doudizhuActionSchema as a, doudizhuStateSchema as c, matchCheckpointSchema as d, matchEventSchema as f, validateMatchRecord as i, lanGameDomainSpec as l, pendingDecisionSchema as m, replayMatchEvents as n, doudizhuDecisionOutcomeSchema as o, matchRecordSchema as p, validateMatchCheckpoint as r, doudizhuResultSchema as s, LanGameReplayError as t, localBindingSchema as u };
