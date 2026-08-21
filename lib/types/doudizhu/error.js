/** Engine rejection with a stable machine-readable reason. */
export class DoudizhuError extends Error {
    code;
    /** @param message - diagnostic detail. @param code - stable rejection category. */
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'DoudizhuError';
    }
}
//# sourceMappingURL=error.js.map