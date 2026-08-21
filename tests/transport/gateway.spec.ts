import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import WebSocket from 'ws'
import LanRooms, { LanMemberId, type LanRoomSnapshot } from '../../src/room/index.ts'
import { listenLanRoom, type LanRoomListener } from '../../src/transport/index.ts'
import type { LanRoomServerMessage } from '../../src/transport/protocol.ts'

const openSockets: WebSocket[] = []
const openListeners: LanRoomListener[] = []

afterEach(async () => {
  for (const socket of openSockets.splice(0)) socket.terminate()
  await Promise.all(openListeners.splice(0).map(listener => listener.close()))
})

async function setup(
  options: {
    heartbeatIntervalMs?: number
    heartbeatTimeoutMs?: number
    unauthenticatedHandshakeTimeoutMs?: number
    maxUnauthenticatedConnections?: number
    maxUnauthenticatedConnectionsPerIp?: number
  } = {},
): Promise<{ ctx: Context; room: LanRoomSnapshot; listener: LanRoomListener; url: string }> {
  const ctx = new Context()
  await ctx.plugin(LanRooms)
  const coordinatorId = LanMemberId('coordinator')
  const room = ctx.lanRooms.create({ coordinatorId })
  const listener = await listenLanRoom(ctx.lanRooms, { roomId: room.id, coordinatorId, host: '127.0.0.1', ...options })
  openListeners.push(listener)
  return { ctx, room, listener, url: `ws://127.0.0.1:${listener.port}` }
}

async function connect(url: string, origin?: string): Promise<WebSocket> {
  const socket = new WebSocket(url, origin === undefined ? {} : { origin })
  openSockets.push(socket)
  await new Promise<void>((resolve, reject) => {
    socket.once('open', resolve)
    socket.once('error', reject)
  })
  return socket
}

function waitFor(socket: WebSocket, type: LanRoomServerMessage['type']): Promise<LanRoomServerMessage> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off('message', onMessage)
      reject(new Error(`timed out waiting for ${type}`))
    }, 2_000)
    const onMessage = (raw: WebSocket.RawData) => {
      const message = JSON.parse(frameText(raw)) as LanRoomServerMessage
      if (message.type !== type) return
      clearTimeout(timeout)
      socket.off('message', onMessage)
      resolve(message)
    }
    socket.on('message', onMessage)
  })
}

function send(socket: WebSocket, message: object): void {
  socket.send(JSON.stringify({ version: 1, ...message }))
}

function frameText(raw: WebSocket.RawData): string {
  if (Array.isArray(raw)) return Buffer.concat(raw).toString('utf8')
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString('utf8')
  return raw.toString('utf8')
}

describe('LAN room WebSocket gateway', () => {
  it('pairs two peers, applies prompt and ready commands, and locks the room', async () => {
    const { ctx, room, url } = await setup()
    const peerB = await connect(url)
    const joinedB = waitFor(peerB, 'joined')
    send(peerB, { type: 'join', messageId: 'join-b', code: room.code, memberId: 'peer-b' })
    const b = await joinedB
    expect(b).toMatchObject({ type: 'joined', messageId: 'join-b', room: { revision: 1 } })

    const peerC = await connect(url)
    const joinedC = waitFor(peerC, 'joined')
    send(peerC, { type: 'join', messageId: 'join-c', code: room.code, memberId: 'peer-c' })
    expect(await joinedC).toMatchObject({ type: 'joined', room: { revision: 2 } })

    const promptAck = waitFor(peerB, 'ack')
    send(peerB, { type: 'update-prompt', messageId: 'prompt-b', expectedRevision: 2, promptHash: 'b'.repeat(64) })
    expect(await promptAck).toMatchObject({ type: 'ack', room: { revision: 3 } })

    let current = ctx.lanRooms.updatePrompt({ roomId: room.id, memberId: room.coordinatorId, expectedRevision: 3, promptHash: 'a'.repeat(64) })
    current = ctx.lanRooms.setReady({ roomId: room.id, memberId: room.coordinatorId, expectedRevision: current.revision, ready: true })
    const readyB = waitFor(peerB, 'ack')
    send(peerB, { type: 'set-ready', messageId: 'ready-b', expectedRevision: current.revision, ready: true })
    current = (await readyB as Extract<LanRoomServerMessage, { type: 'ack' }>).room

    const promptC = waitFor(peerC, 'ack')
    send(peerC, { type: 'update-prompt', messageId: 'prompt-c', expectedRevision: current.revision, promptHash: 'c'.repeat(64) })
    current = (await promptC as Extract<LanRoomServerMessage, { type: 'ack' }>).room
    const readyC = waitFor(peerC, 'ack')
    send(peerC, { type: 'set-ready', messageId: 'ready-c', expectedRevision: current.revision, ready: true })
    expect(await readyC).toMatchObject({ type: 'ack', room: { phase: 'locked', revision: 8 } })
    expect(ctx.lanRooms.get(room.id)?.members.map(member => member.promptHash)).toEqual([
      'a'.repeat(64),
      'b'.repeat(64),
      'c'.repeat(64),
    ])
    await ctx.fiber.dispose()
  })

  it('rejects stale commands and resumes with the room-scoped token', async () => {
    const { ctx, room, url } = await setup()
    const peer = await connect(url)
    const joined = waitFor(peer, 'joined')
    send(peer, { type: 'join', messageId: 'join', code: room.code, memberId: 'peer' })
    const first = await joined as Extract<LanRoomServerMessage, { type: 'joined' }>

    const failure = waitFor(peer, 'error')
    send(peer, { type: 'set-ready', messageId: 'stale', expectedRevision: 0, ready: true })
    expect(await failure).toMatchObject({ type: 'error', messageId: 'stale', code: 'LAN_ROOM_STALE_REVISION' })

    const disconnected = new Promise<void>(resolve => peer.once('close', () => { resolve() }))
    peer.close()
    await disconnected
    await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected).toBe(false)

    const resumed = await connect(url)
    const resumedMessage = waitFor(resumed, 'joined')
    send(resumed, { type: 'resume', messageId: 'resume', roomId: room.id, memberId: 'peer', token: first.token })
    expect(await resumedMessage).toMatchObject({ type: 'joined', messageId: 'resume', room: { members: [{ connected: true }, { connected: true }] } })
    await ctx.fiber.dispose()
  })

  it('rejects direct browser-origin sockets', async () => {
    const { ctx, url } = await setup()
    const socket = await connect(url, 'http://evil.example')
    const code = await new Promise<number>(resolve => socket.once('close', resolve))
    expect(code).toBe(1008)
    await ctx.fiber.dispose()
  })

  it('rejects a code belonging to another room without mutating that room', async () => {
    const { ctx, room, url } = await setup()
    const other = ctx.lanRooms.create({ coordinatorId: LanMemberId('other-coordinator') })
    const socket = await connect(url)
    const failure = waitFor(socket, 'error')
    send(socket, { type: 'join', messageId: 'wrong-room', code: other.code, memberId: 'peer' })

    expect(await failure).toMatchObject({ type: 'error', messageId: 'wrong-room', code: 'LAN_ROOM_WIRE_INVALID' })
    expect(ctx.lanRooms.get(other.id)?.members).toHaveLength(1)
    expect(ctx.lanRooms.get(room.id)?.members).toHaveLength(1)
    await ctx.fiber.dispose()
  })

  it('rate-limits repeated unauthenticated handshakes from one address', async () => {
    const { ctx, room, url } = await setup()
    const socket = await connect(url)
    const closed = new Promise<number>(resolve => socket.once('close', resolve))
    const wrongCode = room.code === '999999' ? '999998' : '999999'
    for (let attempt = 0; attempt < 13; attempt += 1) {
      send(socket, { type: 'join', messageId: `bad-${attempt}`, code: wrongCode, memberId: `peer-${attempt}` })
    }
    await expect(closed).resolves.toBe(1008)
    await ctx.fiber.dispose()
  })

  it('closes a socket that does not authenticate before the handshake deadline', async () => {
    const { ctx, url } = await setup({ unauthenticatedHandshakeTimeoutMs: 20 })
    const socket = await connect(url)
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      socket.once('close', (code, reason) => { resolve({ code, reason: reason.toString() }) })
    })

    await expect(closed).resolves.toEqual({ code: 1008, reason: 'authentication handshake timed out' })
    await ctx.fiber.dispose()
  })

  it('caps simultaneous unauthenticated sockets from one address', async () => {
    const { ctx, url } = await setup({
      unauthenticatedHandshakeTimeoutMs: 1_000,
      maxUnauthenticatedConnections: 2,
      maxUnauthenticatedConnectionsPerIp: 1,
    })
    await connect(url)
    const rejected = await connect(url)
    const closed = new Promise<{ code: number; reason: string }>((resolve) => {
      rejected.once('close', (code, reason) => { resolve({ code, reason: reason.toString() }) })
    })

    await expect(closed).resolves.toEqual({ code: 1008, reason: 'unauthenticated connection limit exceeded' })
    await ctx.fiber.dispose()
  })

  it('correlates private decisions and broadcasts public game snapshots', async () => {
    const { ctx, room, listener, url } = await setup()
    const peer = await connect(url)
    const joined = waitFor(peer, 'joined')
    send(peer, { type: 'join', messageId: 'join-game', code: room.code, memberId: 'peer-game' })
    await joined

    const requestFrame = waitFor(peer, 'decision-request')
    const decision = listener.requestDecision(LanMemberId('peer-game'), {
      requestId: 'decision-1',
      stateVersion: 9,
      state: { private: true },
    }, new AbortController().signal)
    expect(await requestFrame).toMatchObject({ type: 'decision-request', requestId: 'decision-1', stateVersion: 9 })
    send(peer, { type: 'decision-response', requestId: 'decision-1', stateVersion: 9, action: { type: 'pass' } })
    await expect(decision).resolves.toEqual({ type: 'pass' })

    const publicFrame = waitFor(peer, 'game-snapshot')
    listener.publishGameSnapshot({ game: 'doudizhu', version: 10 })
    expect(await publicFrame).toMatchObject({ type: 'game-snapshot', game: { game: 'doudizhu', version: 10 } })
    await ctx.fiber.dispose()
  })

  it('keeps an in-flight decision across disconnect and resends the same request after resume', async () => {
    const { ctx, room, listener, url } = await setup()
    const peer = await connect(url)
    const joined = waitFor(peer, 'joined')
    send(peer, { type: 'join', messageId: 'join-resume-decision', code: room.code, memberId: 'peer-decision' })
    const identity = await joined as Extract<LanRoomServerMessage, { type: 'joined' }>

    const firstRequest = waitFor(peer, 'decision-request')
    const controller = new AbortController()
    const decision = listener.requestDecision(LanMemberId('peer-decision'), {
      requestId: 'stable-request',
      stateVersion: 17,
      state: { hand: ['3S'] },
    }, controller.signal)
    expect(await firstRequest).toMatchObject({ requestId: 'stable-request', stateVersion: 17 })
    peer.terminate()
    await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected).toBe(false)
    const pendingDeadline = new Promise<string>((resolve) => {
      setTimeout(() => { resolve('pending') }, 30)
    })
    await expect(Promise.race([decision.then(() => 'settled', () => 'settled'), pendingDeadline])).resolves.toBe('pending')

    const resumed = await connect(url)
    const joinedAgain = waitFor(resumed, 'joined')
    const resent = waitFor(resumed, 'decision-request')
    send(resumed, { type: 'resume', messageId: 'resume-decision', roomId: room.id, memberId: 'peer-decision', token: identity.token })
    await joinedAgain
    expect(await resent).toMatchObject({ requestId: 'stable-request', stateVersion: 17, state: { hand: ['3S'] } })
    send(resumed, { type: 'decision-response', requestId: 'stable-request', stateVersion: 17, action: { type: 'play' } })
    await expect(decision).resolves.toEqual({ type: 'play' })
    await ctx.fiber.dispose()
  })

  it('terminates a half-open socket after its pong deadline', async () => {
    const { ctx, room, url } = await setup({ heartbeatIntervalMs: 10, heartbeatTimeoutMs: 30 })
    const peer = await connect(url)
    const joined = waitFor(peer, 'joined')
    send(peer, { type: 'join', messageId: 'join-half-open', code: room.code, memberId: 'peer-half-open' })
    await joined
    peer.pause()

    await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected, { timeout: 1_000 }).toBe(false)
    await ctx.fiber.dispose()
  })

  it('keeps a disconnected decision only until its external abort signal', async () => {
    const { ctx, room, listener, url } = await setup()
    const peer = await connect(url)
    const joined = waitFor(peer, 'joined')
    send(peer, { type: 'join', messageId: 'join-abort', code: room.code, memberId: 'peer-abort' })
    await joined

    const requestFrame = waitFor(peer, 'decision-request')
    const controller = new AbortController()
    const decision = listener.requestDecision(LanMemberId('peer-abort'), {
      requestId: 'abort-request',
      stateVersion: 18,
      state: { private: true },
    }, controller.signal)
    await requestFrame
    peer.terminate()
    await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected).toBe(false)
    controller.abort(new Error('turn deadline expired'))

    await expect(decision).rejects.toThrow('turn deadline expired')
    await ctx.fiber.dispose()
  })
})
