import { i as validateMatchRecord } from "./replay-B_nk6vmR.js";
//#region lib/types/persistence/invariant.js
/** Invariant companion for LAN game persistence. */
const PACKAGE_NAME = "dsh-doudizhu/persistence";
/** Cordis companion plugin name. */
const name = "lan-game-persistence-invariant";
/** Invariant registry required before package checks can install. */
const inject = ["invariants"];
/** Validate every durable match and the local binding key relationship at companion startup. */
const install = Object.assign((ctx, fail) => {
	for (const record of ctx.lanGamePersistence.list()) for (const message of validateMatchRecord(record)) fail(message);
	for (const binding of ctx.lanGamePersistence.listBindings()) if (ctx.lanGamePersistence.getBinding(binding.roomId)?.memberId !== binding.memberId) fail(`binding ${JSON.stringify(binding.roomId)} does not match authoritative service state`);
}, { inject: ["lanGamePersistence"] });
/** Register the LAN game persistence invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
