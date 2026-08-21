import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import InvariantService from '@deepseek-ai/dsh-invariants'
import LanRooms, { LanMemberId } from '../../src/room/index.ts'
import * as LanRoomInvariant from '../../src/room/invariant.ts'

describe('LAN room invariants', () => {
  it('accepts coherent current and committed snapshots', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantService)
    await ctx.plugin(LanRooms)
    await ctx.plugin(LanRoomInvariant)
    const room = ctx.lanRooms.create({ coordinatorId: LanMemberId('coordinator') })
    expect(() => ctx.lanRooms.join({ code: room.code, memberId: LanMemberId('peer') })).not.toThrow()
    await ctx.fiber.dispose()
  })
})
