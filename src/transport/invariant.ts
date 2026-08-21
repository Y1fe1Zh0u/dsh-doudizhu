/** Package registration for a transport whose active handles own their checks locally. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-doudizhu/transport'

/** Cordis companion plugin name. */
export const name = 'lan-room-ws-invariant'

/** Invariant registry required before package ownership can register. */
export const inject = ['invariants']

/** No runtime invariant: every listener, peer, and Game Session is private to one controller lifecycle owner. */
const install: InvariantInstaller = () => {}

/** Register the WebSocket package invariant companion. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
