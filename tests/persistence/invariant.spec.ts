import { describe, expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import Storage from '@deepseek-ai/dsh-storage'
import { DomainFacility } from '@deepseek-ai/dsh-storage-domain'
import Invariants from '@deepseek-ai/dsh-invariants'
import { MemoryStorageBackend } from '../helpers/memory-backend.ts'
import LanGamePersistence from '../../src/persistence/index.ts'
import * as PersistenceInvariant from '../../src/persistence/invariant.ts'

describe('LAN game persistence invariant companion', () => {
  it('registers over an initialized empty durable service', async () => {
    const ctx = new Context()
    await ctx.plugin(Storage)
    ctx.storage.backend.register('memory', new MemoryStorageBackend())
    const domains = new DomainFacility(ctx, { backend: 'memory', routes: {} })
    ctx.storage.mount('domain', domains)
    ctx.provide('storageDomain', domains)
    await ctx.plugin(Invariants)
    const persistence = await ctx.plugin(LanGamePersistence)
    const invariant = await ctx.plugin(PersistenceInvariant)
    expect(ctx.lanGamePersistence.list()).toEqual([])
    await invariant.dispose()
    await persistence.dispose()
  })
})
