/** Package-owned invariant companion for the pure LAN game table consumer. */
const PACKAGE_NAME = 'dsh-doudizhu';
/** Cordis companion plugin name. */
export const name = 'experimental-lan-game-ui-invariant';
/** Invariant registry required before package ownership can register. */
export const inject = ['invariants'];
/** No runtime invariant: the slot ledger owns the view registration and its disposal. */
const install = () => { };
/** Register the package companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map