/** Invariant companion for LAN game persistence. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "lan-game-persistence-invariant";
/** Invariant registry required before package checks can install. */
export declare const inject: string[];
/** Register the LAN game persistence invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map