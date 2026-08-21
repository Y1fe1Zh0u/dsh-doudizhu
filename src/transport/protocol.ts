/** Versioned JSON messages accepted by the restricted LAN room WebSocket. */

import {
  LanMemberId,
  LanRoomCode,
  LanRoomId,
  validateLanRoomSnapshot,
  type LanRoomErrorCode,
  type LanRoomSnapshot,
} from '../room/index.ts'
import type { JsonValue } from '@deepseek-ai/dsh-session/types'

/** Initial trusted-LAN room wire version. */
export const LAN_ROOM_WIRE_VERSION = 1

/** Client message accepted before a socket has a room identity. */
export type LanRoomHandshakeMessage =
  | { version: 1; type: 'join'; messageId: string; code: LanRoomCode; memberId: LanMemberId }
  | { version: 1; type: 'resume'; messageId: string; roomId: LanRoomId; memberId: LanMemberId; token: string }

/** Authenticated room mutation sent by one participant. */
export type LanRoomCommandMessage =
  | { version: 1; type: 'update-prompt'; messageId: string; expectedRevision: number; promptHash: string }
  | { version: 1; type: 'set-ready'; messageId: string; expectedRevision: number; ready: boolean }
  | { version: 1; type: 'leave'; messageId: string; expectedRevision: number }

/** Hidden Game Session decision returned to the coordinator. */
export interface LanRoomDecisionResponseMessage {
  readonly version: 1
  readonly type: 'decision-response'
  readonly requestId: string
  readonly stateVersion: number
  readonly action: JsonValue
}

/** Every client-to-coordinator message. */
export type LanRoomClientMessage = LanRoomHandshakeMessage | LanRoomCommandMessage | LanRoomDecisionResponseMessage

/** Private decision request sent only to its addressed member. */
export interface LanRoomDecisionRequestMessage {
  readonly version: 1
  readonly type: 'decision-request'
  readonly requestId: string
  readonly stateVersion: number
  readonly state: JsonValue
}

/** Public game snapshot broadcast to all three local browser projections. */
export interface LanRoomGameSnapshotMessage {
  readonly version: 1
  readonly type: 'game-snapshot'
  readonly game: JsonValue
}

/** Seat-private browser snapshot sent only to its addressed Host peer. */
export interface LanRoomPrivateGameSnapshotMessage {
  readonly version: 1
  readonly type: 'private-game-snapshot'
  readonly game: JsonValue
}

/** Every coordinator-to-client message. */
export type LanRoomServerMessage =
  | { version: 1; type: 'joined'; messageId: string; token: string; room: LanRoomSnapshot }
  | { version: 1; type: 'ack'; messageId: string; room: LanRoomSnapshot }
  | { version: 1; type: 'snapshot'; room: LanRoomSnapshot }
  | { version: 1; type: 'room-closed'; roomId: LanRoomId }
  | LanRoomDecisionRequestMessage
  | LanRoomGameSnapshotMessage
  | LanRoomPrivateGameSnapshotMessage
  | {
    version: 1
    type: 'error'
    messageId?: string
    code: LanRoomErrorCode | 'LAN_ROOM_WIRE_INVALID'
    message: string
    room?: LanRoomSnapshot
  }

/**
 * Parse and validate one complete client text frame.
 * @param text - UTF-8 JSON text from one WebSocket frame.
 * @returns detached supported client message.
 */
export function parseLanRoomClientMessage(text: string): LanRoomClientMessage {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('message must be valid JSON')
  }
  if (!record(value) || value.version !== LAN_ROOM_WIRE_VERSION || typeof value.type !== 'string') {
    throw new Error('message must contain supported version and type fields')
  }
  switch (value.type) {
    case 'join': {
      const messageId = requiredString(value.messageId, 'messageId', 128)
      return {
        version: 1,
        type: 'join',
        messageId,
        code: LanRoomCode(exactDigits(value.code, 'code', 6)),
        memberId: LanMemberId(requiredString(value.memberId, 'memberId', 128)),
      }
    }
    case 'resume': {
      const messageId = requiredString(value.messageId, 'messageId', 128)
      return {
        version: 1,
        type: 'resume',
        messageId,
        roomId: LanRoomId(requiredString(value.roomId, 'roomId', 256)),
        memberId: LanMemberId(requiredString(value.memberId, 'memberId', 128)),
        token: exactHex(value.token, 'token', 64),
      }
    }
    case 'update-prompt': {
      const messageId = requiredString(value.messageId, 'messageId', 128)
      return {
        version: 1,
        type: 'update-prompt',
        messageId,
        expectedRevision: revision(value.expectedRevision),
        promptHash: exactHex(value.promptHash, 'promptHash', 64),
      }
    }
    case 'set-ready':
      if (typeof value.ready !== 'boolean') throw new Error('ready must be boolean')
      return {
        version: 1,
        type: 'set-ready',
        messageId: requiredString(value.messageId, 'messageId', 128),
        expectedRevision: revision(value.expectedRevision),
        ready: value.ready,
      }
    case 'leave':
      return {
        version: 1,
        type: 'leave',
        messageId: requiredString(value.messageId, 'messageId', 128),
        expectedRevision: revision(value.expectedRevision),
      }
    case 'decision-response':
      return {
        version: 1,
        type: 'decision-response',
        requestId: requiredString(value.requestId, 'requestId', 128),
        stateVersion: revision(value.stateVersion, 'stateVersion'),
        action: jsonValue(value.action, 'action'),
      }
    default:
      throw new Error(`unsupported message type ${JSON.stringify(value.type)}`)
  }
}

/**
 * Parse and validate one complete coordinator text frame.
 * @param text - UTF-8 JSON text from one WebSocket frame.
 * @returns detached supported server message.
 */
export function parseLanRoomServerMessage(text: string): LanRoomServerMessage {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('message must be valid JSON')
  }
  if (!record(value) || value.version !== LAN_ROOM_WIRE_VERSION || typeof value.type !== 'string') {
    throw new Error('message must contain supported version and type fields')
  }
  switch (value.type) {
    case 'joined':
      return {
        version: 1,
        type: 'joined',
        messageId: requiredString(value.messageId, 'messageId', 128),
        token: exactHex(value.token, 'token', 64),
        room: roomSnapshot(value.room),
      }
    case 'ack':
      return {
        version: 1,
        type: 'ack',
        messageId: requiredString(value.messageId, 'messageId', 128),
        room: roomSnapshot(value.room),
      }
    case 'snapshot':
      return { version: 1, type: 'snapshot', room: roomSnapshot(value.room) }
    case 'room-closed':
      return { version: 1, type: 'room-closed', roomId: LanRoomId(requiredString(value.roomId, 'roomId', 256)) }
    case 'decision-request':
      return {
        version: 1,
        type: 'decision-request',
        requestId: requiredString(value.requestId, 'requestId', 128),
        stateVersion: revision(value.stateVersion, 'stateVersion'),
        state: jsonValue(value.state, 'state'),
      }
    case 'game-snapshot':
      return { version: 1, type: 'game-snapshot', game: jsonValue(value.game, 'game') }
    case 'private-game-snapshot':
      return { version: 1, type: 'private-game-snapshot', game: jsonValue(value.game, 'game') }
    case 'error': {
      const code = requiredString(value.code, 'code', 128)
      if (!SERVER_ERROR_CODES.has(code)) throw new Error(`unsupported error code ${JSON.stringify(code)}`)
      return {
        version: 1,
        type: 'error',
        code: code as Extract<LanRoomServerMessage, { type: 'error' }>['code'],
        message: requiredString(value.message, 'message', 4_096),
        ...value.messageId === undefined ? {} : { messageId: requiredString(value.messageId, 'messageId', 128) },
        ...value.room === undefined ? {} : { room: roomSnapshot(value.room) },
      }
    }
    default:
      throw new Error(`unsupported message type ${JSON.stringify(value.type)}`)
  }
}

const SERVER_ERROR_CODES = new Set<string>([
  'LAN_ROOM_INVALID_ARGUMENT',
  'LAN_ROOM_NOT_FOUND',
  'LAN_ROOM_CODE_NOT_FOUND',
  'LAN_ROOM_MEMBER_EXISTS',
  'LAN_ROOM_MEMBER_NOT_FOUND',
  'LAN_ROOM_FULL',
  'LAN_ROOM_STALE_REVISION',
  'LAN_ROOM_INVALID_PHASE',
  'LAN_ROOM_PROMPT_REQUIRED',
  'LAN_ROOM_NOT_COORDINATOR',
  'LAN_ROOM_WIRE_INVALID',
])

function roomSnapshot(value: unknown): LanRoomSnapshot {
  if (!record(value) || !Array.isArray(value.members)) throw new Error('room must be an object with a members array')
  if (!ROOM_PHASES.has(String(value.phase))) throw new Error('room phase is unsupported')
  const members = value.members.map((member, index) => {
    if (!record(member)) throw new Error(`room member ${index} must be an object`)
    if (typeof member.ready !== 'boolean' || typeof member.connected !== 'boolean') {
      throw new Error(`room member ${index} must contain boolean ready and connected fields`)
    }
    return {
      id: LanMemberId(requiredString(member.id, `members[${index}].id`, 128)),
      seat: revision(member.seat, `members[${index}].seat`),
      ready: member.ready,
      connected: member.connected,
      ...member.promptHash === undefined ? {} : { promptHash: exactHex(member.promptHash, `members[${index}].promptHash`, 64) },
    }
  })
  const snapshot: LanRoomSnapshot = {
    id: LanRoomId(requiredString(value.id, 'room.id', 256)),
    code: LanRoomCode(exactDigits(value.code, 'room.code', 6)),
    revision: revision(value.revision),
    phase: value.phase as LanRoomSnapshot['phase'],
    coordinatorId: LanMemberId(requiredString(value.coordinatorId, 'room.coordinatorId', 128)),
    maxMembers: positiveInteger(value.maxMembers, 'room.maxMembers'),
    members,
    ...value.result === undefined ? {} : { result: requiredString(value.result, 'room.result', 4_096) },
  }
  const failures = validateLanRoomSnapshot(snapshot)
  if (failures.length > 0) throw new Error(`room snapshot is invalid: ${failures.join('; ')}`)
  return snapshot
}

const ROOM_PHASES = new Set(['lobby', 'locked', 'running', 'finished'])

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength || value.trim() !== value) {
    throw new Error(`${field} must contain 1 to ${maxLength} characters with no surrounding whitespace`)
  }
  return value
}

function exactDigits(value: unknown, field: string, length: number): string {
  if (typeof value !== 'string' || value.length !== length || !/^\d+$/u.test(value)) {
    throw new Error(`${field} must contain exactly ${length} digits`)
  }
  return value
}

function exactHex(value: unknown, field: string, length: number): string {
  if (typeof value !== 'string' || value.length !== length || !/^[0-9a-f]+$/u.test(value)) {
    throw new Error(`${field} must contain exactly ${length} lowercase hexadecimal characters`)
  }
  return value
}

function revision(value: unknown, field = 'expectedRevision'): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${field} must be a non-negative safe integer`)
  return value as number
}

function positiveInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1) throw new Error(`${field} must be a positive safe integer`)
  return value as number
}

function jsonValue(value: unknown, field: string): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (Array.isArray(value)) return value.map((item, index) => jsonValue(item, `${field}[${index}]`))
  if (record(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsonValue(item, `${field}.${key}`)]))
  }
  throw new Error(`${field} must be a JSON value`)
}
