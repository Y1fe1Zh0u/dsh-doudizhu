/** Package-owned invariant companion for the pure deterministic rules library. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-doudizhu/doudizhu'

/** Cordis companion plugin name. */
export const name = 'experimental-lan-game-doudizhu-invariant'
/** Invariant registry required before package ownership can register. */
export const inject = ['invariants']

/** No runtime invariant: every state transition is a pure validated value operation with no live registry. */
const install: InvariantInstaller = () => {}

/** Register the package companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
