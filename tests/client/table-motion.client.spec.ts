// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DoudizhuCardId, DoudizhuPublicView } from '../../src/doudizhu/client.ts'
import type { DoudizhuTableSnapshot } from '../../src/doudizhu-runtime/client.ts'
import { appendMotionEvents, diffTableMotion, historyEntryKey, useTableMotion, type TableMotionEvent } from '../../src/client/table-motion.ts'

type RunningSnapshot = Exclude<DoudizhuTableSnapshot, { readonly status: 'failed' }>

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  setVisibility('visible')
})

describe('table motion snapshot diff', () => {
  it('turns appended history into ordered pass, trick-reset, play, and impact events', () => {
    const previous = snapshot([
      play(0, 'single', ['C3']),
    ])
    const current = snapshot([
      play(0, 'single', ['C3']),
      { seat: 1, pass: true },
      { seat: 2, pass: true },
      play(0, 'bomb', ['C4', 'D4', 'H4', 'S4']),
    ], { version: 5 })

    expect(diffTableMotion(previous, current).map(event => event.kind)).toEqual([
      'pass', 'pass', 'trick-reset', 'play', 'impact',
    ])
  })

  it('emits one deal event for a new deal without replaying its hydrated history', () => {
    const previous = snapshot([], { deal: 1 })
    const current = snapshot([play(2, 'single', ['S9'])], { deal: 2, version: 2 })
    expect(diffTableMotion(previous, current).map(event => event.kind)).toEqual(['deal', 'play'])
  })

  it('does not replay a replaced non-prefix history', () => {
    const previous = snapshot([play(0, 'single', ['C3'])])
    const current = snapshot([play(1, 'pair', ['C4', 'D4'])], { version: 2 })
    expect(diffTableMotion(previous, current)).toEqual([])
  })

  it('distinguishes single-round and final three-round settlement', () => {
    const running = snapshot([])
    const result = { winner: 'landlord', spring: 'none', baseScore: 1, multiplier: 2, scores: [4, -2, -2] } as const
    const roundFinished = snapshot([], { status: 'round-finished', roundResults: [result] })
    const finished = snapshot([], { status: 'finished', roundResults: [result] })
    expect(diffTableMotion(running, roundFinished)).toMatchObject([{ kind: 'settlement', final: false, result }])
    expect(diffTableMotion(running, finished)).toMatchObject([{ kind: 'settlement', final: true, result }])
  })

  it('keeps repeated RecentActions keys stable as the list grows', () => {
    const first: DoudizhuPublicView['history'] = [{ seat: 0, pass: true }, { seat: 0, pass: true }]
    const grown: DoudizhuPublicView['history'] = [...first, play(1, 'single', ['C3'])]
    expect(historyEntryKey(first, 0)).toBe(historyEntryKey(grown, 0))
    expect(historyEntryKey(first, 1)).toBe(historyEntryKey(grown, 1))
    expect(historyEntryKey(first, 0)).not.toBe(historyEntryKey(first, 1))
  })

  it('hydrates instead of replaying when more than four logical actions accumulate', () => {
    const events = Array.from({ length: 5 }, (_, index): TableMotionEvent => ({
      key: `1:1:${index}:pass`, kind: 'pass', seat: 0,
    }))
    expect(appendMotionEvents([], events)).toEqual([])
  })

  it('retains settlement when an action backlog is hydrated', () => {
    const events: TableMotionEvent[] = [
      ...Array.from({ length: 5 }, (_, index): TableMotionEvent => ({
        key: `1:1:${index}:pass`, kind: 'pass', seat: 0,
      })),
      { key: '1:1:settlement:finished', kind: 'settlement', final: true, round: 1 },
    ]
    expect(appendMotionEvents([], events)).toMatchObject([{ kind: 'settlement', final: true }])
  })

  it('does not animate initial hydration and advances its baseline while backgrounded', async () => {
    const initial = snapshot([play(0, 'single', ['C3'])])
    const view = renderHook(({ value }: { value: RunningSnapshot }) => useTableMotion(value, 'running'), {
      initialProps: { value: initial },
    })
    expect(view.result.current.event).toBeUndefined()

    setVisibility('hidden')
    view.rerender({ value: snapshot([...initial.state.history, { seat: 1, pass: true }], { version: 2 }) })
    await waitFor(() => { expect(view.result.current.event).toBeUndefined() })

    setVisibility('visible')
    view.rerender({ value: snapshot([
      ...initial.state.history,
      { seat: 1, pass: true },
      play(2, 'single', ['S9']),
    ], { version: 3 }) })
    await waitFor(() => { expect(view.result.current.event?.kind).toBe('play') })
  })

  it('deals only after this mount observed a pre-game room phase', async () => {
    const view = renderHook(({
      value, phase,
    }: {
      value: RunningSnapshot | undefined
      phase: 'lobby' | 'running'
    }) => useTableMotion(value, phase), {
      initialProps: { value: undefined, phase: 'lobby' },
    })
    view.rerender({ value: snapshot([]), phase: 'running' })
    await waitFor(() => { expect(view.result.current.event?.kind).toBe('deal') })

    const hydrated = renderHook(() => useTableMotion(snapshot([]), 'running'))
    expect(hydrated.result.current.event).toBeUndefined()
  })

  it('keeps authoritative final settlement visible under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const result = { winner: 'farmers', spring: 'none', baseScore: 1, multiplier: 2, scores: [-4, 2, 2] } as const
    const finished = snapshot([], { status: 'finished', round: 3, roundResults: [result] })
    const view = renderHook(() => useTableMotion(finished, 'finished'))
    expect(view.result.current.reducedMotion).toBe(true)
    expect(view.result.current.finalSettlement).toMatchObject({ kind: 'settlement', final: true, round: 3, result })
  })

  it('retires round settlement after two seconds but keeps final settlement out of the transient queue', () => {
    vi.useFakeTimers()
    const result = { winner: 'landlord', spring: 'none', baseScore: 1, multiplier: 2, scores: [4, -2, -2] } as const
    const view = renderHook(({ value }: { value: RunningSnapshot }) => useTableMotion(value, 'running'), {
      initialProps: { value: snapshot([]) },
    })
    view.rerender({ value: snapshot([], { status: 'round-finished', roundResults: [result] }) })
    expect(view.result.current.event).toMatchObject({ kind: 'settlement', final: false })
    act(() => { vi.advanceTimersByTime(1_999) })
    expect(view.result.current.event).toBeDefined()
    act(() => { vi.advanceTimersByTime(1) })
    expect(view.result.current.event).toBeUndefined()
  })

  it('hides the authoritative last play until its matching flight completes', () => {
    vi.useFakeTimers()
    const first = snapshot([play(0, 'single', ['C3'])])
    const second = snapshot([...first.state.history, play(1, 'single', ['S9'])], { version: 2 })
    const view = renderHook(({ value }: { value: RunningSnapshot }) => useTableMotion(value, 'running'), {
      initialProps: { value: first },
    })
    view.rerender({ value: second })
    expect(view.result.current.event?.kind).toBe('play')
    expect(view.result.current.hideLastPlay).toBe(true)
    act(() => { vi.advanceTimersByTime(480) })
    expect(view.result.current.hideLastPlay).toBe(false)
  })
})

function snapshot(
  history: DoudizhuPublicView['history'],
  overrides: Partial<RunningSnapshot> & { readonly version?: number } = {},
): RunningSnapshot {
  const { version = 1, ...snapshotOverrides } = overrides
  const lastPlay = history.findLast((entry): entry is Extract<typeof entry, { readonly combination: unknown }> => 'combination' in entry)
  return {
    game: 'doudizhu',
    status: 'running',
    round: 1,
    totalRounds: 3,
    deal: 1,
    totalScores: [0, 0, 0],
    roundResults: [],
    decisionOutcomes: [],
    state: {
      version,
      phase: 'playing',
      cardCounts: [17, 17, 17],
      bottom: [],
      currentSeat: 0,
      landlord: 0,
      highestBid: 3,
      bids: [],
      consecutivePasses: 0,
      multiplier: 1,
      history,
      ...(lastPlay === undefined ? {} : { lastPlay }),
    },
    ...snapshotOverrides,
  }
}

function play(
  seat: 0 | 1 | 2,
  kind: 'single' | 'pair' | 'bomb',
  cards: readonly string[],
): DoudizhuPublicView['history'][number] {
  return {
    seat,
    combination: {
      kind,
      cards: cards as readonly DoudizhuCardId[],
      primaryRank: '3',
      chainLength: 1,
    },
  }
}

function setVisibility(value: 'hidden' | 'visible'): void {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value })
  document.dispatchEvent(new Event('visibilitychange'))
}
