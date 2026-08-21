import {
  DOUDIZHU_DECK,
  applyDoudizhuAction,
  createDoudizhuGame,
} from '../../src/doudizhu/index.ts'
import type { LocalBinding, MatchEvent, MatchRecord } from '../../src/persistence/index.ts'

export const NOW = '2026-08-21T10:00:00.000Z'
export const LATER = '2026-08-21T10:01:00.000Z'

export function fixtureRecord(): MatchRecord {
  const deck = DOUDIZHU_DECK.map(card => card.id)
  const initial = createDoudizhuGame({ deck, biddingStarter: 0 })
  const state = applyDoudizhuAction({ state: initial, seat: 0, action: { type: 'bid', score: 3 } })
  const events: MatchEvent[] = [
    { type: 'deal-started', seq: 0, at: NOW, round: 1, deal: 1, deck, biddingStarter: 0 },
    {
      type: 'decision-requested', seq: 1, at: NOW, requestId: 'request-1', attempt: 1,
      seat: 0, stateVersion: 0, requestedAt: NOW, deadlineAt: LATER,
    },
    {
      type: 'action-committed', seq: 2, at: NOW, requestId: 'request-1', seat: 0,
      beforeStateVersion: 0, action: { type: 'bid', score: 3 }, source: 'agent', afterStateVersion: 1,
    },
  ]
  return {
    schemaVersion: 1,
    game: 'doudizhu',
    rulesetVersion: 1,
    recordRevision: 0,
    authorityEpoch: 0,
    createdAt: NOW,
    updatedAt: NOW,
    expiresAt: '2026-08-22T10:00:00.000Z',
    room: {
      id: 'room-1',
      code: '123456',
      revision: 3,
      phase: 'running',
      coordinatorId: 'member-0',
      maxMembers: 3,
      members: [
        { id: 'member-0', seat: 0, ready: true, connected: true, promptHash: 'hash-0', resumeToken: 'secret-0' },
        { id: 'member-1', seat: 1, ready: true, connected: true, promptHash: 'hash-1', resumeToken: 'secret-1' },
        { id: 'member-2', seat: 2, ready: true, connected: true, promptHash: 'hash-2', resumeToken: 'secret-2' },
      ],
    },
    config: { roundsPerMatch: 3, roundPauseMs: 2_000, decisionTimeoutMs: 50_000 },
    events,
    checkpoint: {
      asOfSeq: 2,
      round: 1,
      deal: 1,
      state: JSON.parse(JSON.stringify(state)) as MatchRecord['checkpoint']['state'],
      totalScores: [0, 0, 0],
      roundResults: [],
      decisionOutcomes: [{ historyIndex: 0, afterStateVersion: 1, seat: 0, source: 'agent' }],
    },
  }
}

export function fixtureBinding(): LocalBinding {
  return {
    schemaVersion: 1,
    roomId: 'room-1',
    role: 'coordinator',
    memberId: 'member-0',
    parentSessionId: 'parent-session',
    gameSessionId: 'game-session',
    strategyPrompt: 'Play conservatively.',
    promptHash: 'hash-0',
    coordinatorUrl: 'ws://192.168.1.2:3080',
    resumeToken: 'binding-secret',
    state: 'active',
    updatedAt: NOW,
  }
}
