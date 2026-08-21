/** Typed failures from hidden Game Session operations. */
import type { LanGameAgentErrorCode } from './types.ts';
/** Game Session command rejection with a stable code. */
export declare class LanGameAgentError extends Error {
    /** Stable machine-readable failure code. */
    readonly code: LanGameAgentErrorCode;
    /** Create one Game Session command rejection. */
    constructor(message: string, code: LanGameAgentErrorCode);
}
//# sourceMappingURL=error.d.ts.map