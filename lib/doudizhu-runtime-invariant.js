//#region lib/types/doudizhu-runtime/invariant.js
/** Runtime invariant companion for active coordinator-owned DouDizhu matches. */
const PACKAGE_NAME = "dsh-doudizhu/doudizhu-runtime";
/** Cordis companion plugin name. */
const name = "experimental-lan-game-doudizhu-runtime-invariant";
/** Invariant registry required before checks can register. */
const inject = ["invariants"];
/** Check unique active room identities and monotonic non-negative versions. */
const install = Object.assign((ctx, fail) => {
	const validate = () => {
		const rooms = /* @__PURE__ */ new Set();
		for (const row of ctx.doudizhuGames.list()) {
			if (rooms.has(row.roomId)) fail(`duplicate active room ${JSON.stringify(row.roomId)}`);
			rooms.add(row.roomId);
			if (!Number.isSafeInteger(row.stateVersion) || row.stateVersion < 0) fail(`room ${JSON.stringify(row.roomId)} has invalid version`);
		}
	};
	validate();
	ctx.doudizhuGames.onChanged(validate);
}, { inject: ["doudizhuGames"] });
/** Register active-match relationship checks. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
