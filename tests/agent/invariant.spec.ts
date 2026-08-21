import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import InvariantService from '@deepseek-ai/dsh-invariants'
import type { LanGameAgentView } from '../../src/agent/types.ts'
import * as LanGameAgentInvariant from '../../src/agent/invariant.ts'

describe('LAN Game Session invariants', () => {
  it('accepts an empty bridge registry', async () => {
    const ctx = new Context()
    await ctx.plugin(InvariantService)
    const probe = {
      list: (): LanGameAgentView[] => [],
      onChanged: (_listener: () => void) => () => {},
    }
    await ctx.plugin({
      name: 'lan-game-agent-probe',
      apply(child: Context) { child.provide('lanGameAgents', probe) },
    })
    await expect(ctx.plugin(LanGameAgentInvariant)).resolves.toBeDefined()
    await ctx.fiber.dispose()
  })
})
