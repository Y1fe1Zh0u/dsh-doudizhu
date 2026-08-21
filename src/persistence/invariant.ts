/** Invariant companion for LAN game persistence. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import { validateMatchRecord } from './replay.ts'

const PACKAGE_NAME = 'dsh-doudizhu/persistence'

/** Cordis companion plugin name. */
export const name = 'lan-game-persistence-invariant'
/** Invariant registry required before package checks can install. */
export const inject = ['invariants']

/** Validate every durable match and the local binding key relationship at companion startup. */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  for (const record of ctx.lanGamePersistence.list()) {
    for (const message of validateMatchRecord(record)) fail(message)
  }
  for (const binding of ctx.lanGamePersistence.listBindings()) {
    if (ctx.lanGamePersistence.getBinding(binding.roomId)?.memberId !== binding.memberId) {
      fail(`binding ${JSON.stringify(binding.roomId)} does not match authoritative service state`)
    }
  }
}, { inject: ['lanGamePersistence'] })

/** Register the LAN game persistence invariant companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
