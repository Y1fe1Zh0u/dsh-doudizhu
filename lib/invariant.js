//#region lib/types/invariant.js
/** Package-owned invariant companion for the pure LAN game table consumer. */
const PACKAGE_NAME = "dsh-doudizhu";
/** Cordis companion plugin name. */
const name = "experimental-lan-game-ui-invariant";
/** Invariant registry required before package ownership can register. */
const inject = ["invariants"];
/** No runtime invariant: the slot ledger owns the view registration and its disposal. */
const install = () => {};
/** Register the package companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
