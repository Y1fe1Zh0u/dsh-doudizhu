import { describe, expect, it } from 'vitest'
import { LanMemberId, LanRoomCode, LanRoomId } from '../../src/room/types.ts'
import { LanRoom, validateLanRoomSnapshot } from '../../src/room/room.ts'
import { LanRoomError } from '../../src/room/error.ts'

const COORDINATOR = LanMemberId('member-a')
const MEMBER_B = LanMemberId('member-b')
const MEMBER_C = LanMemberId('member-c')
const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)
const HASH_C = 'c'.repeat(64)

function room(): LanRoom {
  return new LanRoom(LanRoomId('room-1'), LanRoomCode('123456'), COORDINATOR, 3)
}

function fullLobby(): LanRoom {
  const value = room()
  value.join(MEMBER_B)
  value.join(MEMBER_C)
  return value
}

function lock(value: LanRoom): void {
  value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 2, promptHash: HASH_A })
  value.updatePrompt({ roomId: value.id, memberId: MEMBER_B, expectedRevision: 3, promptHash: HASH_B })
  value.updatePrompt({ roomId: value.id, memberId: MEMBER_C, expectedRevision: 4, promptHash: HASH_C })
  value.setReady({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 5, ready: true })
  value.setReady({ roomId: value.id, memberId: MEMBER_B, expectedRevision: 6, ready: true })
  value.setReady({ roomId: value.id, memberId: MEMBER_C, expectedRevision: 7, ready: true })
}

describe('LanRoom', () => {
  it('assigns stable seats and returns detached snapshots', () => {
    const value = fullLobby()
    const first = value.snapshot()
    expect(first.members.map(member => [member.id, member.seat])).toEqual([
      [COORDINATOR, 0],
      [MEMBER_B, 1],
      [MEMBER_C, 2],
    ])
    ;(first.members[0] as { connected: boolean }).connected = false
    expect(value.snapshot().members[0]?.connected).toBe(true)
    expect(validateLanRoomSnapshot(value.snapshot())).toEqual([])
  })

  it('locks only after a full roster has prompt hashes and readiness', () => {
    const value = fullLobby()
    expect(() => value.setReady({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 2, ready: true }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_PROMPT_REQUIRED' }))
    lock(value)
    const snapshot = value.snapshot()
    expect(snapshot.phase).toBe('locked')
    expect(snapshot.revision).toBe(8)
    expect(snapshot.members.every(member => member.ready)).toBe(true)
    expect(validateLanRoomSnapshot(snapshot)).toEqual([])
  })

  it('clears readiness when a prompt changes', () => {
    const value = fullLobby()
    value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 2, promptHash: HASH_A })
    value.setReady({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 3, ready: true })
    const changed = value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 4, promptHash: HASH_B })
    expect(changed.members[0]).toMatchObject({ promptHash: HASH_B, ready: false })
  })

  it('clears lobby readiness on disconnect and refuses disconnected readiness', () => {
    const value = fullLobby()
    value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 2, promptHash: HASH_A })
    value.setReady({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 3, ready: true })
    const disconnected = value.setConnected({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 4, connected: false })
    expect(disconnected.members[0]).toMatchObject({ connected: false, ready: false })
    expect(() => value.setReady({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 5, ready: true }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_INVALID_ARGUMENT' }))
  })

  it('uses compare-and-set revisions and rejects post-lock edits', () => {
    const value = fullLobby()
    expect(() => value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 1, promptHash: HASH_A }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_STALE_REVISION' }))
    lock(value)
    expect(() => value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 8, promptHash: HASH_B }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_INVALID_PHASE' }))
  })

  it('reserves start and finish for the coordinator', () => {
    const value = fullLobby()
    lock(value)
    expect(() => value.start({ roomId: value.id, coordinatorId: MEMBER_B, expectedRevision: 8 }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_NOT_COORDINATOR' }))
    const running = value.start({ roomId: value.id, coordinatorId: COORDINATOR, expectedRevision: 8 })
    expect(running.phase).toBe('running')
    const finished = value.finish({ roomId: value.id, coordinatorId: COORDINATOR, expectedRevision: 9, result: 'seat-2-won' })
    expect(finished).toMatchObject({ phase: 'finished', result: 'seat-2-won', revision: 10 })
    expect(validateLanRoomSnapshot(finished)).toEqual([])
  })

  it('compacts lobby seats after a member leaves', () => {
    const value = fullLobby()
    const snapshot = value.leave(MEMBER_B, 2)
    expect(snapshot.members.map(member => [member.id, member.seat])).toEqual([
      [COORDINATOR, 0],
      [MEMBER_C, 1],
    ])
    expect(() => value.leave(COORDINATOR, 3))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_NOT_COORDINATOR' }))
  })

  it('rejects invalid hashes, duplicate members, and over-capacity joins', () => {
    const value = fullLobby()
    expect(() => value.updatePrompt({ roomId: value.id, memberId: COORDINATOR, expectedRevision: 2, promptHash: 'bad' }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_INVALID_ARGUMENT' }))
    expect(() => value.join(MEMBER_B))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_MEMBER_EXISTS' }))
    expect(() => value.join(LanMemberId('member-d')))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_FULL' }))
  })
})
