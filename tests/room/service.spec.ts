import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LanRooms, { LanMemberId, LanRoomCode } from '../../src/room/index.ts'
import { LanRoomError } from '../../src/room/error.ts'

async function setup(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(LanRooms)
  return ctx
}

describe('LanRooms', () => {
  it('creates, discovers, mutates, and closes a room through detached values', async () => {
    const ctx = await setup()
    const coordinatorId = LanMemberId('coordinator')
    const created = ctx.lanRooms.create({ coordinatorId })
    expect(created).toMatchObject({ revision: 0, phase: 'lobby', maxMembers: 3, coordinatorId })
    expect(created.code).toMatch(/^\d{6}$/u)

    const changes: string[] = []
    const off = ctx.lanRooms.onChanged(({ kind, room }) => { changes.push(`${kind}:${room.revision}`) })
    const joined = ctx.lanRooms.join({ code: created.code, memberId: LanMemberId('peer') })
    expect(joined.revision).toBe(1)
    expect(ctx.lanRooms.get(created.id)?.members).toHaveLength(2)
    expect(ctx.lanRooms.list()).toHaveLength(1)
    ctx.lanRooms.close(created.id, coordinatorId)
    expect(changes).toEqual(['updated:1', 'removed:1'])
    off()
    expect(ctx.lanRooms.get(created.id)).toBeUndefined()
    expect(() => ctx.lanRooms.join({ code: created.code, memberId: LanMemberId('late') }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_CODE_NOT_FOUND' }))
    await ctx.fiber.dispose()
  })

  it('rejects malformed identities, unknown rooms, and foreign close attempts', async () => {
    const ctx = await setup()
    expect(() => ctx.lanRooms.create({ coordinatorId: LanMemberId('') }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_INVALID_ARGUMENT' }))
    const created = ctx.lanRooms.create({ coordinatorId: LanMemberId('coordinator') })
    expect(() => ctx.lanRooms.join({ code: LanRoomCode('000000'), memberId: LanMemberId('peer') }))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_CODE_NOT_FOUND' }))
    expect(() => { ctx.lanRooms.close(created.id, LanMemberId('peer')) })
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_NOT_COORDINATOR' }))
    await ctx.fiber.dispose()
  })

  it('restores an exact durable revision without replaying room commands', async () => {
    const first = await setup()
    const coordinatorId = LanMemberId('coordinator')
    const created = first.lanRooms.create({ coordinatorId })
    const joined = first.lanRooms.join({ code: created.code, memberId: LanMemberId('peer') })
    await first.fiber.dispose()

    const restoredContext = await setup()
    const restored = restoredContext.lanRooms.restore(joined)
    expect(restored).toEqual(joined)
    expect(restoredContext.lanRooms.get(joined.id)).toEqual(joined)
    expect(() => restoredContext.lanRooms.restore(joined))
      .toThrow(expect.objectContaining<Partial<LanRoomError>>({ code: 'LAN_ROOM_INVALID_ARGUMENT' }))
    const next = restoredContext.lanRooms.join({ code: restored.code, memberId: LanMemberId('peer-2') })
    expect(next.revision).toBe(joined.revision + 1)
    await restoredContext.fiber.dispose()
  })
})
