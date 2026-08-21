import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import { MemoryMediaPool, MemoryStorageBackend } from '../helpers/memory-backend.ts'
import LanGamePersistence from '../../src/persistence/index.ts'
import { LATER, fixtureBinding, fixtureRecord } from './fixtures.ts'

async function harness(pool = new MemoryMediaPool()) {
  const ctx = new Context()
  await ctx.plugin(Storage)
  ctx.storage.backend.register('memory', new MemoryStorageBackend(pool))
  const domains = new DomainFacility(ctx, { backend: 'memory', routes: {} })
  ctx.storage.mount('domain', domains)
  ctx.provide('storageDomain', domains)
  const fiber = await ctx.plugin(LanGamePersistence)
  return { ctx, fiber, pool, service: ctx.lanGamePersistence }
}

describe('LanGamePersistence', () => {
  it('creates, snapshots, lists, and survives a domain close/reopen', async () => {
    const first = await harness()
    const created = await first.service.create(fixtureRecord())
    created.room.members[0]!.connected = false
    expect(first.service.get('room-1')?.room.members[0]?.connected).toBe(true)
    expect(first.service.list().map(record => record.room.id)).toEqual(['room-1'])
    await first.fiber.dispose()

    const second = await harness(first.pool)
    expect(second.service.get('room-1')?.checkpoint.state.version).toBe(1)
    await second.fiber.dispose()
  })

  it('applies record/checkpoint CAS atomically and advances recordRevision once', async () => {
    const { fiber, service } = await harness()
    await service.create(fixtureRecord())
    const updated = await service.update('room-1', {
      expectedRecordRevision: 0,
      expectedCheckpointStateVersion: 1,
    }, current => ({ ...current, updatedAt: LATER }))
    expect(updated.recordRevision).toBe(1)
    expect(updated.updatedAt).toBe(LATER)

    await expect(service.update('room-1', {
      expectedRecordRevision: 0,
      expectedCheckpointStateVersion: 1,
    }, current => current)).rejects.toMatchObject({ code: 'LAN_GAME_STALE_REVISION' })
    await expect(service.update('room-1', {
      expectedRecordRevision: 1,
      expectedCheckpointStateVersion: 0,
    }, current => current)).rejects.toMatchObject({ code: 'LAN_GAME_STALE_REVISION' })
    expect(service.get('room-1')?.recordRevision).toBe(1)
    await fiber.dispose()
  })

  it('archives by clearing prompts, tokens, and pending decisions while retaining hashes and provenance', async () => {
    const { fiber, service } = await harness()
    await service.create(fixtureRecord())
    await service.putBinding(fixtureBinding())
    const archived = await service.archive('room-1', {
      expectedRecordRevision: 0,
      expectedCheckpointStateVersion: 1,
    }, LATER)

    expect(archived.closedAt).toBe(LATER)
    expect(archived.pendingDecision).toBeUndefined()
    expect(archived.room.members.every(member => member.resumeToken === undefined)).toBe(true)
    expect(archived.room.members.map(member => member.promptHash)).toEqual(['hash-0', 'hash-1', 'hash-2'])
    expect(archived.checkpoint.decisionOutcomes).toEqual([
      { historyIndex: 0, afterStateVersion: 1, seat: 0, source: 'agent' },
    ])
    expect(archived.events.at(-1)?.type).toBe('room-closed')
    expect(service.getBinding('room-1')).toMatchObject({ state: 'archived', promptHash: 'hash-0' })
    expect(service.getBinding('room-1')?.strategyPrompt).toBeUndefined()
    expect(service.getBinding('room-1')?.resumeToken).toBeUndefined()
    await fiber.dispose()
  })
})
