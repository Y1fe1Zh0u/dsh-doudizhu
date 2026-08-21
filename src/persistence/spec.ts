/** Durable schemas for resumable LAN game matches and local installation bindings. */

import { z } from 'zod'
import { DoudizhuCardId } from '../doudizhu/index.ts'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'

const timestamp = z.string().min(1)
const seat = z.union([z.literal(0), z.literal(1), z.literal(2)])
const cardId = z.string().transform(DoudizhuCardId)
const score = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])

/** Schema for a committed bid, play, or pass action. */
export const doudizhuActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bid'), score }),
  z.object({ type: z.literal('play'), cards: z.array(cardId) }),
  z.object({ type: z.literal('pass') }),
])

const combinationSchema = z.object({
  kind: z.enum([
    'single', 'pair', 'triple', 'triple-single', 'triple-pair', 'straight',
    'pair-straight', 'airplane', 'airplane-single', 'airplane-pair',
    'four-two-single', 'four-two-pair', 'bomb', 'rocket',
  ]),
  cards: z.array(cardId),
  primaryRank: z.enum(['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2', 'SJ', 'BJ']),
  chainLength: z.number().int().nonnegative(),
})

const bidRecordSchema = z.object({ seat, score })
const playRecordSchema = z.object({ seat, combination: combinationSchema })
const passRecordSchema = z.object({ seat, pass: z.literal(true) })

/** Schema for the winner, multiplier, and seat scores of one settled round. */
export const doudizhuResultSchema = z.object({
  winner: z.enum(['landlord', 'farmers']),
  spring: z.enum(['landlord', 'farmers', 'none']),
  baseScore: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  multiplier: z.number().int().positive(),
  scores: z.tuple([z.number(), z.number(), z.number()]),
})

/** Schema for the complete deterministic DouDizhu engine state. */
export const doudizhuStateSchema = z.object({
  version: z.number().int().nonnegative(),
  phase: z.enum(['bidding', 'playing', 'redeal', 'finished']),
  bidder: seat,
  biddingStarter: seat,
  bids: z.array(bidRecordSchema),
  highestBid: score,
  highestBidder: seat.optional(),
  landlord: seat.optional(),
  currentSeat: seat.optional(),
  hands: z.tuple([z.array(cardId), z.array(cardId), z.array(cardId)]),
  bottom: z.tuple([cardId, cardId, cardId]),
  lastPlay: playRecordSchema.optional(),
  consecutivePasses: z.number().int().nonnegative(),
  multiplier: z.number().int().positive(),
  playsBySeat: z.tuple([
    z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().nonnegative(),
  ]),
  history: z.array(z.union([bidRecordSchema, playRecordSchema, passRecordSchema])),
  result: doudizhuResultSchema.optional(),
})

/** Schema linking a committed history entry to its agent or fallback decision source. */
export const doudizhuDecisionOutcomeSchema = z.object({
  historyIndex: z.number().int().nonnegative(),
  afterStateVersion: z.number().int().nonnegative(),
  seat,
  source: z.enum(['agent', 'fallback']),
  fallbackReason: z.enum(['timeout', 'disconnected', 'invalid-response', 'transport-error']).optional(),
})

/** Schema for a replayable match projection at a specific event sequence. */
export const matchCheckpointSchema = z.object({
  asOfSeq: z.number().int().nonnegative(),
  round: z.number().int().positive(),
  deal: z.number().int().positive(),
  state: doudizhuStateSchema,
  totalScores: z.tuple([z.number(), z.number(), z.number()]),
  roundResults: z.array(doudizhuResultSchema),
  decisionOutcomes: z.array(doudizhuDecisionOutcomeSchema),
})

/** Schema for a decision request that remains recoverable after restart. */
export const pendingDecisionSchema = z.object({
  requestId: z.string().min(1),
  attempt: z.number().int().positive(),
  seat,
  stateVersion: z.number().int().nonnegative(),
  requestedAt: timestamp,
  deadlineAt: timestamp,
})

const eventBase = {
  seq: z.number().int().nonnegative(),
  at: timestamp,
}

/** Schema for every durable event in a LAN game match log. */
export const matchEventSchema = z.discriminatedUnion('type', [
  z.object({
    ...eventBase,
    type: z.literal('deal-started'),
    round: z.number().int().positive(),
    deal: z.number().int().positive(),
    deck: z.array(cardId).length(54),
    biddingStarter: seat,
  }),
  z.object({
    ...eventBase,
    type: z.literal('decision-requested'),
    requestId: z.string().min(1),
    attempt: z.number().int().positive(),
    seat,
    stateVersion: z.number().int().nonnegative(),
    requestedAt: timestamp,
    deadlineAt: timestamp,
  }),
  z.object({
    ...eventBase,
    type: z.literal('decision-abandoned'),
    requestId: z.string().min(1),
    reason: z.enum(['timeout', 'disconnected', 'invalid-response', 'transport-error', 'superseded', 'closed']),
  }),
  z.object({
    ...eventBase,
    type: z.literal('action-committed'),
    requestId: z.string().min(1),
    seat,
    beforeStateVersion: z.number().int().nonnegative(),
    action: doudizhuActionSchema,
    source: z.enum(['agent', 'fallback']),
    fallbackReason: z.enum(['timeout', 'disconnected', 'invalid-response', 'transport-error']).optional(),
    afterStateVersion: z.number().int().nonnegative(),
  }),
  z.object({
    ...eventBase,
    type: z.literal('round-finished'),
    round: z.number().int().positive(),
    result: doudizhuResultSchema,
    totalScores: z.tuple([z.number(), z.number(), z.number()]),
  }),
  z.object({
    ...eventBase,
    type: z.literal('match-finished'),
    totalScores: z.tuple([z.number(), z.number(), z.number()]),
    roundResults: z.array(doudizhuResultSchema),
  }),
  z.object({
    ...eventBase,
    type: z.literal('room-closed'),
    reason: z.string().min(1).optional(),
  }),
])

const persistedMemberSchema = z.object({
  id: z.string().min(1),
  seat: z.number().int().nonnegative(),
  ready: z.boolean(),
  connected: z.boolean(),
  promptHash: z.string().min(1).optional(),
  resumeToken: z.string().min(1).optional(),
})

const persistedRoomSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  revision: z.number().int().nonnegative(),
  phase: z.enum(['lobby', 'locked', 'running', 'finished']),
  coordinatorId: z.string().min(1),
  maxMembers: z.number().int().positive(),
  members: z.array(persistedMemberSchema),
  result: z.string().optional(),
})

/** Schema for the durable room, event log, and latest validated checkpoint. */
export const matchRecordSchema = z.object({
  schemaVersion: z.literal(1),
  game: z.literal('doudizhu'),
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
    decisionTimeoutMs: z.number().int().positive(),
  }),
  events: z.array(matchEventSchema),
  checkpoint: matchCheckpointSchema,
  pendingDecision: pendingDecisionSchema.optional(),
  finishedAt: timestamp.optional(),
  closedAt: timestamp.optional(),
})

/** Schema for installation-local session and credential references for one room. */
export const localBindingSchema = z.object({
  schemaVersion: z.literal(1),
  roomId: z.string().min(1),
  role: z.enum(['coordinator', 'participant']),
  memberId: z.string().min(1),
  parentSessionId: z.string().min(1),
  gameSessionId: z.string().min(1).optional(),
  strategyPrompt: z.string().min(1).optional(),
  promptHash: z.string().min(1),
  coordinatorUrl: z.string().min(1),
  resumeToken: z.string().min(1).optional(),
  state: z.enum(['active', 'finished', 'closed', 'archived']),
  updatedAt: timestamp,
})

/** Validated durable representation of a committed game action. */
export type DoudizhuActionRecord = z.infer<typeof doudizhuActionSchema>
/** Deterministic match projection captured at an event sequence. */
export type MatchCheckpoint = z.infer<typeof matchCheckpointSchema>
/** Recoverable agent-decision request awaiting commitment or abandonment. */
export type PendingDecision = z.infer<typeof pendingDecisionSchema>
/** One validated entry in the durable match event log. */
export type MatchEvent = z.infer<typeof matchEventSchema>
/** Complete durable representation of one LAN game match. */
export type MatchRecord = z.infer<typeof matchRecordSchema>
/** Installation-local session and credential references for one room. */
export type LocalBinding = z.infer<typeof localBindingSchema>

/** The complete LAN game durable layout: room matches plus installation-local bindings. */
export const lanGameDomainSpec = defineDomain({
  name: 'lan_game',
  version: 1,
  tables: {
    matches: domainTable<string, MatchRecord>(matchRecordSchema),
    bindings: domainTable<string, LocalBinding>(localBindingSchema),
  },
})
