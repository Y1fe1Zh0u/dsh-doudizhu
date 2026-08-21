// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { LanRoomParticipantView } from '../../src/transport/client.ts'
import { LanGameTable } from '../../src/client/LanGameTable.tsx'
import type { LanGameClientState } from '../../src/client/controller.ts'
import { zh, type LanGameKey } from '../../src/client/locales.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const t = (key: LanGameKey): string => zh[key]

function participant(phase: LanRoomParticipantView['room']['phase']): LanRoomParticipantView {
  return {
    memberId: 'session-a',
    role: 'coordinator',
    connection: 'connected',
    strategyPrompt: '保留炸弹。',
    joinUrls: ['ws://192.168.1.8:43120/'],
    ...(phase === 'running' ? { gameSessionId: 'lan-game-child' } : {}),
    gameSessionState: phase === 'running' ? 'ready' : 'absent',
    room: {
      id: 'room-a', code: '123456', revision: 8, phase, coordinatorId: 'session-a', maxMembers: 3,
      members: [
        { id: 'session-a', seat: 0, ready: phase !== 'lobby', connected: true, promptHash: 'a'.repeat(64) },
        { id: 'session-b', seat: 1, ready: phase !== 'lobby', connected: true, promptHash: 'b'.repeat(64) },
        { id: 'session-c', seat: 2, ready: phase !== 'lobby', connected: true, promptHash: 'c'.repeat(64) },
      ],
    },
  }
}

function renderTable(state: LanGameClientState) {
  const actions = {
    start: vi.fn(() => vi.fn()),
    host: vi.fn().mockResolvedValue(undefined),
    join: vi.fn().mockResolvedValue(undefined),
    updatePrompt: vi.fn().mockResolvedValue(undefined),
    setReady: vi.fn().mockResolvedValue(undefined),
    leave: vi.fn().mockResolvedValue(undefined),
  }
  render(<LanGameTable {...({
    useLanGame: (selector: (value: LanGameClientState) => unknown) => selector(state),
    ...actions,
    t,
  } as unknown as Parameters<typeof LanGameTable>[0])} />)
  return actions
}

describe('LanGameTable', () => {
  it('creates or joins from the setup table with only a strategy Prompt setting', () => {
    const actions = renderTable({ status: 'idle', participant: undefined, pending: false, error: undefined })
    expect(screen.getByRole('heading', { name: '局域网 AI 斗地主' })).toBeTruthy()
    expect(screen.getAllByText('策略 Prompt')).toHaveLength(1)
    const prompt = screen.getByPlaceholderText(/稳健出牌/u)
    fireEvent.change(prompt, { target: { value: '主动抢地主。' } })
    fireEvent.click(screen.getByRole('button', { name: '创建房间' }))
    expect(actions.host).toHaveBeenCalledWith('主动抢地主。')
  })

  it('renders three seats, pairing data, and editable lobby controls', () => {
    const actions = renderTable({ status: 'room', participant: participant('lobby'), pending: false, error: undefined })
    expect(screen.getByText('123456')).toBeTruthy()
    expect(screen.getByText('ws://192.168.1.8:43120/')).toBeTruthy()
    expect(screen.getByText('你')).toBeTruthy()
    expect(screen.getAllByText('未准备')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: '准备' }))
    expect(actions.setReady).toHaveBeenCalledWith(true)
  })

  it('locks the Prompt and states the rules-engine handoff after Game Session startup', () => {
    renderTable({ status: 'room', participant: participant('running'), pending: false, error: undefined })
    expect(screen.getByText('模型已接管牌局')).toBeTruthy()
    expect(screen.getByText('Game Session 已就绪，等待规则引擎发牌')).toBeTruthy()
    expect(screen.getByText('赛前策略（已锁定）')).toBeTruthy()
    expect(screen.getByText('保留炸弹。')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '准备' })).toBeNull()
    expect(screen.queryByRole('button', { name: '保存策略' })).toBeNull()
  })

  it('keeps a disconnected seat visibly offline without presenting it as the active actor', () => {
    const base = participant('running')
    const disconnected: LanRoomParticipantView = {
      ...base,
      room: {
        ...base.room,
        members: base.room.members.map(member => member.seat === 1 ? { ...member, connected: false } : member),
      },
    }
    renderTable({ status: 'room', participant: disconnected, pending: false, error: undefined })
    const offline = screen.getByText('离线')
    expect(offline.parentElement?.dataset.connected).toBe('false')
    expect(offline.parentElement?.textContent).not.toContain('行动中')
  })

  it('renders a persistent authoritative final settlement when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    const base = participant('finished')
    const result = { winner: 'landlord', spring: 'none', baseScore: 1, multiplier: 2, scores: [4, -2, -2] } as const
    const finished: LanRoomParticipantView = {
      ...base,
      game: {
        game: 'doudizhu',
        status: 'finished',
        round: 3,
        totalRounds: 3,
        deal: 1,
        totalScores: [7, -3, -4],
        roundResults: [result],
        decisionOutcomes: [],
        state: {
          version: 20,
          phase: 'finished',
          cardCounts: [0, 8, 4],
          bottom: ['C2', 'joker-small', 'joker-big'],
          landlord: 0,
          highestBid: 3,
          bids: [],
          consecutivePasses: 0,
          multiplier: 2,
          history: [],
          result,
        },
      } as unknown as LanRoomParticipantView['game'],
    }
    renderTable({ status: 'room', participant: finished, pending: false, error: undefined })
    expect(screen.getByRole('status').textContent).toContain('三局结算')
    expect(screen.getByRole('status').textContent).toContain('+4 / -2 / -2')
  })

  it('shows only the local Agent hand with public round, role, counts, bottom cards, and last play', () => {
    const base = participant('running')
    const withGame: LanRoomParticipantView = {
      ...base,
      game: {
        game: 'doudizhu',
        status: 'running',
        round: 2,
        totalRounds: 3,
        deal: 1,
        totalScores: [3, -1, -2],
        roundResults: [],
        decisionSeat: 1,
        decisionOutcomes: [
          { historyIndex: 1, afterStateVersion: 7, seat: 0, source: 'fallback', fallbackReason: 'timeout' },
        ],
        state: {
          version: 9,
          phase: 'playing',
          cardCounts: [12, 15, 14],
          bottom: ['C2', 'joker-small', 'joker-big'],
          currentSeat: 0,
          landlord: 0,
          highestBid: 3,
          bids: [],
          lastPlay: {
            seat: 2,
            combination: { kind: 'single', cards: ['C9'], primaryRank: '9', chainLength: 1 },
          },
          consecutivePasses: 0,
          multiplier: 2,
          history: [
            { seat: 2, combination: { kind: 'pair', cards: ['C8', 'D8'], primaryRank: '8', chainLength: 1 } },
            { seat: 0, pass: true },
            { seat: 1, pass: true },
            { seat: 2, combination: { kind: 'single', cards: ['C9'], primaryRank: '9', chainLength: 1 } },
          ],
        },
      },
      privateGame: {
        version: 9,
        phase: 'playing',
        yourSeat: 0,
        yourRole: 'landlord',
        yourCards: ['H3', 'S4', 'joker-big'],
        cardCounts: [12, 15, 14],
        bottom: ['C2', 'joker-small', 'joker-big'],
        currentSeat: 0,
        landlord: 0,
        highestBid: 3,
        bids: [],
        multiplier: 2,
        history: [],
        legalActions: [],
      },
    }
    renderTable({ status: 'room', participant: withGame, pending: false, error: undefined })

    expect(screen.getByText('第 2/3 局')).toBeTruthy()
    expect(screen.getByText('总分 3 / -1 / -2')).toBeTruthy()
    expect(screen.getByText('地主')).toBeTruthy()
    expect(screen.getByText('行动中')).toBeTruthy()
    expect(screen.getByText('剩余 15 张').parentElement?.textContent).toContain('行动中')
    expect(screen.getByText('托管')).toBeTruthy()
    expect(screen.getByAltText('♥3')).toBeTruthy()
    expect(screen.getByAltText('♠4')).toBeTruthy()
    expect(screen.getAllByAltText('大王').length).toBeGreaterThan(0)
    expect(screen.getByText('3 号 · ♣8 ♦8')).toBeTruthy()
    expect(screen.getByText('新一轮')).toBeTruthy()
    expect(screen.getByText('3 号 · ♣9')).toBeTruthy()
    expect(screen.getByText('赛前策略（已锁定）')).toBeTruthy()
    expect(document.querySelector('[data-lan-game-play-rail]')).toBeTruthy()
  })
})
