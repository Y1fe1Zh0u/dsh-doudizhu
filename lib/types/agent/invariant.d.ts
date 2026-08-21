/** Package-owned checks for hidden Game Session bridge rows. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "lan-game-agent-invariant";
/** Invariant registry required before checks install. */
export declare const inject: string[];
/** Register the hidden Game Session invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map