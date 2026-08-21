/** Restricted coordinator-side WebSocket transport for one authoritative LAN room. */

import { randomBytes } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import WebSocket, { WebSocketServer } from 'ws'
import type { JsonValue } from '@deepseek-ai/dsh-session/types'
import LanRooms, {
  LanMemberId,
  LanRoomError,
  type LanRoomId,
  type LanRoomSnapshot,
} from '../room/index.ts'
import {
  LAN_ROOM_WIRE_VERSION,
  parseLanRoomClientMessage,
  type LanRoomCommandMessage,
  type LanRoomDecisionRequestMessage,
  type LanRoomServerMessage,
} from './protocol.ts'

export * from './protocol.ts'
export * from './connection.ts'
export type * from './client.ts'

interface AuthenticatedPeer {
  readonly roomId: LanRoomId
  readonly memberId: ReturnType<typeof LanMemberId>
  readonly token: string
}

/** Request for binding one room-specific coordinator listener. */
export interface ListenLanRoomRequest {
  readonly roomId: LanRoomId
  readonly coordinatorId: ReturnType<typeof LanMemberId>
  readonly host: string
  readonly port?: number
  /** Interval between coordinator WebSocket ping frames. Defaults to 10 seconds. */
  readonly heartbeatIntervalMs?: number
  /** Maximum time without a pong before terminating a half-open socket. Defaults to 30 seconds. */
  readonly heartbeatTimeoutMs?: number
  /** Maximum time a socket may remain unauthenticated. Defaults to 5 seconds. */
  readonly unauthenticatedHandshakeTimeoutMs?: number
  /** Maximum simultaneous unauthenticated sockets across the listener. Defaults to 64. */
  readonly maxUnauthenticatedConnections?: number
  /** Maximum simultaneous unauthenticated sockets from one remote address. Defaults to 8. */
  readonly maxUnauthenticatedConnectionsPerIp?: number
  /** Resume tokens recovered from the coordinator's validated durable record. */
  readonly resumeTokens?: Readonly<Record<string, string>>
}

/** Live coordinator listener and its explicit async disposer. */
export interface LanRoomListener {
  readonly host: string
  readonly port: number
  requestDecision(memberId: ReturnType<typeof LanMemberId>, request: Omit<LanRoomDecisionRequestMessage, 'version' | 'type'>, signal: AbortSignal): Promise<JsonValue>
  publishGameSnapshot(game: JsonValue): void
  publishPrivateGameSnapshot(memberId: ReturnType<typeof LanMemberId>, game: JsonValue): void
  /** Return detached participant resume tokens for durable coordinator checkpoints. */
  resumeTokens(): Readonly<Record<string, string>>
  close(): Promise<void>
}

/**
 * Bind a restricted WebSocket endpoint for one room.
 * @param rooms - authoritative room service used for identity and mutations.
 * @param request - coordinator identity and listener address.
 * @returns live listener after the operating system accepts the bind.
 */
export async function listenLanRoom(
  rooms: LanRooms,
  request: ListenLanRoomRequest,
): Promise<LanRoomListener> {
  const room = rooms.get(request.roomId)
  if (room === undefined) throw new LanRoomError(`room ${JSON.stringify(request.roomId)} does not exist`, 'LAN_ROOM_NOT_FOUND')
  if (room.coordinatorId !== request.coordinatorId) {
    throw new LanRoomError(`member ${JSON.stringify(request.coordinatorId)} is not the room coordinator`, 'LAN_ROOM_NOT_COORDINATOR')
  }
  if (request.host.length === 0 || request.host.trim() !== request.host) throw new Error('lan-room-ws: host must be non-empty with no surrounding whitespace')
  const port = request.port ?? 0
  if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) throw new Error('lan-room-ws: port must be an integer from 0 through 65535')
  const heartbeatIntervalMs = positiveDuration(request.heartbeatIntervalMs ?? 10_000, 'heartbeatIntervalMs')
  const heartbeatTimeoutMs = positiveDuration(request.heartbeatTimeoutMs ?? 30_000, 'heartbeatTimeoutMs')
  const unauthenticatedHandshakeTimeoutMs = positiveDuration(request.unauthenticatedHandshakeTimeoutMs ?? 5_000, 'unauthenticatedHandshakeTimeoutMs')
  const maxUnauthenticatedConnections = positiveDuration(request.maxUnauthenticatedConnections ?? 64, 'maxUnauthenticatedConnections')
  const maxUnauthenticatedConnectionsPerIp = positiveDuration(request.maxUnauthenticatedConnectionsPerIp ?? 8, 'maxUnauthenticatedConnectionsPerIp')
  if (heartbeatTimeoutMs < heartbeatIntervalMs) throw new Error('lan-room-ws: heartbeatTimeoutMs must be at least heartbeatIntervalMs')

  const server = createServer((_req, res) => {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  })
  const sockets = new WebSocketServer({ server, maxPayload: 512 * 1024 })
  const peers = new Map<WebSocket, AuthenticatedPeer>()
  const currentSockets = new Map<string, WebSocket>()
  const tokens = new Map<string, string>()
  const lastPongs = new Map<WebSocket, number>()
  const handshakeAttempts = new Map<string, { readonly windowStartedAt: number; count: number }>()
  const unauthenticated = new Map<WebSocket, { readonly address: string; readonly timer: ReturnType<typeof setTimeout> }>()
  const unauthenticatedByAddress = new Map<string, number>()
  const pendingDecisions = new Map<string, {
    readonly memberId: ReturnType<typeof LanMemberId>
    readonly stateVersion: number
    readonly request: LanRoomDecisionRequestMessage
    readonly resolve: (action: JsonValue) => void
    readonly reject: (error: Error) => void
    readonly cleanup: () => void
  }>()

  const send = (socket: WebSocket, message: LanRoomServerMessage): void => {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message))
  }
  const sendError = (socket: WebSocket, error: unknown, messageId?: string): void => {
    const code = error instanceof LanRoomError ? error.code : 'LAN_ROOM_WIRE_INVALID'
    const message = error instanceof Error ? error.message : String(error)
    const peer = peers.get(socket)
    const room = peer === undefined ? undefined : rooms.get(peer.roomId)
    send(socket, {
      version: LAN_ROOM_WIRE_VERSION,
      type: 'error',
      ...messageId === undefined ? {} : { messageId },
      code,
      message,
      ...room === undefined ? {} : { room },
    })
  }
  const keyOf = (roomId: LanRoomId, memberId: ReturnType<typeof LanMemberId>): string => `${roomId}\u0000${memberId}`
  for (const [memberId, token] of Object.entries(request.resumeTokens ?? {})) {
    if (!/^[0-9a-f]{64}$/u.test(token)) throw new Error(`lan-room-ws: invalid recovered resume token for ${JSON.stringify(memberId)}`)
    tokens.set(keyOf(request.roomId, LanMemberId(memberId)), token)
  }
  const authenticate = (socket: WebSocket, peer: AuthenticatedPeer): void => {
    clearUnauthenticated(socket)
    const key = keyOf(peer.roomId, peer.memberId)
    const previous = currentSockets.get(key)
    currentSockets.set(key, socket)
    peers.set(socket, peer)
    if (previous !== undefined && previous !== socket) previous.close(4001, 'replaced by resumed connection')
  }
  function clearUnauthenticated(socket: WebSocket): void {
    const pending = unauthenticated.get(socket)
    if (pending === undefined) return
    unauthenticated.delete(socket)
    clearTimeout(pending.timer)
    const count = (unauthenticatedByAddress.get(pending.address) ?? 1) - 1
    if (count === 0) unauthenticatedByAddress.delete(pending.address)
    else unauthenticatedByAddress.set(pending.address, count)
  }
  const resendPendingDecisions = (socket: WebSocket, memberId: ReturnType<typeof LanMemberId>): void => {
    for (const pending of pendingDecisions.values()) {
      if (pending.memberId === memberId) send(socket, pending.request)
    }
  }
  const admitHandshake = (address: string): boolean => {
    const now = Date.now()
    const current = handshakeAttempts.get(address)
    if (current === undefined || now - current.windowStartedAt >= 60_000) {
      handshakeAttempts.set(address, { windowStartedAt: now, count: 1 })
      return true
    }
    current.count += 1
    return current.count <= 12
  }

  const off = rooms.onChanged(({ kind, room: changed }) => {
    if (changed.id !== request.roomId) return
    for (const [socket, peer] of peers) {
      if (peer.roomId !== request.roomId) continue
      if (kind === 'removed') send(socket, { version: 1, type: 'room-closed', roomId: request.roomId })
      else send(socket, { version: 1, type: 'snapshot', room: changed })
    }
  })

  sockets.on('connection', (socket, upgradeRequest) => {
    if (upgradeRequest.headers.origin !== undefined) {
      socket.close(1008, 'browser-origin connections are not accepted')
      return
    }
    const remoteAddress = upgradeRequest.socket.remoteAddress ?? 'unknown'
    const addressCount = unauthenticatedByAddress.get(remoteAddress) ?? 0
    if (unauthenticated.size >= maxUnauthenticatedConnections || addressCount >= maxUnauthenticatedConnectionsPerIp) {
      socket.close(1008, 'unauthenticated connection limit exceeded')
      return
    }
    const handshakeTimer = setTimeout(() => {
      if (!unauthenticated.has(socket)) return
      socket.close(1008, 'authentication handshake timed out')
    }, unauthenticatedHandshakeTimeoutMs)
    handshakeTimer.unref()
    unauthenticated.set(socket, { address: remoteAddress, timer: handshakeTimer })
    unauthenticatedByAddress.set(remoteAddress, addressCount + 1)
    lastPongs.set(socket, Date.now())
    socket.on('pong', () => { lastPongs.set(socket, Date.now()) })
    socket.on('message', (raw, binary) => {
      if (binary) {
        sendError(socket, new Error('binary messages are not supported'))
        return
      }
      let message
      try {
        message = parseLanRoomClientMessage(frameText(raw))
      } catch (error: unknown) {
        sendError(socket, error)
        return
      }
      try {
        const peer = peers.get(socket)
        if (peer === undefined) {
          if (!admitHandshake(remoteAddress)) {
            socket.close(1008, 'handshake rate limit exceeded')
            return
          }
          if (message.type === 'join') {
            const expectedRoom = requiredRoom(rooms, request.roomId)
            if (expectedRoom.code !== message.code) throw new Error('pairing code does not belong to this listener')
            const joined = rooms.join({ code: message.code, memberId: message.memberId })
            const token = randomBytes(32).toString('hex')
            tokens.set(keyOf(joined.id, message.memberId), token)
            authenticate(socket, { roomId: joined.id, memberId: message.memberId, token })
            send(socket, { version: 1, type: 'joined', messageId: message.messageId, token, room: joined })
            return
          }
          if (message.type === 'resume') {
            const key = keyOf(message.roomId, message.memberId)
            if (message.roomId !== request.roomId || tokens.get(key) !== message.token) {
              throw new Error('resume token is invalid')
            }
            let resumed = requiredRoom(rooms, message.roomId)
            if (!resumed.members.some(member => member.id === message.memberId)) throw new Error('resume member is not in the room')
            if (!resumed.members.find(member => member.id === message.memberId)?.connected) {
              resumed = rooms.setConnected({
                roomId: message.roomId,
                memberId: message.memberId,
                expectedRevision: resumed.revision,
                connected: true,
              })
            }
            authenticate(socket, { roomId: message.roomId, memberId: message.memberId, token: message.token })
            send(socket, { version: 1, type: 'joined', messageId: message.messageId, token: message.token, room: resumed })
            resendPendingDecisions(socket, message.memberId)
            return
          }
          throw new Error('first message must join or resume')
        }
        if (currentSockets.get(keyOf(peer.roomId, peer.memberId)) !== socket) {
          throw new Error('authenticated socket has been replaced')
        }
        if (message.type === 'join' || message.type === 'resume') throw new Error('authenticated socket cannot repeat handshake')
        if (message.type === 'decision-response') {
          const pending = pendingDecisions.get(message.requestId)
          if (pending === undefined || pending.memberId !== peer.memberId || pending.stateVersion !== message.stateVersion) {
            throw new Error('decision response does not match an active request')
          }
          pendingDecisions.delete(message.requestId)
          pending.cleanup()
          pending.resolve(message.action)
          return
        }
        const updated = applyCommand(rooms, peer, message)
        send(socket, { version: 1, type: 'ack', messageId: message.messageId, room: updated })
      } catch (error: unknown) {
        sendError(socket, error, 'messageId' in message ? message.messageId : undefined)
      }
    })

    socket.on('close', () => {
      clearUnauthenticated(socket)
      lastPongs.delete(socket)
      const peer = peers.get(socket)
      peers.delete(socket)
      if (peer === undefined) return
      const key = keyOf(peer.roomId, peer.memberId)
      if (currentSockets.get(key) !== socket) return
      currentSockets.delete(key)
      const current = rooms.get(peer.roomId)
      const member = current?.members.find(candidate => candidate.id === peer.memberId)
      if (current !== undefined && member?.connected) {
        try {
          rooms.setConnected({
            roomId: peer.roomId,
            memberId: peer.memberId,
            expectedRevision: current.revision,
            connected: false,
          })
        } catch {
          // A concurrent room close or command already owns the authoritative edge.
        }
      }
    })
  })

  await listen(server, request.host, port)
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('lan-room-ws: listener did not expose an IP address')
  const heartbeat = setInterval(() => {
    const now = Date.now()
    for (const [address, attempt] of handshakeAttempts) {
      if (now - attempt.windowStartedAt >= 60_000) handshakeAttempts.delete(address)
    }
    for (const socket of sockets.clients) {
      if (socket.readyState !== WebSocket.OPEN) continue
      if (now - (lastPongs.get(socket) ?? 0) >= heartbeatTimeoutMs) {
        socket.terminate()
        continue
      }
      socket.ping()
    }
  }, heartbeatIntervalMs)
  heartbeat.unref()
  let closed = false
  return {
    host: request.host,
    port: address.port,
    requestDecision(memberId, decision, signal) {
      if (closed) return Promise.reject(new Error('LAN room listener is closed'))
      if (pendingDecisions.has(decision.requestId)) return Promise.reject(new Error(`decision ${JSON.stringify(decision.requestId)} is already pending`))
      const socket = currentSockets.get(keyOf(request.roomId, memberId))
      if (socket === undefined || socket.readyState !== WebSocket.OPEN) {
        return Promise.reject(new Error(`member ${JSON.stringify(memberId)} is not connected`))
      }
      return new Promise<JsonValue>((resolve, reject) => {
        const onAbort = () => {
          const pending = pendingDecisions.get(decision.requestId)
          if (pending?.reject !== reject) return
          pendingDecisions.delete(decision.requestId)
          reject(signal.reason instanceof Error ? signal.reason : new Error('decision aborted'))
        }
        signal.addEventListener('abort', onAbort, { once: true })
        pendingDecisions.set(decision.requestId, {
          memberId,
          stateVersion: decision.stateVersion,
          request: { version: 1, type: 'decision-request', ...decision },
          resolve,
          reject,
          cleanup: () => { signal.removeEventListener('abort', onAbort) },
        })
        send(socket, { version: 1, type: 'decision-request', ...decision })
        if (signal.aborted) onAbort()
      })
    },
    publishGameSnapshot(game) {
      if (closed) return
      for (const [socket, peer] of peers) {
        if (peer.roomId === request.roomId) send(socket, { version: 1, type: 'game-snapshot', game })
      }
    },
    publishPrivateGameSnapshot(memberId, game) {
      if (closed) return
      const socket = currentSockets.get(keyOf(request.roomId, memberId))
      if (socket !== undefined) send(socket, { version: 1, type: 'private-game-snapshot', game })
    },
    resumeTokens() {
      const prefix = `${request.roomId}\u0000`
      return Object.fromEntries([...tokens.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, token]) => [key.slice(prefix.length), token]))
    },
    async close() {
      if (closed) return
      closed = true
      clearInterval(heartbeat)
      off()
      for (const [requestId, pending] of pendingDecisions) {
        pendingDecisions.delete(requestId)
        pending.cleanup()
        pending.reject(new Error('LAN room listener closed during decision'))
      }
      for (const socket of sockets.clients) socket.terminate()
      for (const socket of unauthenticated.keys()) clearUnauthenticated(socket)
      await closeServer(sockets, server)
    },
  }
}

function positiveDuration(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`lan-room-ws: ${field} must be a positive integer`)
  return value
}

function applyCommand(rooms: LanRooms, peer: AuthenticatedPeer, message: LanRoomCommandMessage): LanRoomSnapshot {
  switch (message.type) {
    case 'update-prompt':
      return rooms.updatePrompt({
        roomId: peer.roomId,
        memberId: peer.memberId,
        expectedRevision: message.expectedRevision,
        promptHash: message.promptHash,
      })
    case 'set-ready':
      return rooms.setReady({
        roomId: peer.roomId,
        memberId: peer.memberId,
        expectedRevision: message.expectedRevision,
        ready: message.ready,
      })
    case 'leave':
      return rooms.leave({ roomId: peer.roomId, memberId: peer.memberId, expectedRevision: message.expectedRevision })
    default:
      message satisfies never
      throw new Error('unreachable LAN room command')
  }
}

function requiredRoom(rooms: LanRooms, roomId: LanRoomId): LanRoomSnapshot {
  const room = rooms.get(roomId)
  if (room === undefined) throw new LanRoomError(`room ${JSON.stringify(roomId)} does not exist`, 'LAN_ROOM_NOT_FOUND')
  return room
}

function listen(server: Server, host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => { reject(error) }
    server.once('error', onError)
    server.listen(port, host, () => {
      server.off('error', onError)
      resolve()
    })
  })
}

function closeServer(sockets: WebSocketServer, server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    sockets.close((socketError) => {
      if (socketError !== undefined) {
        reject(socketError)
        return
      }
      server.close((error) => {
        if (error === undefined) resolve()
        else reject(error)
      })
    })
  })
}

function frameText(raw: WebSocket.RawData): string {
  if (Array.isArray(raw)) return Buffer.concat(raw).toString('utf8')
  if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString('utf8')
  return raw.toString('utf8')
}
