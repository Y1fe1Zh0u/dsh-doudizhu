/** Package-owned invariant companion for the pure deterministic rules library. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "experimental-lan-game-doudizhu-invariant";
/** Invariant registry required before package ownership can register. */
export declare const inject: string[];
/** Register the package companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map