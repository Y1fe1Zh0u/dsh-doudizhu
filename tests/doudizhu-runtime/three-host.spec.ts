import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import AgentRegistry, { Inbox, type Agent } from '@deepseek-ai/dsh-agent'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import LanRooms, { LanRoomId } from '../../src/room/index.ts'
import type {} from '../../src/agent/index.ts'
import LanGamePersistence from '../../src/persistence/index.ts'
import LanRoomTransport from '../../src/transport/index.ts'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryMediaPool, MemoryStorageBackend } from '../helpers/memory-backend.ts'
import DoudizhuGames from '../../src/doudizhu-runtime/index.ts'

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

class ScriptedGameAgents extends Service {
  decisions = 0
  block = false
  private childId: SessionId | undefined
  private readonly blockedResolvers = new Set<() => void>()

  constructor(ctx: Context) {
    super(ctx, 'lanGameAgents')
  }

  async create(request: { parent: Agent }): Promise<{ childId: SessionId }> {
    this.childId = SessionId(`game-${request.parent.id}`)
    return { childId: this.childId }
  }

  restore(request: { childId: SessionId }): { childId: SessionId } {
    this.childId = request.childId
    return { childId: request.childId }
  }

  async decide(request: { requestId: string; stateVersion: number; state: unknown; signal?: AbortSignal }): Promise<{
    requestId: string
    stateVersion: number
    action: unknown
  }> {
    this.decisions += 1
    if (this.block) {
      await new Promise<void>((resolve, reject) => {
        this.blockedResolvers.add(resolve)
        const abort = () => {
          this.blockedResolvers.delete(resolve)
          reject(request.signal?.reason instanceof Error ? request.signal.reason : new Error('aborted'))
        }
        request.signal?.addEventListener('abort', abort, { once: true })
        if (request.signal?.aborted) abort()
      })
    }
    const state = request.state as { phase?: string; legalActions?: unknown[] }
    const actions = state.legalActions ?? []
    const action = state.phase === 'bidding'
      ? actions.find(candidate => record(candidate)?.['type'] === 'bid' && record(candidate)?.['score'] === 3)
      : actions.find(candidate => record(candidate)?.['type'] === 'play') ?? actions[0]
    if (action === undefined) throw new Error('scripted Game Session received no legal action')
    return { requestId: request.requestId, stateVersion: request.stateVersion, action }
  }

  remove(): void {
    this.childId = undefined
  }

  unblock(): void {
    this.block = false
    for (const resolve of this.blockedResolvers) resolve()
    this.blockedResolvers.clear()
  }
}

function foreground(rawId: string): Agent {
  const session = Session.create(SessionId(rawId))
  const inbox = new Inbox(session, { inserted: () => {}, discarded: () => {}, claimed: () => {} })
  return {
    id: session.id,
    options: {},
    session,
    inbox,
    ctx: new Context(),
    status: 'idle',
    send: () => {},
    followup: () => {},
    steer: () => {},
    inject: (input) => { inbox.append('next-step', input) },
    cancel: () => {},
    runMaintenance: task => task(new AbortController().signal),
    whenIdle: () => Promise.resolve(),
  }
}

async function host(rawId: string, runtime = false, pool = new MemoryMediaPool(), roundsPerMatch = 3) {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const domains = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', domains)
  ctx.provide('storageDomain', domains)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(LanRooms)
  await ctx.plugin(LanGamePersistence)
  await ctx.plugin(ScriptedGameAgents)
  await ctx.plugin(LanRoomTransport)
  if (runtime) await ctx.plugin(DoudizhuGames, { roundsPerMatch, roundPauseMs: 0, decisionTimeoutMs: 5_000 })
  const agent = foreground(rawId)
  ctx.agents.register(agent)
  return { ctx, agent, games: ctx.lanGameAgents as unknown as ScriptedGameAgents, pool }
}

describe('three independent DSH Host match', () => {
  it('plays three full rounds over real WebSockets and keeps each private hand local', { timeout: 15_000 }, async () => {
    const a = await host('player-a', true)
    const b = await host('player-b')
    const c = await host('player-c')
    const room = await a.ctx.lanRoomTransport.host(a.agent, { strategyPrompt: 'A strategy.' })
    const url = room.joinUrls[0]!
    await b.ctx.lanRoomTransport.join(b.agent, { url, code: room.room.code, strategyPrompt: 'B strategy.' })
    await c.ctx.lanRoomTransport.join(c.agent, { url, code: room.room.code, strategyPrompt: 'C strategy.' })
    await a.ctx.lanRoomTransport.setReady(a.agent, true)
    await b.ctx.lanRoomTransport.setReady(b.agent, true)
    await c.ctx.lanRoomTransport.setReady(c.agent, true)

    await expect.poll(() => a.ctx.lanRooms.get(LanRoomId(room.room.id))?.phase, { timeout: 10_000 }).toBe('finished')
    await expect.poll(() => [a, b, c].every((participant) => {
      const game = record(participant.ctx.lanRoomTransport.status(participant.agent)?.game)
      return game?.['status'] === 'finished'
    }), { timeout: 10_000 }).toBe(true)
    for (const participant of [a, b, c]) {
      expect(participant.games.decisions).toBeGreaterThan(0)
      const status = participant.ctx.lanRoomTransport.status(participant.agent)
      expect(status?.game).toMatchObject({ game: 'doudizhu', status: 'finished', round: 3, totalRounds: 3 })
      expect(record(status?.privateGame)?.['yourCards']).toBeDefined()
    }
    const privateA = JSON.stringify(a.ctx.lanRoomTransport.status(a.agent)?.privateGame)
    const privateB = JSON.stringify(b.ctx.lanRoomTransport.status(b.agent)?.privateGame)
    expect(privateA).not.toBe(privateB)
    expect(a.ctx.lanRooms.get(LanRoomId(room.room.id))?.result).toContain('"rounds":3')
  })

  it('recovers all three Hosts mid-decision on the same port, bindings, and Game Session ids', { timeout: 20_000 }, async () => {
    const pools = [new MemoryMediaPool(), new MemoryMediaPool(), new MemoryMediaPool()] as const
    const firstA = await host('recover-a', true, pools[0], 1)
    const firstB = await host('recover-b', false, pools[1])
    const firstC = await host('recover-c', false, pools[2])
    firstA.games.block = true
    firstB.games.block = true
    firstC.games.block = true
    const hosted = await firstA.ctx.lanRoomTransport.host(firstA.agent, { strategyPrompt: 'Locked A.' })
    const url = hosted.joinUrls[0]!
    await firstB.ctx.lanRoomTransport.join(firstB.agent, { url, code: hosted.room.code, strategyPrompt: 'Locked B.' })
    await firstC.ctx.lanRoomTransport.join(firstC.agent, { url, code: hosted.room.code, strategyPrompt: 'Locked C.' })
    await firstA.ctx.lanRoomTransport.setReady(firstA.agent, true)
    await firstB.ctx.lanRoomTransport.setReady(firstB.agent, true)
    await firstC.ctx.lanRoomTransport.setReady(firstC.agent, true)
    await expect.poll(() => firstA.ctx.lanGamePersistence.get(LanRoomId(hosted.room.id))?.pendingDecision).toBeDefined()
    await expect.poll(() => [firstA, firstB, firstC].every(participant =>
      participant.ctx.lanGamePersistence.getBinding(hosted.room.id)?.gameSessionId !== undefined)).toBe(true)
    const originalIds = [firstA, firstB, firstC]
      .map(participant => participant.ctx.lanRoomTransport.status(participant.agent)?.gameSessionId)
    expect(originalIds.every(Boolean)).toBe(true)
    await Promise.all([firstA, firstB, firstC].map(participant => participant.ctx.fiber.dispose()))
    await new Promise(resolve => setTimeout(resolve, 50))

    const secondA = await host('recover-a', true, pools[0], 1)
    const secondB = await host('recover-b', false, pools[1])
    const secondC = await host('recover-c', false, pools[2])
    secondA.games.block = true
    secondB.games.block = true
    secondC.games.block = true
    const recoveredHost = await secondA.ctx.lanRoomTransport.host(secondA.agent, { strategyPrompt: 'Changed A.' })
    expect(recoveredHost.joinUrls[0]).toBe(url)
    expect(recoveredHost.strategyPrompt).toBe('Locked A.')
    const recoveredB = await secondB.ctx.lanRoomTransport.join(secondB.agent, {
      url,
      code: hosted.room.code,
      strategyPrompt: 'Changed B.',
    })
    const recoveredC = await secondC.ctx.lanRoomTransport.join(secondC.agent, {
      url,
      code: hosted.room.code,
      strategyPrompt: 'Changed C.',
    })
    expect([recoveredHost.gameSessionId, recoveredB.gameSessionId, recoveredC.gameSessionId]).toEqual(originalIds)
    expect([recoveredHost.strategyPrompt, recoveredB.strategyPrompt, recoveredC.strategyPrompt]).toEqual(['Locked A.', 'Locked B.', 'Locked C.'])
    secondA.games.unblock()
    secondB.games.unblock()
    secondC.games.unblock()

    await expect.poll(() => secondA.ctx.lanRooms.get(LanRoomId(hosted.room.id))?.phase, { timeout: 12_000 }).toBe('finished')
    const durable = secondA.ctx.lanGamePersistence.get(LanRoomId(hosted.room.id))
    expect(durable?.events.some(event => event.type === 'decision-abandoned' && event.reason === 'superseded')).toBe(true)
    expect(durable?.events.some(event => event.type === 'decision-requested' && event.attempt === 2)).toBe(true)
  })
})

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}
