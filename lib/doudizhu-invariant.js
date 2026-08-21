//#region lib/types/doudizhu/invariant.js
/** Package-owned invariant companion for the pure deterministic rules library. */
const PACKAGE_NAME = "dsh-doudizhu/doudizhu";
/** Cordis companion plugin name. */
const name = "experimental-lan-game-doudizhu-invariant";
/** Invariant registry required before package ownership can register. */
const inject = ["invariants"];
/** No runtime invariant: every state transition is a pure validated value operation with no live registry. */
const install = () => {};
/** Register the package companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
