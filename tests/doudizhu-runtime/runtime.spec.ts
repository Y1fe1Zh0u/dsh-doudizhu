import { describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import { DoudizhuCardId, type DoudizhuPrivateView } from '../../src/doudizhu/index.ts'
import LanGamePersistence, { type MatchRecord } from '../../src/persistence/index.ts'
import LanRooms, { LanMemberId, LanRoomCode, LanRoomId, type LanRoomSnapshot } from '../../src/room/index.ts'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import type {} from '../../src/transport/index.ts'
import { MemoryMediaPool, MemoryStorageBackend } from '../helpers/memory-backend.ts'
import DoudizhuGames, { doudizhuFallbackAction } from '../../src/doudizhu-runtime/index.ts'

class FakeLanRoomTransport extends Service {
  readonly snapshots: JsonValue[] = []
  readonly privateSnapshots: JsonValue[] = []
  invalid = false
  block = false
  requests = 0

  constructor(ctx: Context) {
    super(ctx, 'lanRoomTransport')
  }

  async requestDecision(request: { state: JsonValue; signal?: AbortSignal }): Promise<JsonValue> {
    this.requests += 1
    if (this.block) {
      return await new Promise<JsonValue>((_resolve, reject) => {
        const signal = request.signal
        const abort = () => { reject(signal?.reason instanceof Error ? signal.reason : new Error('aborted')) }
        signal?.addEventListener('abort', abort, { once: true })
        if (signal?.aborted) abort()
      })
    }
    if (this.invalid) return { type: 'invalid' }
    const state = request.state as { phase?: unknown; legalActions?: unknown }
    if (state.phase === 'bidding') return { type: 'bid', score: 3 }
    if (!Array.isArray(state.legalActions)) throw new Error('private state has no legal actions')
    const actions = state.legalActions as JsonValue[]
    const play = actions.find(action => record(action)?.['type'] === 'play')
    return play ?? actions[0] ?? { type: 'pass' }
  }

  publishGameSnapshot(_roomId: string, game: JsonValue): void {
    this.snapshots.push(structuredClone(game))
  }

  publishPrivateGameSnapshot(_roomId: string, _memberId: string, game: JsonValue): void {
    this.privateSnapshots.push(structuredClone(game))
  }

  resumeTokens(): Readonly<Record<string, string>> {
    return {}
  }
}

async function setup(invalid = false) {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend())
  const domains = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', domains)
  ctx.provide('storageDomain', domains)
  await ctx.plugin(LanRooms)
  await ctx.plugin(LanGamePersistence)
  await ctx.plugin(FakeLanRoomTransport)
  const transport = ctx.lanRoomTransport as unknown as FakeLanRoomTransport
  transport.invalid = invalid
  await ctx.plugin(DoudizhuGames, { roundsPerMatch: 3, roundPauseMs: 0, decisionTimeoutMs: 500 })
  let room = ctx.lanRooms.create({ coordinatorId: LanMemberId('host') })
  room = ctx.lanRooms.join({ code: room.code, memberId: LanMemberId('peer-b') })
  room = ctx.lanRooms.join({ code: room.code, memberId: LanMemberId('peer-c') })
  for (const member of room.members) {
    room = ctx.lanRooms.updatePrompt({
      roomId: room.id,
      memberId: member.id,
      expectedRevision: room.revision,
      promptHash: member.id.charCodeAt(0).toString(16).padStart(64, '0').slice(-64),
    })
  }
  for (const member of room.members) {
    room = ctx.lanRooms.setReady({ roomId: room.id, memberId: member.id, expectedRevision: room.revision, ready: true })
  }
  room = ctx.lanRooms.start({ roomId: room.id, coordinatorId: room.coordinatorId, expectedRevision: room.revision })
  return { ctx, room, transport }
}

describe('DouDizhu coordinator runtime', () => {
  it('passes by default but blocks an opponent who is within two cards of winning', () => {
    const pairSeven = { type: 'play' as const, cards: [DoudizhuCardId('D7'), DoudizhuCardId('S7')] }
    const pass = { type: 'pass' as const }
    const base: DoudizhuPrivateView = {
      version: 10,
      phase: 'playing',
      yourSeat: 2,
      yourRole: 'farmer',
      yourCards: pairSeven.cards,
      cardCounts: [10, 1, 2],
      bottom: [],
      currentSeat: 2,
      landlord: 1,
      highestBid: 3,
      bids: [{ seat: 1, score: 3 }],
      lastPlay: {
        seat: 1,
        combination: { kind: 'pair', cards: [DoudizhuCardId('H3'), DoudizhuCardId('S3')], primaryRank: '3', chainLength: 1 },
      },
      multiplier: 1,
      history: [],
      legalActions: [pairSeven, pass],
    }

    expect(doudizhuFallbackAction(base)).toEqual(pairSeven)
    expect(doudizhuFallbackAction({ ...base, cardCounts: [10, 3, 2] })).toEqual(pass)
    expect(doudizhuFallbackAction({ ...base, lastPlay: { ...base.lastPlay!, seat: 0 } })).toEqual(pass)
  })

  it('drives a complete match through private decisions and publishes only public state', async () => {
    const { ctx, room, transport } = await setup()
    await expect.poll(() => ctx.lanRooms.get(room.id)?.phase, { timeout: 10_000 }).toBe('finished')
    const snapshots = transport.snapshots as Array<{
      deal?: number
      decisionSeat?: number
      decisionOutcomes?: Array<{ source?: string; fallbackReason?: string }>
      state?: { yourCards?: unknown; cardCounts?: unknown }
      status?: string
    }>
    expect(snapshots.length).toBeGreaterThan(2)
    expect(JSON.stringify(snapshots)).not.toContain('yourCards')
    expect(snapshots.some(snapshot => Array.isArray(snapshot.state?.cardCounts))).toBe(true)
    expect(snapshots.some(snapshot => Number.isSafeInteger(snapshot.deal))).toBe(true)
    expect(snapshots.some(snapshot => Number.isSafeInteger(snapshot.decisionSeat))).toBe(true)
    expect(snapshots.some(snapshot => snapshot.decisionOutcomes?.some(outcome => outcome.source === 'agent'))).toBe(true)
    expect(snapshots.at(-1)?.status).toBe('finished')
    expect(transport.privateSnapshots.length).toBeGreaterThan(transport.snapshots.length)
    expect(ctx.lanRooms.get(room.id)?.result).toContain('"rounds":3')
    const durable = ctx.lanGamePersistence.get(room.id)
    expect(durable?.finishedAt).toBeDefined()
    expect(durable?.room).toMatchObject({ phase: 'finished', result: ctx.lanRooms.get(room.id)?.result })
    const finalEvent = durable?.events.at(-1)
    expect(finalEvent?.type).toBe('match-finished')
    expect(durable?.checkpoint.totalScores).toEqual(finalEvent?.type === 'match-finished'
      ? finalEvent.totalScores
      : undefined)
    await ctx.fiber.dispose()
  })

  it('bounds repeated invalid decisions and settles the room as failed', async () => {
    const { ctx, room, transport } = await setup(true)
    await expect.poll(() => ctx.lanRooms.get(room.id)?.phase, { timeout: 10_000 }).toBe('finished')
    expect(ctx.lanRooms.get(room.id)?.result).toContain('doudizhu failed')
    expect(transport.snapshots.at(-1)).toMatchObject({ game: 'doudizhu', status: 'failed' })
    expect(transport.snapshots.some(snapshot => JSON.stringify(snapshot).includes('invalid-response'))).toBe(true)
    await ctx.fiber.dispose()
  })

  it('supersedes a crashed pending decision and commits exactly one action from the recovered state', async () => {
    const pool = new MemoryMediaPool()
    const first = await recoveryContext(pool, true)
    const room = startRunningRoom(first.ctx)
    await expect.poll(() => first.ctx.lanGamePersistence.get(room.id)?.pendingDecision).toBeDefined()
    const before = first.ctx.lanGamePersistence.get(room.id)
    if (before?.pendingDecision === undefined) throw new Error('first runtime did not persist its pending decision')
    await first.ctx.fiber.dispose()

    const second = await recoveryContext(pool, false)
    const restored = second.ctx.lanRooms.restore(restoredRoom(before))
    expect(second.ctx.doudizhuGames.resume(restored)).toBe(true)
    await expect.poll(() => second.ctx.lanRooms.get(restored.id)?.phase, { timeout: 10_000 }).toBe('finished')

    const after = second.ctx.lanGamePersistence.get(restored.id)
    const abandoned = after?.events.find(event => event.type === 'decision-abandoned'
      && event.requestId === before.pendingDecision?.requestId)
    const retried = after?.events.find(event => event.type === 'decision-requested'
      && event.requestId !== before.pendingDecision?.requestId
      && event.stateVersion === before.pendingDecision?.stateVersion)
    expect(abandoned).toMatchObject({ type: 'decision-abandoned', reason: 'superseded' })
    expect(retried).toMatchObject({ type: 'decision-requested', attempt: before.pendingDecision.attempt + 1 })
    expect(after?.events.filter(event => event.type === 'action-committed'
      && event.beforeStateVersion === before.pendingDecision?.stateVersion)).toHaveLength(1)
    await second.ctx.fiber.dispose()
  })

  it('projects a durable match settlement after a crash before room.finish without requesting another action', async () => {
    const pool = new MemoryMediaPool()
    const first = await recoveryContext(pool, false)
    const room = startRunningRoom(first.ctx)
    await expect.poll(() => first.ctx.lanRooms.get(room.id)?.phase, { timeout: 10_000 }).toBe('finished')
    const durable = first.ctx.lanGamePersistence.get(room.id)
    if (durable?.finishedAt === undefined) throw new Error('first runtime did not durably settle the match')
    await first.ctx.fiber.dispose()

    const second = await recoveryContext(pool, false)
    const staleRunning = restoredRoom({
      ...durable,
      room: { ...durable.room, revision: durable.room.revision - 1, phase: 'running', result: undefined },
    })
    const restored = second.ctx.lanRooms.restore(staleRunning)
    expect(second.ctx.doudizhuGames.resume(restored)).toBe(true)

    expect(second.ctx.lanRooms.get(restored.id)).toMatchObject({
      phase: 'finished',
      revision: durable.room.revision,
      result: durable.room.result,
    })
    expect(second.transport.requests).toBe(0)
    expect(second.transport.snapshots.at(-1)).toMatchObject({ game: 'doudizhu', status: 'finished' })
    await second.ctx.fiber.dispose()
  })
})

async function recoveryContext(pool: MemoryMediaPool, block: boolean): Promise<{ ctx: Context; transport: FakeLanRoomTransport }> {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const domains = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', domains)
  ctx.provide('storageDomain', domains)
  await ctx.plugin(LanRooms)
  await ctx.plugin(LanGamePersistence)
  await ctx.plugin(FakeLanRoomTransport)
  const transport = ctx.lanRoomTransport as unknown as FakeLanRoomTransport
  transport.block = block
  await ctx.plugin(DoudizhuGames, { roundsPerMatch: 1, roundPauseMs: 0, decisionTimeoutMs: 5_000 })
  return { ctx, transport }
}

function startRunningRoom(ctx: Context): LanRoomSnapshot {
  let room = ctx.lanRooms.create({ coordinatorId: LanMemberId('host') })
  room = ctx.lanRooms.join({ code: room.code, memberId: LanMemberId('peer-b') })
  room = ctx.lanRooms.join({ code: room.code, memberId: LanMemberId('peer-c') })
  for (const member of room.members) {
    room = ctx.lanRooms.updatePrompt({
      roomId: room.id,
      memberId: member.id,
      expectedRevision: room.revision,
      promptHash: member.id.charCodeAt(0).toString(16).padStart(64, '0').slice(-64),
    })
  }
  for (const member of room.members) {
    room = ctx.lanRooms.setReady({ roomId: room.id, memberId: member.id, expectedRevision: room.revision, ready: true })
  }
  return ctx.lanRooms.start({ roomId: room.id, coordinatorId: room.coordinatorId, expectedRevision: room.revision })
}

function restoredRoom(record: MatchRecord): LanRoomSnapshot {
  return {
    id: LanRoomId(record.room.id),
    code: LanRoomCode(record.room.code),
    revision: record.room.revision,
    phase: record.room.phase,
    coordinatorId: LanMemberId(record.room.coordinatorId),
    maxMembers: record.room.maxMembers,
    members: record.room.members.map(({ resumeToken: _resumeToken, ...member }) => ({ ...member, id: LanMemberId(member.id) })),
    ...(record.room.result === undefined ? {} : { result: record.room.result }),
  }
}

function record(value: JsonValue): Record<string, JsonValue> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : undefined
}
