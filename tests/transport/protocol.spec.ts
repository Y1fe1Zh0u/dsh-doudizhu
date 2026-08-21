import { describe, expect, it } from 'vitest'
import { parseLanRoomClientMessage, parseLanRoomServerMessage } from '../../src/transport/protocol.ts'

describe('LAN room wire parser', () => {
  it('parses each supported client message into a detached value', () => {
    expect(parseLanRoomClientMessage(JSON.stringify({
      version: 1,
      type: 'join',
      messageId: 'join-1',
      code: '123456',
      memberId: 'peer-a',
    }))).toEqual({ version: 1, type: 'join', messageId: 'join-1', code: '123456', memberId: 'peer-a' })
    expect(parseLanRoomClientMessage(JSON.stringify({
      version: 1,
      type: 'update-prompt',
      messageId: 'prompt-1',
      expectedRevision: 2,
      promptHash: 'a'.repeat(64),
    }))).toMatchObject({ type: 'update-prompt', expectedRevision: 2, promptHash: 'a'.repeat(64) })
    expect(parseLanRoomClientMessage(JSON.stringify({
      version: 1,
      type: 'set-ready',
      messageId: 'ready-1',
      expectedRevision: 3,
      ready: true,
    }))).toMatchObject({ type: 'set-ready', ready: true })
    expect(parseLanRoomClientMessage(JSON.stringify({
      version: 1,
      type: 'resume',
      messageId: 'resume-1',
      roomId: 'room-1',
      memberId: 'peer-a',
      token: 'a'.repeat(64),
    }))).toMatchObject({ type: 'resume', roomId: 'room-1', token: 'a'.repeat(64) })
    expect(parseLanRoomClientMessage(JSON.stringify({
      version: 1,
      type: 'decision-response',
      requestId: 'decision-1',
      stateVersion: 4,
      action: { type: 'pass' },
    }))).toMatchObject({ type: 'decision-response', requestId: 'decision-1', stateVersion: 4 })
  })

  it.each([
    ['not-json', /valid JSON/],
    [JSON.stringify({ version: 2, type: 'join' }), /supported version/],
    [JSON.stringify({ version: 1, type: 'join', messageId: 'x', code: '123', memberId: 'peer' }), /six digits|6 digits/],
    [JSON.stringify({ version: 1, type: 'resume', messageId: 'x', roomId: 'r', memberId: 'm', token: 'ABC' }), /lowercase hexadecimal/],
    [JSON.stringify({ version: 1, type: 'set-ready', messageId: 'x', expectedRevision: -1, ready: true }), /non-negative/],
    [JSON.stringify({ version: 1, type: 'unknown', messageId: 'x' }), /unsupported message type/],
  ])('rejects malformed frames', (input, message) => {
    expect(() => parseLanRoomClientMessage(input)).toThrow(message)
  })
})

describe('LAN room server wire parser', () => {
  const room = {
    id: 'lan-room-one',
    code: '123456',
    revision: 2,
    phase: 'lobby',
    coordinatorId: 'host',
    maxMembers: 3,
    members: [{ id: 'host', seat: 0, ready: false, connected: true }],
  }

  it('validates acknowledgements, snapshots, closure, and coded errors', () => {
    expect(parseLanRoomServerMessage(JSON.stringify({ version: 1, type: 'ack', messageId: 'a', room })))
      .toMatchObject({ type: 'ack', room: { code: '123456' } })
    expect(parseLanRoomServerMessage(JSON.stringify({ version: 1, type: 'snapshot', room })))
      .toMatchObject({ type: 'snapshot', room: { revision: 2 } })
    expect(parseLanRoomServerMessage(JSON.stringify({ version: 1, type: 'room-closed', roomId: room.id })))
      .toEqual({ version: 1, type: 'room-closed', roomId: room.id })
    expect(parseLanRoomServerMessage(JSON.stringify({
      version: 1,
      type: 'error',
      messageId: 'a',
      code: 'LAN_ROOM_STALE_REVISION',
      message: 'stale',
      room,
    }))).toMatchObject({ type: 'error', code: 'LAN_ROOM_STALE_REVISION', room: { id: room.id } })
    expect(parseLanRoomServerMessage(JSON.stringify({
      version: 1,
      type: 'decision-request',
      requestId: 'decision-1',
      stateVersion: 4,
      state: { legal: ['pass'] },
    }))).toMatchObject({ type: 'decision-request', requestId: 'decision-1', stateVersion: 4 })
  })

  it.each([
    [{ version: 1, type: 'ack', messageId: 'a' }, /room must be/u],
    [{ version: 1, type: 'snapshot', room: { ...room, phase: 'unknown' } }, /phase/u],
    [{ version: 1, type: 'snapshot', room: { ...room, members: [{ ...room.members[0], seat: 4 }] } }, /invalid seat/u],
    [{ version: 1, type: 'error', code: 'UNKNOWN', message: 'no' }, /unsupported error code/u],
  ])('rejects malformed coordinator frames', (message, expected) => {
    expect(() => parseLanRoomServerMessage(JSON.stringify(message))).toThrow(expected)
  })
})
