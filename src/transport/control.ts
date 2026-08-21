/** Local DSH Host controller joining room transport to hidden Game Sessions. */

import { createHash } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { SessionId } from '@deepseek-ai/dsh-session'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import {
  LanMemberId,
  LanRoomCode,
  LanRoomId,
  type LanRoomSnapshot,
} from '../room/index.ts'
import type {} from '../agent/index.ts'
import {
  connectLanRoom,
  type LanRoomConnection,
} from './connection.ts'
import { listenLanRoom, type LanRoomListener } from './gateway.ts'
import type {
  HostLanRoomRequest,
  JoinLanRoomControlRequest,
  LanRoomParticipantView,
} from './control-types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    lanRoomTransport: LanRoomTransport
  }
}

interface ActiveParticipant {
  readonly parent: Agent
  readonly role: LanRoomParticipantView['role']
  readonly abort: AbortController
  strategyPrompt: string
  room: LanRoomSnapshot
  connection: LanRoomParticipantView['connection']
  listener?: LanRoomListener
  peer?: LanRoomConnection
  joinUrls: readonly string[]
  gameSessionId?: SessionId
  gameSessionState: LanRoomParticipantView['gameSessionState']
  gameSessionStart?: Promise<void>
  game?: JsonValue
  privateGame?: JsonValue
  error: string | undefined
}

interface DurableBinding {
  readonly schemaVersion: 1
  readonly roomId: string
  readonly role: 'coordinator' | 'participant'
  readonly memberId: string
  readonly parentSessionId: string
  readonly gameSessionId?: string
  readonly strategyPrompt?: string
  readonly promptHash: string
  readonly coordinatorUrl: string
  readonly resumeToken?: string
  readonly state: 'active' | 'finished' | 'closed' | 'archived'
  readonly updatedAt: string
}

interface DurableMatch {
  readonly room: {
    readonly id: string
    readonly code: string
    readonly revision: number
    readonly phase: LanRoomSnapshot['phase']
    readonly coordinatorId: string
    readonly maxMembers: number
    readonly members: ReadonlyArray<LanRoomSnapshot['members'][number] & { readonly resumeToken?: string }>
    readonly result?: string
  }
  readonly closedAt?: string
  readonly finishedAt?: string
}

interface LanGamePersistencePort {
  get(roomId: string): DurableMatch | undefined
  listBindings(roomId?: string): DurableBinding[]
  putBinding(binding: DurableBinding): Promise<DurableBinding>
}

interface RecoverableDoudizhuRuntime {
  resume(room: LanRoomSnapshot): boolean
}

interface RestorableLanGameAgents {
  restore(request: {
    readonly parent: Agent
    readonly childId: SessionId
    readonly strategyPrompt: string
    readonly promptHash: string
  }): { readonly childId: SessionId }
}

/** Coordinator request for one local or remote hidden Game Session decision. */
export interface LanRoomDecisionRequest {
  readonly roomId: LanRoomSnapshot['id']
  readonly memberId: import('../room/index.ts').LanMemberId
  readonly requestId: string
  readonly stateVersion: number
  readonly state: JsonValue
  readonly signal: AbortSignal
}

/** Session-scoped local control service exposed only through DSH's ordinary Remote gateway. */
export default class LanRoomTransport extends TypertRemoteService {
  static inject = ['agents', 'lanRooms', 'lanGameAgents']

  private readonly active = new Map<SessionId, ActiveParticipant>()

  /** Install room change, Agent disposal, and provider teardown ownership. */
  constructor(ctx: Context) {
    super(ctx, 'lanRoomTransport')
    ctx.effect(() => ctx.lanRooms.onChanged(({ kind, room }) => {
      for (const entry of this.active.values()) {
        if (entry.role !== 'coordinator' || entry.room.id !== room.id) continue
        if (kind === 'removed') {
          entry.connection = 'disconnected'
          continue
        }
        this.acceptSnapshot(entry, room)
      }
    }), 'lan-room-transport: follow coordinator rooms')
    ctx.on('agent/disposed', ({ agent }) => {
      void this.disposeAgent(agent.id).catch((error: unknown) => {
        this.ctx.logger.warn(`lan-room-transport: Agent disposal failed: ${messageOf(error)}`)
      })
    })
    ctx.effect(() => async () => {
      const entries = [...this.active.values()]
      this.active.clear()
      await Promise.all(entries.map(entry => this.closeEntry(entry, false)))
    }, 'lan-room-transport: close listeners and participant sockets')
  }

  /**
   * Create one three-seat room and bind its coordinator listener on all IPv4 interfaces.
   * @param agent - visible foreground Agent that owns this participant.
   * @param request - only the pre-game strategy Prompt.
   * @returns local participant view after listener readiness.
   */
  @Remote('host')
  async host(agent: Agent, request: HostLanRoomRequest): Promise<LanRoomParticipantView> {
    this.assertAvailable(agent)
    let strategyPrompt = prompt(request.strategyPrompt)
    const recovered = this.recoverableBinding(agent, 'coordinator')
    if (recovered !== undefined) {
      strategyPrompt = recoveredPrompt(recovered.binding)
      return await this.resumeCoordinator(agent, strategyPrompt, recovered.binding, recovered.match)
    }
    let room = this.ctx.lanRooms.create({ coordinatorId: LanMemberId(agent.id) })
    room = this.ctx.lanRooms.updatePrompt({
      roomId: room.id,
      memberId: LanMemberId(agent.id),
      expectedRevision: room.revision,
      promptHash: hashPrompt(strategyPrompt),
    })
    const entry: ActiveParticipant = {
      parent: agent,
      role: 'coordinator',
      abort: new AbortController(),
      strategyPrompt,
      room,
      connection: 'connected',
      joinUrls: [],
      gameSessionState: 'absent',
      error: undefined,
    }
    this.active.set(agent.id, entry)
    try {
      entry.listener = await listenLanRoom(this.ctx.lanRooms, {
        roomId: room.id,
        coordinatorId: LanMemberId(agent.id),
        host: '0.0.0.0',
      })
      entry.joinUrls = advertisedUrls(entry.listener.port)
      await this.persistBinding(entry)
      return view(entry)
    } catch (error: unknown) {
      this.active.delete(agent.id)
      this.ctx.lanRooms.close(room.id, LanMemberId(agent.id))
      throw error
    }
  }

  /**
   * Join one coordinator through the Host process and publish this Session's Prompt hash.
   * @param agent - visible foreground Agent that owns this participant.
   * @param request - coordinator address, pairing code, and local strategy Prompt.
   * @returns local participant view after the prompt hash commits.
   */
  @Remote('join')
  async join(agent: Agent, request: JoinLanRoomControlRequest): Promise<LanRoomParticipantView> {
    this.assertAvailable(agent)
    const binding = this.recoverableBinding(agent, 'participant')?.binding
    const strategyPrompt = binding?.resumeToken === undefined ? prompt(request.strategyPrompt) : recoveredPrompt(binding)
    const entry: ActiveParticipant = {
      parent: agent,
      role: 'participant',
      abort: new AbortController(),
      strategyPrompt,
      room: undefined as unknown as LanRoomSnapshot,
      connection: 'connecting',
      joinUrls: [],
      gameSessionState: 'absent',
      error: undefined,
    }
    try {
      entry.peer = await connectLanRoom({
        url: request.url,
        code: request.code,
        memberId: agent.id,
        ...(binding?.resumeToken === undefined || normalizedUrl(binding.coordinatorUrl) !== normalizedUrl(request.url)
          ? {}
          : { resume: { roomId: binding.roomId, token: binding.resumeToken } }),
        onConnectionState: (state) => {
          switch (state.status) {
            case 'connecting':
              entry.connection = 'connecting'
              break
            case 'connected':
              entry.connection = 'connected'
              entry.error = undefined
              break
            case 'reconnecting':
              entry.connection = 'reconnecting'
              entry.error = state.reason
              break
            case 'closed':
              entry.connection = 'disconnected'
              entry.error = state.reason
              break
            default:
              state satisfies never
          }
        },
        onSnapshot: (room) => { this.acceptSnapshot(entry, room) },
        onClosed: (reason) => {
          entry.connection = 'disconnected'
          entry.error = reason
        },
        onGameSnapshot: (game) => { entry.game = game },
        onPrivateGameSnapshot: (game) => { entry.privateGame = game },
        onDecisionRequest: (decision) => {
          void this.answerRemoteDecision(entry, decision).catch((error: unknown) => {
            entry.error = messageOf(error)
          })
        },
      })
      entry.room = entry.peer.snapshot().phase === 'lobby'
        ? await entry.peer.updatePrompt(hashPrompt(strategyPrompt))
        : entry.peer.snapshot()
      this.active.set(agent.id, entry)
      if (binding !== undefined && entry.room.phase === 'running') this.restoreGameSession(entry, binding)
      await this.persistBinding(entry)
      return view(entry)
    } catch (error: unknown) {
      await entry.peer?.close()
      throw error
    }
  }

  /**
   * Read the current local participant attached to a visible Session.
   * @param agent - exact live foreground Agent.
   * @returns detached local view, or undefined outside a room.
   */
  @Remote('status')
  status(agent: Agent): LanRoomParticipantView | undefined {
    const entry = this.active.get(agent.id)
    return entry === undefined ? undefined : view(entry)
  }

  /**
   * Replace the only user-editable game setting and clear readiness.
   * @param agent - exact live foreground Agent.
   * @param strategyPrompt - non-empty Prompt while the lobby remains open.
   * @returns committed local participant view.
   */
  @Remote('updatePrompt')
  async updatePrompt(agent: Agent, strategyPrompt: string): Promise<LanRoomParticipantView> {
    const entry = this.entry(agent)
    const next = prompt(strategyPrompt)
    if (entry.room.phase !== 'lobby') throw new Error('strategy Prompt is locked after the lobby')
    entry.room = entry.role === 'coordinator'
      ? this.ctx.lanRooms.updatePrompt({
        roomId: entry.room.id,
        memberId: LanMemberId(agent.id),
        expectedRevision: entry.room.revision,
        promptHash: hashPrompt(next),
      })
      : await requiredPeer(entry).updatePrompt(hashPrompt(next))
    entry.strategyPrompt = next
    return view(entry)
  }

  /**
   * Change local readiness; the coordinator starts automatically after all three members lock.
   * @param agent - exact live foreground Agent.
   * @param ready - requested lobby readiness.
   * @returns committed local participant view.
   */
  @Remote('setReady')
  async setReady(agent: Agent, ready: boolean): Promise<LanRoomParticipantView> {
    const entry = this.entry(agent)
    entry.room = entry.role === 'coordinator'
      ? this.ctx.lanRooms.setReady({
        roomId: entry.room.id,
        memberId: LanMemberId(agent.id),
        expectedRevision: entry.room.revision,
        ready,
      })
      : await requiredPeer(entry).setReady(ready)
    this.scheduleStart(entry)
    return view(entry)
  }

  /**
   * Leave an open lobby or close the coordinator-owned room.
   * @param agent - exact live foreground Agent.
   */
  @Remote('leave')
  async leave(agent: Agent): Promise<void> {
    const entry = this.entry(agent)
    this.active.delete(agent.id)
    await this.closeEntry(entry, true)
  }

  /**
   * Request one action from the addressed member's hidden Game Session.
   * @param request - room/member address, correlation values, private state, and cancellation.
   * @returns structured action from the local bridge or remote Host peer.
   */
  async requestDecision(request: LanRoomDecisionRequest): Promise<JsonValue> {
    const entry = [...this.active.values()].find(candidate => candidate.room.id === request.roomId && candidate.role === 'coordinator')
    if (entry === undefined) throw new Error(`room ${JSON.stringify(request.roomId)} has no local coordinator transport`)
    if (request.memberId === LanMemberId(entry.parent.id)) {
      entry.privateGame = structuredClone(request.state)
      await this.ensureGameSession(entry)
      if (entry.gameSessionId === undefined) throw new Error('coordinator Game Session is unavailable')
      return (await this.ctx.lanGameAgents.decide({
        parent: entry.parent,
        childId: entry.gameSessionId,
        requestId: request.requestId,
        stateVersion: request.stateVersion,
        state: request.state,
        signal: request.signal,
      })).action
    }
    if (entry.listener === undefined) throw new Error('coordinator listener is unavailable')
    return await entry.listener.requestDecision(request.memberId, {
      requestId: request.requestId,
      stateVersion: request.stateVersion,
      state: request.state,
    }, request.signal)
  }

  /**
   * Publish one public game projection locally and to every connected member.
   * @param roomId - coordinator-owned room identity.
   * @param game - JSON public game projection.
   */
  publishGameSnapshot(roomId: LanRoomSnapshot['id'], game: JsonValue): void {
    const entry = [...this.active.values()].find(candidate => candidate.room.id === roomId && candidate.role === 'coordinator')
    if (entry === undefined) throw new Error(`room ${JSON.stringify(roomId)} has no local coordinator transport`)
    entry.game = structuredClone(game)
    entry.listener?.publishGameSnapshot(game)
  }

  /**
   * Publish one seat-private browser projection only to the addressed local DSH Host.
   * @param roomId - coordinator-owned room identity.
   * @param memberId - exact room member identity.
   * @param game - JSON private game projection.
   */
  publishPrivateGameSnapshot(
    roomId: LanRoomSnapshot['id'],
    memberId: import('../room/index.ts').LanMemberId,
    game: JsonValue,
  ): void {
    const entry = [...this.active.values()].find(candidate => candidate.room.id === roomId && candidate.role === 'coordinator')
    if (entry === undefined) throw new Error(`room ${JSON.stringify(roomId)} has no local coordinator transport`)
    if (memberId === LanMemberId(entry.parent.id)) entry.privateGame = structuredClone(game)
    else entry.listener?.publishPrivateGameSnapshot(memberId, game)
  }

  /**
   * Return coordinator-held resume tokens for inclusion in a durable match commit.
   * @param roomId - exact locally coordinated room identity.
   * @returns detached member-id to token map, or an empty map without a live listener.
   */
  resumeTokens(roomId: LanRoomSnapshot['id']): Readonly<Record<string, string>> {
    const entry = [...this.active.values()].find(candidate => candidate.room.id === roomId && candidate.role === 'coordinator')
    return entry?.listener?.resumeTokens() ?? {}
  }

  private acceptSnapshot(entry: ActiveParticipant, room: LanRoomSnapshot): void {
    entry.room = room
    entry.error = undefined
    this.scheduleStart(entry)
    if (room.phase === 'running') void this.ensureGameSession(entry)
  }

  private scheduleStart(entry: ActiveParticipant): void {
    if (entry.role !== 'coordinator' || entry.room.phase !== 'locked') return
    queueMicrotask(() => {
      const current = this.active.get(entry.parent.id)
      if (current !== entry || entry.room.phase !== 'locked') return
      try {
        const room = this.ctx.lanRooms.get(entry.room.id)
        if (room?.phase !== 'locked') return
        this.acceptSnapshot(entry, this.ctx.lanRooms.start({
          roomId: room.id,
          coordinatorId: LanMemberId(entry.parent.id),
          expectedRevision: room.revision,
        }))
      } catch (error: unknown) {
        entry.error = messageOf(error)
      }
    })
  }

  private ensureGameSession(entry: ActiveParticipant): Promise<void> {
    if (entry.gameSessionState !== 'absent') return entry.gameSessionStart ?? Promise.resolve()
    entry.gameSessionState = 'starting'
    entry.gameSessionStart = this.ctx.lanGameAgents.create({
      parent: entry.parent,
      strategyPrompt: entry.strategyPrompt,
      signal: entry.abort.signal,
    }).then(async (created) => {
      entry.gameSessionId = created.childId
      entry.gameSessionState = 'ready'
      if (entry.role === 'coordinator' || entry.peer !== undefined) await this.persistBinding(entry)
    }, (error: unknown) => {
      entry.gameSessionState = 'failed'
      entry.error = messageOf(error)
    })
    return entry.gameSessionStart
  }

  private async answerRemoteDecision(
    entry: ActiveParticipant,
    request: { readonly requestId: string; readonly stateVersion: number; readonly state: JsonValue },
  ): Promise<void> {
    entry.privateGame = structuredClone(request.state)
    await this.ensureGameSession(entry)
    if (entry.gameSessionId === undefined || entry.peer === undefined) throw new Error('participant Game Session is unavailable')
    const decision = await this.ctx.lanGameAgents.decide({
      parent: entry.parent,
      childId: entry.gameSessionId,
      requestId: request.requestId,
      stateVersion: request.stateVersion,
      state: request.state,
      signal: entry.abort.signal,
    })
    entry.peer.respondDecision(decision.requestId, decision.stateVersion, decision.action)
  }

  private async disposeAgent(agentId: SessionId): Promise<void> {
    const entry = this.active.get(agentId)
    if (entry === undefined) return
    this.active.delete(agentId)
    await this.closeEntry(entry, false)
  }

  private async closeEntry(entry: ActiveParticipant, mutateRoom: boolean): Promise<void> {
    entry.abort.abort()
    if (entry.role === 'coordinator') {
      if (this.ctx.lanRooms.get(entry.room.id) !== undefined) {
        this.ctx.lanRooms.close(entry.room.id, LanMemberId(entry.parent.id))
      }
    } else if (mutateRoom && entry.room.phase === 'lobby' && entry.connection === 'connected') {
      await entry.peer?.leave()
    }
    await entry.peer?.close()
    await entry.listener?.close()
    await entry.gameSessionStart
    if (entry.gameSessionId !== undefined) this.ctx.lanGameAgents.remove(entry.parent, entry.gameSessionId)
  }

  private assertAvailable(agent: Agent): void {
    if (this.active.has(agent.id)) throw new Error(`Session ${JSON.stringify(agent.id)} already has a LAN room participant`)
  }

  private entry(agent: Agent): ActiveParticipant {
    const entry = this.active.get(agent.id)
    if (entry === undefined || entry.parent !== agent) throw new Error(`Session ${JSON.stringify(agent.id)} has no LAN room participant`)
    return entry
  }

  private persistence(): LanGamePersistencePort | undefined {
    return this.ctx.get('lanGamePersistence') as LanGamePersistencePort | undefined
  }

  private recoverableBinding(
    agent: Agent,
    role: DurableBinding['role'],
  ): { readonly binding: DurableBinding; readonly match?: DurableMatch } | undefined {
    const persistence = this.persistence()
    const binding = persistence?.listBindings().find(candidate => candidate.state === 'active'
      && candidate.role === role
      && candidate.parentSessionId === agent.id
      && candidate.memberId === agent.id)
    if (binding === undefined) return undefined
    const match = persistence?.get(binding.roomId)
    if (role === 'coordinator') {
      if (match === undefined || match.closedAt !== undefined) return undefined
      if (match.room.coordinatorId !== agent.id) return undefined
    }
    return { binding, ...(match === undefined ? {} : { match }) }
  }

  private async resumeCoordinator(
    agent: Agent,
    strategyPrompt: string,
    binding: DurableBinding,
    match: DurableMatch | undefined,
  ): Promise<LanRoomParticipantView> {
    if (match === undefined) throw new Error(`durable coordinator binding ${JSON.stringify(binding.roomId)} has no match`)
    const room = this.ctx.lanRooms.restore(roomSnapshot(match.room))
    const entry: ActiveParticipant = {
      parent: agent,
      role: 'coordinator',
      abort: new AbortController(),
      strategyPrompt,
      room,
      connection: 'connected',
      joinUrls: [],
      gameSessionState: 'absent',
      error: undefined,
    }
    this.active.set(agent.id, entry)
    try {
      entry.listener = await listenLanRoom(this.ctx.lanRooms, {
        roomId: room.id,
        coordinatorId: LanMemberId(agent.id),
        host: '0.0.0.0',
        port: coordinatorPort(binding.coordinatorUrl),
        resumeTokens: Object.fromEntries(match.room.members.flatMap(member => member.resumeToken === undefined
          ? []
          : [[member.id, member.resumeToken]])),
      })
      entry.joinUrls = advertisedUrls(entry.listener.port)
      if (room.phase === 'running') this.restoreGameSession(entry, binding)
      await this.persistBinding(entry)
      const runtime = this.ctx.get('doudizhuGames') as RecoverableDoudizhuRuntime | undefined
      if (room.phase === 'running') runtime?.resume(room)
      return view(entry)
    } catch (error: unknown) {
      this.active.delete(agent.id)
      await entry.listener?.close()
      throw error
    }
  }

  private async persistBinding(entry: ActiveParticipant): Promise<void> {
    const persistence = this.persistence()
    if (persistence === undefined) return
    const promptHash = hashPrompt(entry.strategyPrompt)
    const coordinatorUrl = entry.role === 'participant'
      ? requiredPeer(entry).coordinatorUrl
      : entry.joinUrls[0]
    if (coordinatorUrl === undefined) throw new Error('coordinator listener has no advertised URL')
    await persistence.putBinding({
      schemaVersion: 1,
      roomId: entry.room.id,
      role: entry.role,
      memberId: entry.parent.id,
      parentSessionId: entry.parent.id,
      ...(entry.gameSessionId === undefined ? {} : { gameSessionId: entry.gameSessionId }),
      strategyPrompt: entry.strategyPrompt,
      promptHash,
      coordinatorUrl,
      ...(entry.peer === undefined ? {} : { resumeToken: entry.peer.resumeToken() }),
      state: entry.room.phase === 'finished' ? 'finished' : 'active',
      updatedAt: new Date().toISOString(),
    })
  }

  private restoreGameSession(entry: ActiveParticipant, binding: DurableBinding): void {
    if (binding.gameSessionId === undefined) {
      if (entry.room.phase === 'running') {
        throw new Error(`durable binding ${JSON.stringify(binding.roomId)} has no Game Session identity`)
      }
      return
    }
    const agents = this.ctx.lanGameAgents as unknown as RestorableLanGameAgents
    const restored = agents.restore({
      parent: entry.parent,
      childId: SessionId(binding.gameSessionId),
      strategyPrompt: entry.strategyPrompt,
      promptHash: binding.promptHash,
    })
    entry.gameSessionId = restored.childId
    entry.gameSessionState = 'ready'
  }
}

function view(entry: ActiveParticipant): LanRoomParticipantView {
  return {
    memberId: entry.parent.id,
    role: entry.role,
    connection: entry.connection,
    room: structuredClone(entry.room),
    strategyPrompt: entry.strategyPrompt,
    joinUrls: [...entry.joinUrls],
    gameSessionState: entry.gameSessionState,
    ...(entry.game === undefined ? {} : { game: structuredClone(entry.game) }),
    ...(entry.privateGame === undefined ? {} : { privateGame: structuredClone(entry.privateGame) }),
    ...(entry.gameSessionId === undefined ? {} : { gameSessionId: entry.gameSessionId }),
    ...(entry.error === undefined ? {} : { error: entry.error }),
  }
}

function prompt(value: string): string {
  const resolved = value.trim()
  if (resolved.length === 0 || resolved.length > 8_000) throw new Error('strategy Prompt must contain 1 to 8000 characters')
  return resolved
}

function hashPrompt(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function requiredPeer(entry: ActiveParticipant): LanRoomConnection {
  if (entry.peer === undefined) throw new Error('participant connection is unavailable')
  return entry.peer
}

function advertisedUrls(port: number): string[] {
  const addresses = new Set<string>()
  for (const rows of Object.values(networkInterfaces())) {
    for (const row of rows ?? []) {
      if (row.family === 'IPv4' && !row.internal) addresses.add(row.address)
    }
  }
  if (addresses.size === 0) addresses.add('127.0.0.1')
  return [...addresses].map(address => `ws://${address}:${port}/`)
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function normalizedUrl(value: string): string {
  return new URL(value).toString()
}

function coordinatorPort(value: string): number {
  const url = new URL(value)
  const port = Number(url.port)
  if ((url.protocol !== 'ws:' && url.protocol !== 'wss:') || !Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`durable coordinator URL ${JSON.stringify(value)} has no valid WebSocket port`)
  }
  return port
}

function roomSnapshot(room: DurableMatch['room']): LanRoomSnapshot {
  return {
    id: LanRoomId(room.id),
    code: LanRoomCode(room.code),
    revision: room.revision,
    phase: room.phase,
    coordinatorId: LanMemberId(room.coordinatorId),
    maxMembers: room.maxMembers,
    members: room.members.map(({ resumeToken: _resumeToken, ...member }) => ({
      ...member,
      id: LanMemberId(member.id),
    })),
    ...(room.result === undefined ? {} : { result: room.result }),
  }
}

function recoveredPrompt(binding: DurableBinding): string {
  const strategyPrompt = prompt(binding.strategyPrompt ?? '')
  if (hashPrompt(strategyPrompt) !== binding.promptHash) {
    throw new Error(`durable binding ${JSON.stringify(binding.roomId)} strategy Prompt does not match its hash`)
  }
  return strategyPrompt
}
