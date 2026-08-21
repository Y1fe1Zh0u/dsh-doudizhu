import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import { SessionId } from '@deepseek-ai/dsh-session'
import JsonlSessionPersistence from '@deepseek-ai/dsh-session-persistence-jsonl'
import SubagentService from '@deepseek-ai/dsh-subagent'
import * as SubagentSpawn from '@deepseek-ai/dsh-subagent-spawn-in-process'
import * as ToolSubagentReport from '@deepseek-ai/dsh-tool-subagent-report'
import { MockAdapter, textResponse, toolCallResponse } from '../helpers/mock-adapter.ts'
import LanGameAgents, { LAN_GAME_ACTION_TOOL, LanGameAgentError } from '../../src/agent/index.ts'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

async function setup(script: ConstructorParameters<typeof MockAdapter>[0], existingRoot?: string) {
  const ctx = new Context()
  await mountAgentLoopTestDependencies(ctx)
  const storageRoot = existingRoot ?? mkdtempSync(join(tmpdir(), 'dsh-lan-game-agent-'))
  if (existingRoot === undefined) roots.push(storageRoot)
  await ctx.plugin(JsonlSessionPersistence, { root: storageRoot })
  await ctx.plugin(AgentLoop, { agents: [] })
  await ctx.plugin(SubagentService)
  await ctx.plugin(SubagentSpawn, { providerName: 'spawn' })
  await ctx.plugin(ToolSubagentReport)
  await ctx.plugin(LanGameAgents)
  const adapter = new MockAdapter(script, {
    efforts: [
      { id: ReasoningEffortId('off'), name: 'Off' },
      { id: ReasoningEffortId('low'), name: 'Low' },
      { id: ReasoningEffortId('high'), name: 'High' },
    ],
    defaultEffort: ReasoningEffortId('high'),
  })
  ctx.llm.registerAdapter(['mock'], adapter)
  const parent = ctx.agentLoop.create(SessionId('foreground'), { provider: 'mock', model: 'mock' })
  return { ctx, parent, adapter, storageRoot }
}

describe('LanGameAgents', () => {
  it('creates a hidden continuable child and accepts one correlated action tool call', async () => {
    const { ctx, parent, adapter } = await setup([
      textResponse('READY'),
      toolCallResponse('move-1', LAN_GAME_ACTION_TOOL, {
        requestId: 'turn-1',
        stateVersion: 7,
        action: { type: 'play', cards: ['3'] },
      }),
      toolCallResponse('move-2', LAN_GAME_ACTION_TOOL, {
        requestId: 'turn-2',
        stateVersion: 8,
        action: { type: 'pass' },
      }),
    ])
    const child = await ctx.lanGameAgents.create({
      parent,
      strategyPrompt: 'Prefer short combinations and preserve bombs.',
      signal: new AbortController().signal,
    })
    expect(child.parentSessionId).toBe(parent.id)
    expect(child.promptHash).toMatch(/^[0-9a-f]{64}$/u)

    const decision = await ctx.lanGameAgents.decide({
      parent,
      childId: child.childId,
      requestId: 'turn-1',
      stateVersion: 7,
      state: { legalActions: [{ type: 'play', cards: ['3'] }] },
      signal: new AbortController().signal,
    })
    expect(decision).toEqual({ requestId: 'turn-1', stateVersion: 7, action: { type: 'play', cards: ['3'] } })
    await expect.poll(() => adapter.requests.length).toBe(2)
    expect(adapter.requests[0]?.system).toContain('Prefer short combinations')
    expect(adapter.requests[0]?.system).not.toContain('software engineer')
    expect(adapter.requests[0]?.maxTokens).toBe(256)
    expect(adapter.requests[0]?.reasoningEffort).toBe('off')
    expect(adapter.requests[1]?.maxTokens).toBe(2_048)
    expect(adapter.requests[1]?.reasoningEffort).toBe('low')
    expect(adapter.requests[1]?.tools?.map(tool => tool.name)).toEqual([LAN_GAME_ACTION_TOOL])
    expect(JSON.stringify(adapter.requests[1]?.messages)).toContain('turn-1')
    await expect.poll(() => ctx.agents.get(child.childId)).toBeUndefined()

    const next = await ctx.lanGameAgents.decide({
      parent,
      childId: child.childId,
      requestId: 'turn-2',
      stateVersion: 8,
      state: {
        history: [{ seat: 1, combination: { kind: 'single', cards: ['3'] } }],
        legalActions: [{ type: 'pass' }],
      },
      signal: new AbortController().signal,
    })
    expect(next.action).toEqual({ type: 'pass' })
    await expect.poll(() => adapter.requests.length).toBe(3)
    const nextMessages = JSON.stringify(adapter.requests[2]?.messages)
    expect(nextMessages).toContain('turn-2')
    expect(nextMessages).toContain('complete public action history')
    expect(nextMessages).not.toContain('turn-1')
    expect(nextMessages).not.toContain('Action accepted')
    expect(ctx.lanGameAgents.list()[0]?.pendingRequestId).toBeUndefined()
    await ctx.fiber.dispose()
  })

  it('rejects generic coordinator probes while still cold-resuming exact game decisions', async () => {
    const { ctx, parent, adapter } = await setup([textResponse('READY')])
    const child = await ctx.lanGameAgents.create({
      parent,
      strategyPrompt: 'Play legally.',
      signal: new AbortController().signal,
    })
    await expect.poll(() => adapter.requests.length).toBe(1)
    await expect.poll(() => ctx.agents.get(child.childId)).toBeUndefined()

    await ctx.subagents.followup(parent, child.childId, [{ type: 'text', text: 'Report your current task status.' }], {
      source: { kind: 'coordinator', form: 'relay', senderSessionId: parent.id },
      signal: new AbortController().signal,
    })
    await expect.poll(() => ctx.agents.get(child.childId)).toBeUndefined()
    expect(adapter.requests).toHaveLength(1)
    await ctx.fiber.dispose()
  })

  it('rejects duplicate decisions, parent mismatch, invalid prompts, and removed children', async () => {
    const { ctx, parent } = await setup([textResponse('READY'), 'hang'])
    await expect(ctx.lanGameAgents.create({
      parent,
      strategyPrompt: '   ',
      signal: new AbortController().signal,
    })).rejects.toThrow(expect.objectContaining<Partial<LanGameAgentError>>({ code: 'LAN_GAME_INVALID_ARGUMENT' }))
    const child = await ctx.lanGameAgents.create({
      parent,
      strategyPrompt: 'Play legally.',
      signal: new AbortController().signal,
    })
    const controller = new AbortController()
    const pending = ctx.lanGameAgents.decide({
      parent,
      childId: child.childId,
      requestId: 'turn-pending',
      stateVersion: 1,
      state: {},
      signal: controller.signal,
    })
    await expect(ctx.lanGameAgents.decide({
      parent,
      childId: child.childId,
      requestId: 'turn-second',
      stateVersion: 1,
      state: {},
      signal: new AbortController().signal,
    })).rejects.toThrow(expect.objectContaining<Partial<LanGameAgentError>>({ code: 'LAN_GAME_DECISION_PENDING' }))
    controller.abort()
    await expect(pending).rejects.toThrow()
    ctx.lanGameAgents.remove(parent, child.childId)
    expect(() => { ctx.lanGameAgents.remove(parent, child.childId) })
      .toThrow(expect.objectContaining<Partial<LanGameAgentError>>({ code: 'LAN_GAME_NOT_FOUND' }))
    await ctx.fiber.dispose()
  })

  it('reattaches the original durable child with its locked Prompt after restart', async () => {
    const prompt = 'Keep the locked recovery strategy.'
    const first = await setup([textResponse('READY')])
    const child = await first.ctx.lanGameAgents.create({
      parent: first.parent,
      strategyPrompt: prompt,
      signal: new AbortController().signal,
    })
    await expect.poll(() => first.adapter.requests.length).toBe(1)
    await first.ctx.fiber.dispose()

    const second = await setup([
      toolCallResponse('restored-move', LAN_GAME_ACTION_TOOL, {
        requestId: 'restored-turn',
        stateVersion: 4,
        action: { type: 'pass' },
      }),
    ], first.storageRoot)
    expect(() => second.ctx.lanGameAgents.restore({
      parent: second.parent,
      childId: child.childId,
      strategyPrompt: 'Changed after lock.',
      promptHash: child.promptHash,
    })).toThrow(/does not match/u)
    const restored = second.ctx.lanGameAgents.restore({
      parent: second.parent,
      childId: child.childId,
      strategyPrompt: prompt,
      promptHash: child.promptHash,
    })
    expect(restored.childId).toBe(child.childId)

    await expect(second.ctx.lanGameAgents.decide({
      parent: second.parent,
      childId: restored.childId,
      requestId: 'restored-turn',
      stateVersion: 4,
      state: { legalActions: [{ type: 'pass' }] },
      signal: new AbortController().signal,
    })).resolves.toMatchObject({ action: { type: 'pass' } })
    expect(second.adapter.requests[0]?.system).toContain(prompt)
    expect(second.adapter.requests[0]?.system).not.toContain('Changed after lock.')
    await second.ctx.fiber.dispose()
  })
})
