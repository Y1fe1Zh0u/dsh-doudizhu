import { describe, expect, it } from 'vitest'
import {
  DoudizhuCardId,
  beatsDoudizhuCombination,
  classifyDoudizhuCombination,
  legalDoudizhuPlayActions,
} from '../../src/doudizhu/index.ts'

const cards = (...ids: string[]) => ids.map(DoudizhuCardId)

describe('DouDizhu combinations', () => {
  it.each([
    ['single', cards('C3')],
    ['pair', cards('C3', 'D3')],
    ['triple', cards('C3', 'D3', 'H3')],
    ['triple-single', cards('C3', 'D3', 'H3', 'C4')],
    ['triple-pair', cards('C3', 'D3', 'H3', 'C4', 'D4')],
    ['straight', cards('C3', 'C4', 'C5', 'C6', 'C7')],
    ['pair-straight', cards('C3', 'D3', 'C4', 'D4', 'C5', 'D5')],
    ['airplane', cards('C3', 'D3', 'H3', 'C4', 'D4', 'H4')],
    ['airplane-single', cards('C3', 'D3', 'H3', 'C4', 'D4', 'H4', 'C5', 'C6')],
    ['airplane-pair', cards('C3', 'D3', 'H3', 'C4', 'D4', 'H4', 'C5', 'D5', 'C6', 'D6')],
    ['four-two-single', cards('C3', 'D3', 'H3', 'S3', 'C4', 'C5')],
    ['four-two-pair', cards('C3', 'D3', 'H3', 'S3', 'C4', 'D4', 'C5', 'D5')],
    ['bomb', cards('C3', 'D3', 'H3', 'S3')],
    ['rocket', cards('joker-small', 'joker-big')],
  ] as const)('classifies %s', (kind, selection) => {
    expect(classifyDoudizhuCombination(selection)).toMatchObject({ kind })
  })

  it('rejects malformed chains and forbidden complete rocket wings', () => {
    expect(classifyDoudizhuCombination(cards('C10', 'CJ', 'CQ', 'CK', 'CA', 'C2'))).toBeNull()
    expect(classifyDoudizhuCombination(cards('C3', 'D3', 'H3', 'C4', 'D4', 'H4', 'joker-small', 'joker-big'))).toBeNull()
    expect(classifyDoudizhuCombination(cards('C3', 'C3'))).toBeNull()
  })

  it('compares ordinary families, bombs, and the rocket', () => {
    const single3 = classifyDoudizhuCombination(cards('C3'))!
    const single4 = classifyDoudizhuCombination(cards('C4'))!
    const pair4 = classifyDoudizhuCombination(cards('C4', 'D4'))!
    const bomb3 = classifyDoudizhuCombination(cards('C3', 'D3', 'H3', 'S3'))!
    const bomb4 = classifyDoudizhuCombination(cards('C4', 'D4', 'H4', 'S4'))!
    const rocket = classifyDoudizhuCombination(cards('joker-small', 'joker-big'))!

    expect(beatsDoudizhuCombination(single4, single3)).toBe(true)
    expect(beatsDoudizhuCombination(pair4, single3)).toBe(false)
    expect(beatsDoudizhuCombination(bomb3, pair4)).toBe(true)
    expect(beatsDoudizhuCombination(bomb4, bomb3)).toBe(true)
    expect(beatsDoudizhuCombination(rocket, bomb4)).toBe(true)
    expect(beatsDoudizhuCombination(bomb4, rocket)).toBe(false)
  })

  it('enumerates canonical legal actions without equivalent suit duplicates', () => {
    const hand = cards('C3', 'D3', 'H3', 'S3', 'C4', 'D4', 'C5', 'D5', 'joker-small', 'joker-big')
    const lead = legalDoudizhuPlayActions(hand)
    expect(lead.some(action => action.type === 'play' && classifyDoudizhuCombination(action.cards)?.kind === 'rocket')).toBe(true)
    expect(lead.filter(action => action.type === 'play' && action.cards.length === 1)).toHaveLength(5)

    const current = { seat: 1 as const, combination: classifyDoudizhuCombination(cards('C4', 'D4'))! }
    const follow = legalDoudizhuPlayActions(hand, current)
    expect(follow.at(-1)).toEqual({ type: 'pass' })
    expect(follow.filter(action => action.type === 'play').every((action) => {
      const classified = classifyDoudizhuCombination(action.cards)!
      return classified.kind === 'bomb' || classified.kind === 'rocket' || (classified.kind === 'pair' && classified.primaryRank === '5')
    })).toBe(true)
  })
})
