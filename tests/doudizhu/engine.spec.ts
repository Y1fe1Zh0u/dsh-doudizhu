import { describe, expect, it } from 'vitest'
import {
  DOUDIZHU_DECK,
  DoudizhuCardId,
  DoudizhuError,
  applyDoudizhuAction,
  classifyDoudizhuCombination,
  createDoudizhuGame,
  doudizhuPrivateView,
  validateDoudizhuState,
  type DoudizhuAction,
  type DoudizhuCardId as CardId,
  type DoudizhuState,
} from '../../src/doudizhu/index.ts'

const canonical = DOUDIZHU_DECK.map(card => card.id)

describe('DouDizhu engine', () => {
  it('deals 17 cards per seat, keeps three bottom cards private, and validates the exact deck', () => {
    const state = createDoudizhuGame({ deck: canonical, biddingStarter: 1 })
    expect(state.hands.map(hand => hand.length)).toEqual([17, 17, 17])
    expect(state.bottom).toHaveLength(3)
    expect(state.bidder).toBe(1)
    expect(doudizhuPrivateView(state, 0).bottom).toEqual([])
    expect(validateDoudizhuState(state)).toEqual([])
    expect(() => createDoudizhuGame({ deck: canonical.slice(1), biddingStarter: 0 }))
      .toThrow(expect.objectContaining<Partial<DoudizhuError>>({ code: 'DOUDIZHU_INVALID_DECK' }))
  })

  it('settles three passes as redeal and a highest score as landlord', () => {
    let redeal = createDoudizhuGame({ deck: canonical, biddingStarter: 0 })
    for (const seat of [0, 1, 2] as const) redeal = applyDoudizhuAction({ state: redeal, seat, action: { type: 'bid', score: 0 } })
    expect(redeal.phase).toBe('redeal')

    let game = createDoudizhuGame({ deck: canonical, biddingStarter: 0 })
    game = applyDoudizhuAction({ state: game, seat: 0, action: { type: 'bid', score: 1 } })
    game = applyDoudizhuAction({ state: game, seat: 1, action: { type: 'bid', score: 2 } })
    game = applyDoudizhuAction({ state: game, seat: 2, action: { type: 'bid', score: 0 } })
    expect(game).toMatchObject({ phase: 'playing', landlord: 1, currentSeat: 1, highestBid: 2 })
    expect(game.hands.map(hand => hand.length)).toEqual([17, 20, 17])
    expect(doudizhuPrivateView(game, 2)).toMatchObject({
      yourRole: 'farmer',
      landlord: 1,
      history: [
        { seat: 0, score: 1 },
        { seat: 1, score: 2 },
        { seat: 2, score: 0 },
      ],
    })
  })

  it('enforces current-seat, ownership, combination, comparison, and leader-pass rules', () => {
    let game = createDoudizhuGame({ deck: canonical, biddingStarter: 0 })
    game = applyDoudizhuAction({ state: game, seat: 0, action: { type: 'bid', score: 3 } })
    expect(() => applyDoudizhuAction({ state: game, seat: 1, action: { type: 'pass' } }))
      .toThrow(expect.objectContaining<Partial<DoudizhuError>>({ code: 'DOUDIZHU_NOT_CURRENT_SEAT' }))
    expect(() => applyDoudizhuAction({ state: game, seat: 0, action: { type: 'pass' } }))
      .toThrow(expect.objectContaining<Partial<DoudizhuError>>({ code: 'DOUDIZHU_INVALID_ACTION' }))
    expect(() => applyDoudizhuAction({ state: game, seat: 0, action: { type: 'play', cards: [DoudizhuCardId('not-a-card')] } }))
      .toThrow()
  })

  it('doubles bombs and spring, resets after two passes, and settles zero-sum scores', () => {
    const landlordCards = ids(
      'C3', 'D3', 'H3', 'S3',
      'C4', 'D4', 'H4', 'C5', 'D5', 'H5', 'C6', 'D6', 'H6', 'C7', 'D7', 'H7',
      'C8', 'C9', 'C10', 'CJ',
    )
    let game = createDoudizhuGame({ deck: deckForSeatZero(landlordCards), biddingStarter: 0 })
    game = applyDoudizhuAction({ state: game, seat: 0, action: { type: 'bid', score: 3 } })
    const bomb = ids('C3', 'D3', 'H3', 'S3')
    game = applyDoudizhuAction({ state: game, seat: 0, action: { type: 'play', cards: bomb } })
    expect(game.multiplier).toBe(2)
    game = applyDoudizhuAction({ state: game, seat: 1, action: { type: 'pass' } })
    game = applyDoudizhuAction({ state: game, seat: 2, action: { type: 'pass' } })
    expect(game).toMatchObject({ currentSeat: 0, lastPlay: undefined })
    game = applyDoudizhuAction({ state: game, seat: 0, action: { type: 'play', cards: game.hands[0] } })
    expect(game.result).toEqual({
      winner: 'landlord', spring: 'landlord', baseScore: 3, multiplier: 4, scores: [24, -12, -12],
    })
  })

  it('finishes a complete deterministic game without leaking another hand', () => {
    let state = createDoudizhuGame({ deck: canonical, biddingStarter: 0 })
    state = applyDoudizhuAction({ state, seat: 0, action: { type: 'bid', score: 3 } })
    const privateCard = state.hands[1].find(card => !state.bottom.includes(card))!
    const seatZeroView = doudizhuPrivateView(state, 0)
    expect(JSON.stringify(seatZeroView)).not.toContain(privateCard)

    for (let turns = 0; state.phase === 'playing' && turns < 500; turns += 1) {
      const seat = state.currentSeat!
      const actions = doudizhuPrivateView(state, seat).legalActions
      const action = chooseDeterministic(actions, state)
      state = applyDoudizhuAction({ state, seat, action })
    }
    expect(state.phase).toBe('finished')
    expect(state.result?.scores.reduce((sum, score) => sum + score, 0)).toBe(0)
    expect(validateDoudizhuState(state)).toEqual([])
  })
})

function ids(...values: string[]): CardId[] {
  return values.map(DoudizhuCardId)
}

function deckForSeatZero(target: readonly CardId[]): CardId[] {
  if (target.length !== 20) throw new Error('seat zero target must contain 20 cards')
  const first = target.slice(0, 17)
  const bottom = target.slice(17)
  const remaining = canonical.filter(card => !target.includes(card))
  const deck: CardId[] = []
  for (let round = 0; round < 17; round += 1) {
    deck.push(first[round]!, remaining[round * 2]!, remaining[round * 2 + 1]!)
  }
  deck.push(...bottom)
  return deck
}

function chooseDeterministic(actions: readonly DoudizhuAction[], state: DoudizhuState): DoudizhuAction {
  const plays = actions.filter((action): action is Extract<DoudizhuAction, { type: 'play' }> => action.type === 'play')
  if (plays.length === 0) return { type: 'pass' }
  if (state.lastPlay !== undefined) return plays[0] ?? { type: 'pass' }
  return plays.sort((left, right) => {
    const a = classifyDoudizhuCombination(left.cards)!
    const b = classifyDoudizhuCombination(right.cards)!
    return b.cards.length - a.cards.length
  })[0]!
}
