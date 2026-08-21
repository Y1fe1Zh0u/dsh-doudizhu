/** Package-owned checks for hidden Game Session bridge rows. */
const PACKAGE_NAME = 'dsh-doudizhu/agent';
const HASH = /^[0-9a-f]{64}$/u;
/** Cordis companion plugin name. */
export const name = 'lan-game-agent-invariant';
/** Invariant registry required before checks install. */
export const inject = ['invariants'];
/** Validate unique child identities and their immutable parent/hash relationship. */
const install = Object.assign((ctx, fail) => {
    const validate = () => {
        const seen = new Set();
        for (const entry of ctx.lanGameAgents.list()) {
            if (seen.has(entry.childId))
                fail(`duplicate Game Session ${JSON.stringify(entry.childId)}`);
            seen.add(entry.childId);
            if (entry.childId === entry.parentSessionId)
                fail(`Game Session ${JSON.stringify(entry.childId)} cannot be its own parent`);
            if (!HASH.test(entry.promptHash))
                fail(`Game Session ${JSON.stringify(entry.childId)} has an invalid prompt hash`);
        }
    };
    validate();
    ctx.lanGameAgents.onChanged(validate);
}, { inject: ['lanGameAgents'] });
/** Register the hidden Game Session invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map