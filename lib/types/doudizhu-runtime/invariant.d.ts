/** Runtime invariant companion for active coordinator-owned DouDizhu matches. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "experimental-lan-game-doudizhu-runtime-invariant";
/** Invariant registry required before checks can register. */
export declare const inject: string[];
/** Register active-match relationship checks. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map