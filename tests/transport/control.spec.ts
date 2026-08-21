import { afterEach, describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import AgentRegistry, { Inbox, type Agent } from '@deepseek-ai/dsh-agent'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import type {} from '../../src/agent/index.ts'
import LanRooms, { LanMemberId, LanRoomId } from '../../src/room/index.ts'
import LanRoomTransport from '../../src/transport/index.ts'

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

class FakeLanGameAgents extends Service {
  readonly created: Array<{ parent: Agent; strategyPrompt: string }> = []
  readonly removed: string[] = []

  constructor(ctx: Context) {
    super(ctx, 'lanGameAgents')
  }

  async create(request: { parent: Agent; strategyPrompt: string }): Promise<{ childId: SessionId }> {
    this.created.push(request)
    return { childId: SessionId(`game-${request.parent.id}`) }
  }

  restore(request: { parent: Agent; childId: SessionId; strategyPrompt: string; promptHash: string }): { childId: SessionId } {
    this.created.push({ parent: request.parent, strategyPrompt: request.strategyPrompt })
    return { childId: request.childId }
  }

  remove(_parent: Agent, childId: SessionId): void {
    this.removed.push(childId)
  }

  async decide(request: { requestId: string; stateVersion: number; state: unknown }): Promise<{
    requestId: string
    stateVersion: number
    action: { type: string; echoed: unknown }
  }> {
    return {
      requestId: request.requestId,
      stateVersion: request.stateVersion,
      action: { type: 'pass', echoed: request.state },
    }
  }
}

interface PersistenceStore {
  readonly bindings: Map<string, Record<string, unknown>>
  readonly matches: Map<string, Record<string, unknown>>
}

class FakeLanGamePersistence extends Service {
  constructor(ctx: Context, private readonly config: { store: PersistenceStore }) {
    super(ctx, 'lanGamePersistence')
  }

  get(roomId: string): Record<string, unknown> | undefined {
    return this.config.store.matches.get(roomId)
  }

  listBindings(): Record<string, unknown>[] {
    return [...this.config.store.bindings.values()]
  }

  async putBinding(binding: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.config.store.bindings.set(String(binding['roomId']), structuredClone(binding))
    return binding
  }
}

function agent(rawId: string): Agent {
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

async function harness(rawId: string, store?: PersistenceStore): Promise<{ ctx: Context; participant: Agent; games: FakeLanGameAgents }> {
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(AgentRegistry)
  await ctx.plugin(LanRooms)
  await ctx.plugin(FakeLanGameAgents)
  if (store !== undefined) await ctx.plugin(FakeLanGamePersistence, { store })
  const games = ctx.lanGameAgents as unknown as FakeLanGameAgents
  await ctx.plugin(LanRoomTransport)
  const participant = agent(rawId)
  ctx.agents.register(participant)
  return { ctx, participant, games }
}

describe('LAN room Host controller', () => {
  it('hosts, joins from two DSH processes, locks prompts, and starts one hidden Game Session per player', async () => {
    const host = await harness('host-session')
    const second = await harness('second-session')
    const third = await harness('third-session')
    const hosted = await host.ctx.lanRoomTransport.host(host.participant, { strategyPrompt: 'Conserve bombs.' })
    const url = hosted.joinUrls[0]
    if (url === undefined) throw new Error('host did not advertise a join URL')

    await second.ctx.lanRoomTransport.join(second.participant, {
      url,
      code: hosted.room.code,
      strategyPrompt: 'Bid aggressively.',
    })
    await third.ctx.lanRoomTransport.join(third.participant, {
      url,
      code: hosted.room.code,
      strategyPrompt: 'Preserve pairs.',
    })
    await expect.poll(() => host.ctx.lanRoomTransport.status(host.participant)?.room.members.length).toBe(3)

    await host.ctx.lanRoomTransport.setReady(host.participant, true)
    await second.ctx.lanRoomTransport.setReady(second.participant, true)
    await expect.poll(() => third.ctx.lanRoomTransport.status(third.participant)?.room.revision).toBe(7)
    await third.ctx.lanRoomTransport.setReady(third.participant, true)

    await expect.poll(() => host.ctx.lanRoomTransport.status(host.participant)?.room.phase).toBe('running')
    await expect.poll(() => second.ctx.lanRoomTransport.status(second.participant)?.gameSessionState).toBe('ready')
    await expect.poll(() => third.ctx.lanRoomTransport.status(third.participant)?.gameSessionState).toBe('ready')
    expect(host.games.created[0]?.strategyPrompt).toBe('Conserve bombs.')
    expect(second.games.created[0]?.strategyPrompt).toBe('Bid aggressively.')
    expect(third.games.created[0]?.strategyPrompt).toBe('Preserve pairs.')
    await expect(host.ctx.lanRoomTransport.updatePrompt(host.participant, 'Change after start.')).rejects.toThrow(/locked/u)
  })

  it('leaves an open lobby and closes its Host-owned socket', async () => {
    const host = await harness('host-leave')
    const peer = await harness('peer-leave')
    const hosted = await host.ctx.lanRoomTransport.host(host.participant, { strategyPrompt: 'Host plan.' })
    const url = hosted.joinUrls[0]
    if (url === undefined) throw new Error('host did not advertise a join URL')
    await peer.ctx.lanRoomTransport.join(peer.participant, {
      url,
      code: hosted.room.code,
      strategyPrompt: 'Peer plan.',
    })

    await peer.ctx.lanRoomTransport.leave(peer.participant)
    expect(peer.ctx.lanRoomTransport.status(peer.participant)).toBeUndefined()
    await expect.poll(() => host.ctx.lanRoomTransport.status(host.participant)?.room.members.length).toBe(1)
  })

  it('routes private decisions to a remote hidden Game Session and public state to its browser projection', async () => {
    const host = await harness('host-decision')
    const peer = await harness('peer-decision')
    const third = await harness('third-decision')
    const hosted = await host.ctx.lanRoomTransport.host(host.participant, { strategyPrompt: 'Host.' })
    const url = hosted.joinUrls[0]!
    await peer.ctx.lanRoomTransport.join(peer.participant, { url, code: hosted.room.code, strategyPrompt: 'Peer.' })
    await third.ctx.lanRoomTransport.join(third.participant, { url, code: hosted.room.code, strategyPrompt: 'Third.' })
    await host.ctx.lanRoomTransport.setReady(host.participant, true)
    await peer.ctx.lanRoomTransport.setReady(peer.participant, true)
    await third.ctx.lanRoomTransport.setReady(third.participant, true)
    await expect.poll(() => host.ctx.lanRoomTransport.status(host.participant)?.room.phase).toBe('running')

    const action = await host.ctx.lanRoomTransport.requestDecision({
      roomId: LanRoomId(hosted.room.id),
      memberId: LanMemberId(peer.participant.id),
      requestId: 'remote-turn',
      stateVersion: 4,
      state: { cards: ['C3'] },
      signal: new AbortController().signal,
    })
    expect(action).toEqual({ type: 'pass', echoed: { cards: ['C3'] } })

    host.ctx.lanRoomTransport.publishGameSnapshot(LanRoomId(hosted.room.id), { game: 'doudizhu', version: 5 })
    await expect.poll(() => peer.ctx.lanRoomTransport.status(peer.participant)?.game).toEqual({ game: 'doudizhu', version: 5 })
  })

  it('resumes a participant from its local binding on the first post-restart handshake', async () => {
    const host = await harness('host-binding')
    const store: PersistenceStore = { bindings: new Map(), matches: new Map() }
    const first = await harness('peer-binding', store)
    const hosted = await host.ctx.lanRoomTransport.host(host.participant, { strategyPrompt: 'Host plan.' })
    const url = hosted.joinUrls[0]!
    await first.ctx.lanRoomTransport.join(first.participant, { url, code: hosted.room.code, strategyPrompt: 'Locked peer plan.' })
    const roomId = host.ctx.lanRoomTransport.status(host.participant)?.room.id
    const binding = store.bindings.get(String(roomId))
    expect(binding).toMatchObject({
      role: 'participant',
      parentSessionId: 'peer-binding',
      strategyPrompt: 'Locked peer plan.',
    })
    expect(binding?.['resumeToken']).toMatch(/^[0-9a-f]{64}$/u)
    await first.ctx.fiber.dispose()
    await expect.poll(() => host.ctx.lanRoomTransport.status(host.participant)?.room.members[1]?.connected).toBe(false)

    const restarted = await harness('peer-binding', store)
    const resumed = await restarted.ctx.lanRoomTransport.join(restarted.participant, {
      url,
      code: hosted.room.code,
      strategyPrompt: 'Attempted changed plan.',
    })
    expect(resumed.strategyPrompt).toBe('Locked peer plan.')
    expect(resumed.room.members).toHaveLength(2)
    expect(resumed.room.members[1]).toMatchObject({ id: 'peer-binding', connected: true })
  })

  it('restores a coordinator on the persisted port and keeps its locked strategy Prompt', async () => {
    const store: PersistenceStore = { bindings: new Map(), matches: new Map() }
    const first = await harness('host-restart', store)
    const hosted = await first.ctx.lanRoomTransport.host(first.participant, { strategyPrompt: 'Locked host plan.' })
    const oldUrl = hosted.joinUrls[0]!
    store.matches.set(hosted.room.id, { room: structuredClone(hosted.room) })
    await first.ctx.fiber.dispose()

    const restarted = await harness('host-restart', store)
    const recovered = await restarted.ctx.lanRoomTransport.host(restarted.participant, {
      strategyPrompt: 'Attempted changed host plan.',
    })

    expect(recovered.room).toEqual(hosted.room)
    expect(recovered.strategyPrompt).toBe('Locked host plan.')
    expect(recovered.joinUrls[0]).toBe(oldUrl)
  })
})
