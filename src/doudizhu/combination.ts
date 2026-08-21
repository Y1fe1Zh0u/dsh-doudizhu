/** Combination classification, comparison, and legal play enumeration. */

import {
  DOUDIZHU_RANKS,
  doudizhuCard,
  doudizhuRankIndex,
  sortDoudizhuCards,
} from './cards.ts'
import type {
  DoudizhuAction,
  DoudizhuCardId,
  DoudizhuCombination,
  DoudizhuCombinationKind,
  DoudizhuPlayRecord,
  DoudizhuRank,
} from './types.ts'

interface RankGroup {
  readonly rank: DoudizhuRank
  readonly cards: readonly DoudizhuCardId[]
}

interface LegalPlay {
  readonly action: Extract<DoudizhuAction, { type: 'play' }>
  readonly combination: DoudizhuCombination
}

type WingMode = 'none' | 'single' | 'pair'

/**
 * Classify one exact physical-card selection.
 * @param input - non-empty, duplicate-free canonical card identities.
 * @returns canonical combination, or null when the cards form no legal play.
 */
export function classifyDoudizhuCombination(input: readonly DoudizhuCardId[]): DoudizhuCombination | null {
  if (input.length === 0 || new Set(input).size !== input.length) return null
  let cards: DoudizhuCardId[]
  try {
    cards = sortDoudizhuCards(input)
  } catch {
    return null
  }
  const groups = rankGroups(cards)
  const counts = groups.map(group => group.cards.length).sort((left, right) => right - left)

  if (cards.length === 2 && groups.length === 2 && groups.some(group => group.rank === 'SJ') && groups.some(group => group.rank === 'BJ')) {
    return combination('rocket', cards, 'BJ', 1)
  }
  if (groups.length === 1) {
    const rank = required(groups[0], 'single rank group').rank
    if (cards.length === 1) return combination('single', cards, rank, 1)
    if (cards.length === 2 && rank !== 'SJ' && rank !== 'BJ') return combination('pair', cards, rank, 1)
    if (cards.length === 3) return combination('triple', cards, rank, 1)
    if (cards.length === 4) return combination('bomb', cards, rank, 1)
  }
  if (cards.length === 4 && counts.join(',') === '3,1') return bodyCombination('triple-single', cards, groups, 3)
  if (cards.length === 5 && counts.join(',') === '3,2') return bodyCombination('triple-pair', cards, groups, 3)
  if (cards.length >= 5 && groups.every(group => group.cards.length === 1) && consecutive(groups, 5)) {
    return combination('straight', cards, required(groups.at(-1), 'straight tail').rank, groups.length)
  }
  if (cards.length >= 6 && groups.every(group => group.cards.length === 2) && consecutive(groups, 3)) {
    return combination('pair-straight', cards, required(groups.at(-1), 'pair-straight tail').rank, groups.length)
  }
  for (const [kind, mode, unit] of [
    ['airplane', 'none', 3],
    ['airplane-single', 'single', 4],
    ['airplane-pair', 'pair', 5],
  ] as const satisfies readonly [DoudizhuCombinationKind, WingMode, number][]) {
    if (cards.length % unit !== 0) continue
    const chainLength = cards.length / unit
    if (chainLength < 2) continue
    const primary = airplanePrimary(groups, chainLength, mode)
    if (primary !== undefined) return combination(kind, cards, primary, chainLength)
  }
  if (cards.length === 6 && counts[0] === 4) {
    const body = groups.find(group => group.cards.length === 4)
    const wings = groups.filter(group => group !== body)
    if (body !== undefined && !containsRocket(wings) && wings.reduce((sum, group) => sum + group.cards.length, 0) === 2) {
      return combination('four-two-single', cards, body.rank, 1)
    }
  }
  if (cards.length === 8 && counts.join(',') === '4,2,2') return bodyCombination('four-two-pair', cards, groups, 4)
  return null
}

/**
 * Decide whether one classified play beats the current play.
 * @param challenger - proposed classified play.
 * @param current - current trick play.
 * @returns true exactly when the challenger is legal over the current play.
 */
export function beatsDoudizhuCombination(challenger: DoudizhuCombination, current: DoudizhuCombination): boolean {
  if (challenger.kind === 'rocket') return current.kind !== 'rocket'
  if (current.kind === 'rocket') return false
  if (challenger.kind === 'bomb' && current.kind !== 'bomb') return true
  if (current.kind === 'bomb' && challenger.kind !== 'bomb') return false
  return challenger.kind === current.kind
    && challenger.cards.length === current.cards.length
    && challenger.chainLength === current.chainLength
    && doudizhuRankIndex(challenger.primaryRank) > doudizhuRankIndex(current.primaryRank)
}

/**
 * Enumerate one canonical physical-card action for every legal rank multiset.
 * @param hand - current seat's private hand.
 * @param current - current trick play, absent when the seat leads.
 * @returns stable strength-ordered legal play actions plus pass when following.
 */
export function legalDoudizhuPlayActions(
  hand: readonly DoudizhuCardId[],
  current?: DoudizhuPlayRecord,
): DoudizhuAction[] {
  const groups = rankGroups(sortDoudizhuCards(hand))
  const byRank = new Map(groups.map(group => [group.rank, group]))
  const plays = new Map<string, LegalPlay>()
  const add = (cards: readonly DoudizhuCardId[]): void => {
    const sorted = sortDoudizhuCards(cards)
    const classified = classifyDoudizhuCombination(sorted)
    if (classified === null) return
    if (current !== undefined && !beatsDoudizhuCombination(classified, current.combination)) return
    plays.set(sorted.join('\u0000'), { action: { type: 'play', cards: sorted }, combination: classified })
  }

  for (const group of groups) {
    add(group.cards.slice(0, 1))
    if (group.cards.length >= 2 && !isJoker(group.rank)) add(group.cards.slice(0, 2))
    if (group.cards.length >= 3) add(group.cards.slice(0, 3))
    if (group.cards.length === 4) add(group.cards)
  }
  const smallJoker = byRank.get('SJ')
  const bigJoker = byRank.get('BJ')
  if (smallJoker !== undefined && bigJoker !== undefined) {
    add([required(smallJoker.cards[0], 'small joker'), required(bigJoker.cards[0], 'big joker')])
  }

  for (const body of groups.filter(group => group.cards.length >= 3)) {
    for (const wing of groups.filter(group => group.rank !== body.rank)) {
      add([...body.cards.slice(0, 3), required(wing.cards[0], 'single wing')])
      if (wing.cards.length >= 2 && !isJoker(wing.rank)) add([...body.cards.slice(0, 3), ...wing.cards.slice(0, 2)])
    }
  }

  for (const run of consecutiveRuns(groups.filter(group => group.cards.length >= 1), 5)) {
    add(run.map(group => required(group.cards[0], 'straight card')))
  }
  for (const run of consecutiveRuns(groups.filter(group => group.cards.length >= 2), 3)) {
    add(run.flatMap(group => group.cards.slice(0, 2)))
  }

  for (const body of consecutiveRuns(groups.filter(group => group.cards.length >= 3), 2)) {
    const bodyRanks = new Set(body.map(group => group.rank))
    const core = body.flatMap(group => group.cards.slice(0, 3))
    add(core)
    const singleWings = groups.filter(group => !bodyRanks.has(group.rank) && group.cards.length < 4)
    for (const wings of choose(singleWings, body.length)) {
      if (!containsRocket(wings)) add([...core, ...wings.map(group => required(group.cards[0], 'airplane wing'))])
    }
    const pairWings = groups.filter(group => !bodyRanks.has(group.rank)
      && group.cards.length >= 2 && group.cards.length < 4 && !isJoker(group.rank))
    for (const wings of choose(pairWings, body.length)) {
      add([...core, ...wings.flatMap(group => group.cards.slice(0, 2))])
    }
  }

  for (const body of groups.filter(group => group.cards.length === 4)) {
    const wings = groups.filter(group => group.rank !== body.rank && group.cards.length < 4)
    for (const pair of choose(wings, 2)) {
      const left = required(pair[0], 'left four-two wing')
      const right = required(pair[1], 'right four-two wing')
      if (!containsRocket(pair)) {
        add([...body.cards, required(left.cards[0], 'left four-two card'), required(right.cards[0], 'right four-two card')])
      }
    }
    for (const wing of wings.filter(group => group.cards.length >= 2 && !isJoker(group.rank))) {
      add([...body.cards, ...wing.cards.slice(0, 2)])
    }
    const pairWings = wings.filter(group => group.cards.length >= 2 && !isJoker(group.rank))
    for (const pair of choose(pairWings, 2)) add([...body.cards, ...pair.flatMap(group => group.cards.slice(0, 2))])
  }

  const sorted = [...plays.values()].sort((left, right) => combinationOrder(left.combination) - combinationOrder(right.combination)
    || left.combination.cards.length - right.combination.cards.length
    || doudizhuRankIndex(left.combination.primaryRank) - doudizhuRankIndex(right.combination.primaryRank))
    .map(play => play.action)
  return current === undefined ? sorted : [...sorted, { type: 'pass' }]
}

function rankGroups(cards: readonly DoudizhuCardId[]): RankGroup[] {
  const grouped = new Map<DoudizhuRank, DoudizhuCardId[]>()
  for (const id of cards) {
    const rank = doudizhuCard(id).rank
    const group = grouped.get(rank) ?? []
    group.push(id)
    grouped.set(rank, group)
  }
  return [...grouped].map(([rank, ids]) => ({ rank, cards: sortDoudizhuCards(ids) }))
    .sort((left, right) => doudizhuRankIndex(left.rank) - doudizhuRankIndex(right.rank))
}

function combination(
  kind: DoudizhuCombinationKind,
  cards: readonly DoudizhuCardId[],
  primaryRank: DoudizhuRank,
  chainLength: number,
): DoudizhuCombination {
  return { kind, cards: sortDoudizhuCards(cards), primaryRank, chainLength }
}

function bodyCombination(
  kind: DoudizhuCombinationKind,
  cards: readonly DoudizhuCardId[],
  groups: readonly RankGroup[],
  count: number,
): DoudizhuCombination | null {
  const body = groups.find(group => group.cards.length === count)
  return body === undefined ? null : combination(kind, cards, body.rank, 1)
}

function consecutive(groups: readonly RankGroup[], minimum: number): boolean {
  if (groups.length < minimum || groups.some(group => doudizhuRankIndex(group.rank) > doudizhuRankIndex('A'))) return false
  return groups.every((group, index) => index === 0
    || doudizhuRankIndex(group.rank) === doudizhuRankIndex(required(groups[index - 1], 'previous chain rank').rank) + 1)
}

function airplanePrimary(groups: readonly RankGroup[], chainLength: number, mode: WingMode): DoudizhuRank | undefined {
  const bodyCandidates = consecutiveRuns(groups.filter(group => group.cards.length >= 3), chainLength)
    .filter(run => run.length === chainLength)
  const valid: DoudizhuRank[] = []
  for (const body of bodyCandidates) {
    const bodyRanks = new Set(body.map(group => group.rank))
    const remainder = groups.flatMap((group) => {
      const remove = bodyRanks.has(group.rank) ? 3 : 0
      return Array.from({ length: group.cards.length - remove }, () => group.rank)
    })
    const primary = required(body.at(-1), 'airplane body tail').rank
    if (mode === 'none' && remainder.length === 0) valid.push(primary)
    if (mode === 'single' && remainder.length === chainLength) {
      const wingGroups = rankCounts(remainder)
      if (wingGroups.every(([, count]) => count === 1) && !containsRocketRanks(remainder)) valid.push(primary)
    }
    if (mode === 'pair' && remainder.length === chainLength * 2) {
      const wingGroups = rankCounts(remainder)
      if (wingGroups.length === chainLength && wingGroups.every(([rank, count]) => count === 2 && !isJoker(rank))) {
        valid.push(primary)
      }
    }
  }
  return valid.sort((left, right) => doudizhuRankIndex(right) - doudizhuRankIndex(left))[0]
}

function consecutiveRuns(groups: readonly RankGroup[], minimum: number): RankGroup[][] {
  const eligible = groups.filter(group => doudizhuRankIndex(group.rank) <= doudizhuRankIndex('A'))
  const maximal: RankGroup[][] = []
  let current: RankGroup[] = []
  for (const group of eligible) {
    if (current.length === 0
      || doudizhuRankIndex(group.rank) === doudizhuRankIndex(required(current.at(-1), 'current run tail').rank) + 1) current.push(group)
    else {
      if (current.length >= minimum) maximal.push(current)
      current = [group]
    }
  }
  if (current.length >= minimum) maximal.push(current)
  const result: RankGroup[][] = []
  for (const run of maximal) {
    for (let length = minimum; length <= run.length; length += 1) {
      for (let start = 0; start + length <= run.length; start += 1) result.push(run.slice(start, start + length))
    }
  }
  return result
}

function choose<T>(items: readonly T[], count: number): T[][] {
  if (count === 0) return [[]]
  const result: T[][] = []
  for (let index = 0; index <= items.length - count; index += 1) {
    for (const tail of choose(items.slice(index + 1), count - 1)) {
      result.push([required(items[index], 'combination choice'), ...tail])
    }
  }
  return result
}

function rankCounts(ranks: readonly DoudizhuRank[]): Array<[DoudizhuRank, number]> {
  const counts = new Map<DoudizhuRank, number>()
  for (const rank of ranks) counts.set(rank, (counts.get(rank) ?? 0) + 1)
  return [...counts]
}

function containsRocket(groups: readonly RankGroup[]): boolean {
  return groups.some(group => group.rank === 'SJ') && groups.some(group => group.rank === 'BJ')
}

function containsRocketRanks(ranks: readonly DoudizhuRank[]): boolean {
  return ranks.includes('SJ') && ranks.includes('BJ')
}

function isJoker(rank: DoudizhuRank): boolean {
  return rank === 'SJ' || rank === 'BJ'
}

function combinationOrder(value: DoudizhuCombination): number {
  return DOUDIZHU_RANKS.length * COMBINATION_ORDER.indexOf(value.kind)
}

const COMBINATION_ORDER: readonly DoudizhuCombinationKind[] = [
  'single', 'pair', 'triple', 'triple-single', 'triple-pair', 'straight', 'pair-straight',
  'airplane', 'airplane-single', 'airplane-pair', 'four-two-single', 'four-two-pair', 'bomb', 'rocket',
]

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`DouDizhu internal invariant failed: missing ${label}`)
  return value
}
