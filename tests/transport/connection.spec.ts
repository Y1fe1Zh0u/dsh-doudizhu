import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import WebSocket from 'ws'
import LanRooms, { LanMemberId, type LanRoomSnapshot } from '../../src/room/index.ts'
import {
  connectLanRoom,
  listenLanRoom,
  type LanRoomConnection,
  type LanRoomListener,
} from '../../src/transport/index.ts'

const connections: LanRoomConnection[] = []
const listeners: LanRoomListener[] = []

afterEach(async () => {
  await Promise.all(connections.splice(0).map(connection => connection.close()))
  await Promise.all(listeners.splice(0).map(listener => listener.close()))
})

async function setup(
  options: { heartbeatIntervalMs?: number; heartbeatTimeoutMs?: number } = {},
): Promise<{ ctx: Context; room: LanRoomSnapshot; url: string }> {
  const ctx = new Context()
  await ctx.plugin(LanRooms)
  const coordinatorId = LanMemberId('coordinator')
  const room = ctx.lanRooms.create({ coordinatorId })
  const listener = await listenLanRoom(ctx.lanRooms, { roomId: room.id, coordinatorId, host: '127.0.0.1', ...options })
  listeners.push(listener)
  return { ctx, room, url: `ws://127.0.0.1:${listener.port}` }
}

describe('LAN room participant connection', () => {
  it('joins, follows broadcasts, and issues revision-aware prompt and ready commands', async () => {
    const { ctx, room, url } = await setup()
    const snapshots: LanRoomSnapshot[] = []
    const peerB = await connectLanRoom({ url, code: room.code, memberId: 'peer-b', onSnapshot: snapshot => snapshots.push(snapshot) })
    const peerC = await connectLanRoom({ url, code: room.code, memberId: 'peer-c' })
    connections.push(peerB, peerC)

    await peerB.updatePrompt('b'.repeat(64))
    await expect.poll(() => peerC.snapshot().revision).toBe(3)
    await peerC.updatePrompt('c'.repeat(64))
    let current = ctx.lanRooms.updatePrompt({
      roomId: room.id,
      memberId: room.coordinatorId,
      expectedRevision: 4,
      promptHash: 'a'.repeat(64),
    })
    current = ctx.lanRooms.setReady({
      roomId: room.id,
      memberId: room.coordinatorId,
      expectedRevision: current.revision,
      ready: true,
    })
    await expect.poll(() => peerB.snapshot().revision).toBe(current.revision)
    await peerB.setReady(true)
    await expect.poll(() => peerC.snapshot().revision).toBe(7)
    expect(await peerC.setReady(true)).toMatchObject({ phase: 'locked', revision: 8 })
    expect(snapshots.at(-1)?.members).toHaveLength(3)
    await ctx.fiber.dispose()
  })

  it('marks the member disconnected only after the current socket closes', async () => {
    const { ctx, room, url } = await setup()
    const closed: string[] = []
    const peer = await connectLanRoom({
      url,
      code: room.code,
      memberId: 'peer',
      onClosed: reason => closed.push(reason),
    })
    connections.push(peer)

    await peer.close()
    await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected).toBe(false)
    expect(closed).toEqual(['participant closed connection'])
    await ctx.fiber.dispose()
  })

  it('does not reconnect after an authoritative room close', async () => {
    const { ctx, room, url } = await setup()
    const states: string[] = []
    const closed: string[] = []
    const peer = await connectLanRoom({
      url,
      code: room.code,
      memberId: 'peer-room-close',
      reconnect: { maxAttempts: 3, initialDelayMs: 5, maxDelayMs: 20 },
      onConnectionState: (state) => { states.push(state.status) },
      onClosed: (reason) => { closed.push(reason) },
    })
    connections.push(peer)

    ctx.lanRooms.close(room.id, room.coordinatorId)
    await expect.poll(() => closed).toEqual(['room closed by coordinator'])
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(states).not.toContain('reconnecting')
    await ctx.fiber.dispose()
  })

  it('automatically resumes with bounded backoff after heartbeat detects a half-open socket', async () => {
    const { ctx, room, url } = await setup({ heartbeatIntervalMs: 10, heartbeatTimeoutMs: 30 })
    const states: string[] = []
    const originalPong = Reflect.get(WebSocket.prototype, 'pong')
    WebSocket.prototype.pong = function suppressedPong(): void {}
    try {
      const peer = await connectLanRoom({
        url,
        code: room.code,
        memberId: 'peer-reconnect',
        reconnect: { maxAttempts: 3, initialDelayMs: 5, maxDelayMs: 20 },
        onConnectionState: (state) => {
          states.push(state.status)
          if (state.status === 'reconnecting') WebSocket.prototype.pong = originalPong
        },
      })
      connections.push(peer)

      await expect.poll(() => states.filter(state => state === 'connected').length, { timeout: 1_000 }).toBe(2)
      expect(states).toContain('reconnecting')
      expect(peer.snapshot().id).toBe(room.id)
      await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected).toBe(true)
    } finally {
      WebSocket.prototype.pong = originalPong
    }
    await ctx.fiber.dispose()
  })

  it('uses a persisted room identity and token for its initial handshake after restart', async () => {
    const { ctx, room, url } = await setup()
    const first = await connectLanRoom({ url, code: room.code, memberId: 'peer-initial-resume' })
    const resume = { roomId: first.snapshot().id, token: first.resumeToken() }
    await first.close()
    await expect.poll(() => ctx.lanRooms.get(room.id)?.members[1]?.connected).toBe(false)

    const recovered = await connectLanRoom({
      url,
      code: room.code,
      memberId: 'peer-initial-resume',
      resume,
    })
    connections.push(recovered)

    expect(recovered.snapshot()).toMatchObject({ id: room.id, members: [{ id: 'coordinator' }, { id: 'peer-initial-resume', connected: true }] })
    expect(ctx.lanRooms.get(room.id)?.members).toHaveLength(2)
    await ctx.fiber.dispose()
  })

  it('rejects a command interrupted by socket loss and never replays it after resume', async () => {
    const { ctx, room, url } = await setup()
    const states: string[] = []
    const originalSend = Reflect.get(WebSocket.prototype, 'send')
    let interrupted = false
    const peer = await connectLanRoom({
      url,
      code: room.code,
      memberId: 'peer-command',
      reconnect: { maxAttempts: 3, initialDelayMs: 5, maxDelayMs: 20 },
      onConnectionState: (state) => { states.push(state.status) },
    })
    connections.push(peer)
    WebSocket.prototype.send = function interruptCommand(this: WebSocket, data: Parameters<WebSocket['send']>[0]): void {
      Reflect.apply(originalSend, this, [data])
      if (!interrupted && typeof data === 'string' && data.includes('"type":"set-ready"')) {
        interrupted = true
        this.terminate()
      }
    } as WebSocket['send']
    try {
      await expect(peer.setReady(true)).rejects.toThrow(/command failed because the socket closed/u)
    } finally {
      WebSocket.prototype.send = originalSend
    }
    await expect.poll(() => states.filter(state => state === 'connected').length, { timeout: 1_000 }).toBe(2)
    const revisionAfterResume = ctx.lanRooms.get(room.id)?.revision
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(ctx.lanRooms.get(room.id)?.revision).toBe(revisionAfterResume)
    await ctx.fiber.dispose()
  })
})
