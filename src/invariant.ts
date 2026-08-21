/** Package-owned invariant companion for the pure LAN game table consumer. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-doudizhu'

/** Cordis companion plugin name. */
export const name = 'experimental-lan-game-ui-invariant'
/** Invariant registry required before package ownership can register. */
export const inject = ['invariants']

/** No runtime invariant: the slot ledger owns the view registration and its disposal. */
const install: InvariantInstaller = () => {}

/** Register the package companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
