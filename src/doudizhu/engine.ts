/** Pure game creation, state transitions, settlement, and seat-private projection. */

import { sortDoudizhuCards, validateDoudizhuDeck } from './cards.ts'
import {
  beatsDoudizhuCombination,
  classifyDoudizhuCombination,
  legalDoudizhuPlayActions,
} from './combination.ts'
import { DoudizhuError } from './error.ts'
import type {
  ApplyDoudizhuActionRequest,
  CreateDoudizhuRequest,
  DoudizhuAction,
  DoudizhuBidRecord,
  DoudizhuCardId,
  DoudizhuPrivateView,
  DoudizhuPublicView,
  DoudizhuResult,
  DoudizhuSeat,
  DoudizhuState,
} from './types.ts'

/**
 * Create one dealt bidding state from an injected exact deck permutation.
 * @param request - validated deck order and bidding starter.
 * @returns initial immutable bidding state.
 */
export function createDoudizhuGame(request: CreateDoudizhuRequest): DoudizhuState {
  assertSeat(request.biddingStarter)
  try {
    validateDoudizhuDeck(request.deck)
  } catch (error: unknown) {
    throw new DoudizhuError(messageOf(error), 'DOUDIZHU_INVALID_DECK')
  }
  const hands: [DoudizhuCardId[], DoudizhuCardId[], DoudizhuCardId[]] = [[], [], []]
  for (let index = 0; index < 51; index += 1) {
    hands[index % 3 as DoudizhuSeat].push(required(request.deck[index], 'dealt card'))
  }
  const bottom = request.deck.slice(51)
  const state: DoudizhuState = {
    version: 0,
    phase: 'bidding',
    bidder: request.biddingStarter,
    biddingStarter: request.biddingStarter,
    bids: [],
    highestBid: 0,
    highestBidder: undefined,
    landlord: undefined,
    currentSeat: undefined,
    hands: [sortDoudizhuCards(hands[0]), sortDoudizhuCards(hands[1]), sortDoudizhuCards(hands[2])],
    bottom: [required(bottom[0], 'first bottom card'), required(bottom[1], 'second bottom card'), required(bottom[2], 'third bottom card')],
    lastPlay: undefined,
    consecutivePasses: 0,
    multiplier: 1,
    playsBySeat: [0, 0, 0],
    history: [],
    result: undefined,
  }
  assertDoudizhuState(state)
  return state
}

/**
 * Build the public game projection with no private hand identities.
 * @param state - complete coordinator state.
 * @returns detached public projection.
 */
export function doudizhuPublicView(state: DoudizhuState): DoudizhuPublicView {
  assertDoudizhuState(state)
  return {
    version: state.version,
    phase: state.phase,
    cardCounts: [state.hands[0].length, state.hands[1].length, state.hands[2].length],
    bottom: state.phase === 'bidding' ? [] : [...state.bottom],
    ...(state.currentSeat === undefined ? {} : { currentSeat: state.currentSeat }),
    ...(state.landlord === undefined ? {} : { landlord: state.landlord }),
    highestBid: state.highestBid,
    bids: state.bids.map(bid => ({ ...bid })),
    ...(state.lastPlay === undefined ? {} : { lastPlay: clonePlay(state.lastPlay) }),
    consecutivePasses: state.consecutivePasses,
    multiplier: state.multiplier,
    history: state.history.map(cloneHistoryEntry),
    ...(state.result === undefined ? {} : { result: cloneResult(state.result) }),
  }
}

/**
 * Apply one current-seat bid, play, or pass.
 * @param request - state, addressed seat, and proposed action.
 * @returns detached validated next state.
 */
export function applyDoudizhuAction(request: ApplyDoudizhuActionRequest): DoudizhuState {
  assertDoudizhuState(request.state)
  assertSeat(request.seat)
  if (request.state.phase === 'bidding') return applyBid(request.state, request.seat, request.action)
  if (request.state.phase === 'playing') return applyPlay(request.state, request.seat, request.action)
  throw new DoudizhuError(`cannot act in phase ${JSON.stringify(request.state.phase)}`, 'DOUDIZHU_INVALID_ACTION')
}

/**
 * Build the only state and legal actions one seat may receive.
 * @param state - complete coordinator state.
 * @param seat - addressed private seat.
 * @returns detached seat-private projection.
 */
export function doudizhuPrivateView(state: DoudizhuState, seat: DoudizhuSeat): DoudizhuPrivateView {
  assertDoudizhuState(state)
  assertSeat(seat)
  const legalActions = legalActionsFor(state, seat)
  return {
    version: state.version,
    phase: state.phase,
    yourSeat: seat,
    ...(state.landlord === undefined ? {} : { yourRole: state.landlord === seat ? 'landlord' : 'farmer' }),
    yourCards: [...state.hands[seat]],
    cardCounts: [state.hands[0].length, state.hands[1].length, state.hands[2].length],
    bottom: state.phase === 'bidding' ? [] : [...state.bottom],
    ...(state.currentSeat === undefined ? {} : { currentSeat: state.currentSeat }),
    ...(state.landlord === undefined ? {} : { landlord: state.landlord }),
    highestBid: state.highestBid,
    bids: state.bids.map(bid => ({ ...bid })),
    ...(state.lastPlay === undefined ? {} : { lastPlay: clonePlay(state.lastPlay) }),
    multiplier: state.multiplier,
    history: state.history.map(cloneHistoryEntry),
    legalActions,
    ...(state.result === undefined ? {} : { result: cloneResult(state.result) }),
  }
}

/**
 * Return invariant failures without changing the supplied state.
 * @param state - candidate typed engine state.
 * @returns diagnostics; empty means every relationship holds.
 */
export function validateDoudizhuState(state: DoudizhuState): string[] {
  const failures: string[] = []
  if (!Number.isSafeInteger(state.version) || state.version < 0) failures.push('version must be a non-negative safe integer')
  if (!['bidding', 'playing', 'redeal', 'finished'].includes(state.phase)) failures.push('phase is unsupported')
  const allCards = state.phase === 'bidding' || state.phase === 'redeal'
    ? [...state.hands.flat(), ...state.bottom]
    : state.hands.flat()
  const expectedCount = state.phase === 'bidding' || state.phase === 'redeal'
    ? 54
    : 54 - state.history.filter(entry => 'combination' in entry).reduce((sum, entry) => sum + entry.combination.cards.length, 0)
  if (allCards.length !== expectedCount) failures.push(`remaining card count ${allCards.length} does not match expected ${expectedCount}`)
  if (new Set(allCards).size !== allCards.length) failures.push('remaining cards contain duplicate identities')
  try {
    for (const id of allCards) sortDoudizhuCards([id])
  } catch (error: unknown) {
    failures.push(messageOf(error))
  }
  if (state.phase === 'bidding' && state.bids.length > 2 && state.highestBid !== 3) failures.push('three completed bids must settle bidding')
  if ((state.phase === 'playing' || state.phase === 'finished') && state.landlord === undefined) failures.push('playing state requires a landlord')
  if (state.phase === 'playing' && state.currentSeat === undefined) failures.push('playing state requires a current seat')
  if (state.phase === 'finished' && state.result === undefined) failures.push('finished state requires a result')
  if (state.phase !== 'finished' && state.result !== undefined) failures.push('only finished state may carry a result')
  if (!Number.isSafeInteger(state.multiplier) || state.multiplier < 1) failures.push('multiplier must be a positive safe integer')
  return failures
}

function applyBid(state: DoudizhuState, seat: DoudizhuSeat, action: DoudizhuAction): DoudizhuState {
  if (seat !== state.bidder) throw new DoudizhuError('only the current bidder may act', 'DOUDIZHU_NOT_CURRENT_SEAT')
  if (action.type !== 'bid') throw new DoudizhuError('bidding accepts only bid actions', 'DOUDIZHU_INVALID_ACTION')
  if (action.score !== 0 && action.score <= state.highestBid) {
    throw new DoudizhuError('a non-zero bid must exceed the current highest bid', 'DOUDIZHU_ILLEGAL_BID')
  }
  const bid: DoudizhuBidRecord = { seat, score: action.score }
  const bids = [...state.bids, bid]
  const highestBid = action.score > state.highestBid ? action.score : state.highestBid
  const highestBidder = action.score > state.highestBid ? seat : state.highestBidder
  if (action.score === 3 || bids.length === 3) {
    if (highestBidder === undefined || highestBid === 0) {
      return checked({
        ...state,
        version: state.version + 1,
        phase: 'redeal',
        bids,
        highestBid,
        highestBidder: undefined,
        landlord: undefined,
        currentSeat: undefined,
        history: [...state.history, bid],
      })
    }
    const hands = state.hands.map(hand => [...hand]) as [DoudizhuCardId[], DoudizhuCardId[], DoudizhuCardId[]]
    hands[highestBidder].push(...state.bottom)
    hands[highestBidder] = sortDoudizhuCards(hands[highestBidder])
    return checked({
      ...state,
      version: state.version + 1,
      phase: 'playing',
      bids,
      highestBid,
      highestBidder,
      landlord: highestBidder,
      currentSeat: highestBidder,
      hands,
      history: [...state.history, bid],
    })
  }
  return checked({
    ...state,
    version: state.version + 1,
    bidder: nextSeat(seat),
    bids,
    highestBid,
    highestBidder,
    history: [...state.history, bid],
  })
}

function applyPlay(state: DoudizhuState, seat: DoudizhuSeat, action: DoudizhuAction): DoudizhuState {
  if (seat !== state.currentSeat) throw new DoudizhuError('only the current player may act', 'DOUDIZHU_NOT_CURRENT_SEAT')
  if (action.type === 'bid') throw new DoudizhuError('play phase rejects bids', 'DOUDIZHU_INVALID_ACTION')
  if (action.type === 'pass') {
    if (state.lastPlay === undefined) throw new DoudizhuError('the trick leader cannot pass', 'DOUDIZHU_INVALID_ACTION')
    const passes = state.consecutivePasses + 1
    const reset = passes === 2
    return checked({
      ...state,
      version: state.version + 1,
      currentSeat: reset ? state.lastPlay.seat : nextSeat(seat),
      lastPlay: reset ? undefined : state.lastPlay,
      consecutivePasses: reset ? 0 : passes,
      history: [...state.history, { seat, pass: true }],
    })
  }
  const cards = sortDoudizhuCards(action.cards)
  if (cards.length === 0 || new Set(cards).size !== cards.length) {
    throw new DoudizhuError('play must contain unique cards', 'DOUDIZHU_ILLEGAL_COMBINATION')
  }
  if (!containsCards(state.hands[seat], cards)) throw new DoudizhuError('play contains a card outside the seat hand', 'DOUDIZHU_CARD_NOT_OWNED')
  const combination = classifyDoudizhuCombination(cards)
  if (combination === null) throw new DoudizhuError('cards form no legal combination', 'DOUDIZHU_ILLEGAL_COMBINATION')
  if (state.lastPlay !== undefined && !beatsDoudizhuCombination(combination, state.lastPlay.combination)) {
    throw new DoudizhuError('play does not beat the current combination', 'DOUDIZHU_PLAY_DOES_NOT_BEAT')
  }
  const hands = state.hands.map(hand => [...hand]) as [DoudizhuCardId[], DoudizhuCardId[], DoudizhuCardId[]]
  const removed = new Set(cards)
  hands[seat] = hands[seat].filter(card => !removed.has(card))
  const play = { seat, combination } as const
  const playsBySeat = [...state.playsBySeat] as [number, number, number]
  playsBySeat[seat] += 1
  const multiplier = state.multiplier * (combination.kind === 'bomb' || combination.kind === 'rocket' ? 2 : 1)
  if (hands[seat].length === 0) {
    const result = settle(state, seat, multiplier, playsBySeat)
    return checked({
      ...state,
      version: state.version + 1,
      phase: 'finished',
      currentSeat: undefined,
      hands,
      lastPlay: play,
      consecutivePasses: 0,
      multiplier: result.multiplier,
      playsBySeat,
      history: [...state.history, play],
      result,
    })
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
    history: [...state.history, play],
  })
}

function legalActionsFor(state: DoudizhuState, seat: DoudizhuSeat): DoudizhuAction[] {
  if (state.phase === 'bidding' && state.bidder === seat) {
    const actions: DoudizhuAction[] = [{ type: 'bid', score: 0 }]
    for (const score of [1, 2, 3] as const) if (score > state.highestBid) actions.push({ type: 'bid', score })
    return actions
  }
  if (state.phase === 'playing' && state.currentSeat === seat) return legalDoudizhuPlayActions(state.hands[seat], state.lastPlay)
  return []
}

function settle(
  state: DoudizhuState,
  winningSeat: DoudizhuSeat,
  multiplier: number,
  playsBySeat: readonly [number, number, number],
): DoudizhuResult {
  const landlord = state.landlord
  if (landlord === undefined || state.highestBid === 0) throw new DoudizhuError('settlement requires landlord and bid', 'DOUDIZHU_INVALID_STATE')
  const landlordWon = winningSeat === landlord
  const farmers = ([0, 1, 2] as const).filter(seat => seat !== landlord)
  const landlordSpring = landlordWon && farmers.every(seat => playsBySeat[seat] === 0)
  const farmerSpring = !landlordWon && playsBySeat[landlord] === 1
  const spring = landlordSpring ? 'landlord' : farmerSpring ? 'farmers' : 'none'
  const finalMultiplier = multiplier * (spring === 'none' ? 1 : 2)
  const unit = state.highestBid * finalMultiplier
  const scores: [number, number, number] = [0, 0, 0]
  scores[landlord] = landlordWon ? unit * 2 : -unit * 2
  for (const farmer of farmers) scores[farmer] = landlordWon ? -unit : unit
  return {
    winner: landlordWon ? 'landlord' : 'farmers',
    spring,
    baseScore: state.highestBid,
    multiplier: finalMultiplier,
    scores,
  }
}

function checked(state: DoudizhuState): DoudizhuState {
  assertDoudizhuState(state)
  return state
}

function assertDoudizhuState(state: DoudizhuState): void {
  const failures = validateDoudizhuState(state)
  if (failures.length > 0) throw new DoudizhuError(failures.join('; '), 'DOUDIZHU_INVALID_STATE')
}

function assertSeat(value: number): asserts value is DoudizhuSeat {
  if (value !== 0 && value !== 1 && value !== 2) throw new DoudizhuError(`invalid seat ${value}`, 'DOUDIZHU_INVALID_STATE')
}

function nextSeat(seat: DoudizhuSeat): DoudizhuSeat {
  return (seat + 1) % 3 as DoudizhuSeat
}

function containsCards(hand: readonly DoudizhuCardId[], cards: readonly DoudizhuCardId[]): boolean {
  const available = new Set(hand)
  return cards.every(card => available.has(card))
}

function clonePlay(play: NonNullable<DoudizhuState['lastPlay']>): NonNullable<DoudizhuState['lastPlay']> {
  return { seat: play.seat, combination: { ...play.combination, cards: [...play.combination.cards] } }
}

function cloneResult(result: DoudizhuResult): DoudizhuResult {
  return { ...result, scores: [...result.scores] as [number, number, number] }
}

function cloneHistoryEntry(entry: DoudizhuState['history'][number]): DoudizhuState['history'][number] {
  if ('combination' in entry) return clonePlay(entry)
  return { ...entry }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`DouDizhu internal invariant failed: missing ${label}`)
  return value
}
