//#region lib/types/transport/invariant.js
/** Package registration for a transport whose active handles own their checks locally. */
const PACKAGE_NAME = "dsh-doudizhu/transport";
/** Cordis companion plugin name. */
const name = "lan-room-ws-invariant";
/** Invariant registry required before package ownership can register. */
const inject = ["invariants"];
/** No runtime invariant: every listener, peer, and Game Session is private to one controller lifecycle owner. */
const install = () => {};
/** Register the WebSocket package invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
