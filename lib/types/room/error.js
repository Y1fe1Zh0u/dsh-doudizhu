/** Typed failures returned by LAN room commands. */
/** Command rejection with a stable code and actionable message. */
export class LanRoomError extends Error {
    /** Stable machine-readable failure code. */
    code;
    /** Create one room command rejection. */
    constructor(message, code) {
        super(message);
        this.name = 'LanRoomError';
        this.code = code;
    }
}
//# sourceMappingURL=error.js.map