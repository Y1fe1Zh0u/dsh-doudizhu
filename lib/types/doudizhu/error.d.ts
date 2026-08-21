/** Engine rejection with a stable machine-readable reason. */
export declare class DoudizhuError extends Error {
    readonly code: DoudizhuErrorCode;
    /** @param message - diagnostic detail. @param code - stable rejection category. */
    constructor(message: string, code: DoudizhuErrorCode);
}
/** Stable state-transition rejection categories. */
export type DoudizhuErrorCode = 'DOUDIZHU_INVALID_DECK' | 'DOUDIZHU_INVALID_STATE' | 'DOUDIZHU_NOT_CURRENT_SEAT' | 'DOUDIZHU_INVALID_ACTION' | 'DOUDIZHU_ILLEGAL_BID' | 'DOUDIZHU_CARD_NOT_OWNED' | 'DOUDIZHU_ILLEGAL_COMBINATION' | 'DOUDIZHU_PLAY_DOES_NOT_BEAT';
//# sourceMappingURL=error.d.ts.map