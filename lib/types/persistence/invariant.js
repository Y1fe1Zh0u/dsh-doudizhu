/** Invariant companion for LAN game persistence. */
import { validateMatchRecord } from "./replay.js";
const PACKAGE_NAME = 'dsh-doudizhu/persistence';
/** Cordis companion plugin name. */
export const name = 'lan-game-persistence-invariant';
/** Invariant registry required before package checks can install. */
export const inject = ['invariants'];
/** Validate every durable match and the local binding key relationship at companion startup. */
const install = Object.assign((ctx, fail) => {
    for (const record of ctx.lanGamePersistence.list()) {
        for (const message of validateMatchRecord(record))
            fail(message);
    }
    for (const binding of ctx.lanGamePersistence.listBindings()) {
        if (ctx.lanGamePersistence.getBinding(binding.roomId)?.memberId !== binding.memberId) {
            fail(`binding ${JSON.stringify(binding.roomId)} does not match authoritative service state`);
        }
    }
}, { inject: ['lanGamePersistence'] });
/** Register the LAN game persistence invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map