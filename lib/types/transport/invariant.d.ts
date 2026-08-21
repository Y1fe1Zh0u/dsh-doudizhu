/** Package registration for a transport whose active handles own their checks locally. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "lan-room-ws-invariant";
/** Invariant registry required before package ownership can register. */
export declare const inject: string[];
/** Register the WebSocket package invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map