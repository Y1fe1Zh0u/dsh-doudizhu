/** Public immutable values for the deterministic three-player DouDizhu engine. */

import type { Branded } from '@deepseek-ai/dsh-brand'

/** Exact seat indexes in play order. */
export type DoudizhuSeat = 0 | 1 | 2

/** Card ranks from low to high. */
export type DoudizhuRank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2' | 'SJ' | 'BJ'

/** Opaque canonical identity of one physical card. */
export type DoudizhuCardId = Branded<'DoudizhuCardId'>

/**
 * Brand one validated canonical card identity.
 * @param value - canonical physical card string.
 * @returns the same value with the card-id brand.
 */
export function DoudizhuCardId(value: string): DoudizhuCardId {
  return value as DoudizhuCardId
}

/** One physical card; suits distinguish ordinary identities but never strength. */
export interface DoudizhuCard {
  readonly id: DoudizhuCardId
  readonly rank: DoudizhuRank
  readonly suit?: 'clubs' | 'diamonds' | 'hearts' | 'spades'
}

/** Classified legal play families. */
export type DoudizhuCombinationKind =
  | 'single'
  | 'pair'
  | 'triple'
  | 'triple-single'
  | 'triple-pair'
  | 'straight'
  | 'pair-straight'
  | 'airplane'
  | 'airplane-single'
  | 'airplane-pair'
  | 'four-two-single'
  | 'four-two-pair'
  | 'bomb'
  | 'rocket'

/** Canonical classification used for comparison. */
export interface DoudizhuCombination {
  readonly kind: DoudizhuCombinationKind
  readonly cards: readonly DoudizhuCardId[]
  readonly primaryRank: DoudizhuRank
  readonly chainLength: number
}

/** Bid or play submitted by the current seat. */
export type DoudizhuAction =
  | { readonly type: 'bid'; readonly score: 0 | 1 | 2 | 3 }
  | { readonly type: 'play'; readonly cards: readonly DoudizhuCardId[] }
  | { readonly type: 'pass' }

/** Public bidding record. */
export interface DoudizhuBidRecord {
  readonly seat: DoudizhuSeat
  readonly score: 0 | 1 | 2 | 3
}

/** Public play record. */
export interface DoudizhuPlayRecord {
  readonly seat: DoudizhuSeat
  readonly combination: DoudizhuCombination
}

/** Terminal score settlement. */
export interface DoudizhuResult {
  readonly winner: 'landlord' | 'farmers'
  readonly spring: 'landlord' | 'farmers' | 'none'
  readonly baseScore: 1 | 2 | 3
  readonly multiplier: number
  readonly scores: readonly [number, number, number]
}

/** Complete coordinator-only game state. */
export interface DoudizhuState {
  readonly version: number
  readonly phase: 'bidding' | 'playing' | 'redeal' | 'finished'
  readonly bidder: DoudizhuSeat
  readonly biddingStarter: DoudizhuSeat
  readonly bids: readonly DoudizhuBidRecord[]
  readonly highestBid: 0 | 1 | 2 | 3
  readonly highestBidder: DoudizhuSeat | undefined
  readonly landlord: DoudizhuSeat | undefined
  readonly currentSeat: DoudizhuSeat | undefined
  readonly hands: readonly [readonly DoudizhuCardId[], readonly DoudizhuCardId[], readonly DoudizhuCardId[]]
  readonly bottom: readonly [DoudizhuCardId, DoudizhuCardId, DoudizhuCardId]
  readonly lastPlay: DoudizhuPlayRecord | undefined
  readonly consecutivePasses: number
  readonly multiplier: number
  readonly playsBySeat: readonly [number, number, number]
  readonly history: readonly (DoudizhuBidRecord | DoudizhuPlayRecord | { readonly seat: DoudizhuSeat; readonly pass: true })[]
  readonly result: DoudizhuResult | undefined
}

/** Seat-private projection sent to one local Game Session. */
export interface DoudizhuPrivateView {
  readonly version: number
  readonly phase: DoudizhuState['phase']
  readonly yourSeat: DoudizhuSeat
  readonly yourRole?: 'landlord' | 'farmer'
  readonly yourCards: readonly DoudizhuCardId[]
  readonly cardCounts: readonly [number, number, number]
  readonly bottom: readonly DoudizhuCardId[]
  readonly currentSeat?: DoudizhuSeat
  readonly landlord?: DoudizhuSeat
  readonly highestBid: 0 | 1 | 2 | 3
  readonly bids: readonly DoudizhuBidRecord[]
  readonly lastPlay?: DoudizhuPlayRecord
  readonly multiplier: number
  /** Complete public action history for the current round, in committed order. */
  readonly history: DoudizhuState['history']
  readonly legalActions: readonly DoudizhuAction[]
  readonly result?: DoudizhuResult
}

/** Public projection safe for all three browsers and ordinary logs. */
export interface DoudizhuPublicView {
  readonly version: number
  readonly phase: DoudizhuState['phase']
  readonly cardCounts: readonly [number, number, number]
  readonly bottom: readonly DoudizhuCardId[]
  readonly currentSeat?: DoudizhuSeat
  readonly landlord?: DoudizhuSeat
  readonly highestBid: 0 | 1 | 2 | 3
  readonly bids: readonly DoudizhuBidRecord[]
  readonly lastPlay?: DoudizhuPlayRecord
  readonly consecutivePasses: number
  readonly multiplier: number
  readonly history: DoudizhuState['history']
  readonly result?: DoudizhuResult
}

/** Engine construction request with injected deterministic deck order. */
export interface CreateDoudizhuRequest {
  readonly deck: readonly DoudizhuCardId[]
  readonly biddingStarter: DoudizhuSeat
}

/** State transition request. */
export interface ApplyDoudizhuActionRequest {
  readonly state: DoudizhuState
  readonly seat: DoudizhuSeat
  readonly action: DoudizhuAction
}
