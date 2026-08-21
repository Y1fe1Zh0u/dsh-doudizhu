/** Typed failures from hidden Game Session operations. */
/** Game Session command rejection with a stable code. */
export class LanGameAgentError extends Error {
    /** Stable machine-readable failure code. */
    code;
    /** Create one Game Session command rejection. */
    constructor(message, code) {
        super(message);
        this.name = 'LanGameAgentError';
        this.code = code;
    }
}
//# sourceMappingURL=error.js.map