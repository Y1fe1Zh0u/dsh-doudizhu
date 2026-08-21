/** Package-owned relational checks for authoritative LAN room snapshots. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "lan-room-invariant";
/** Invariant registry required before package checks can install. */
export declare const inject: string[];
/** Register the LAN room invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map