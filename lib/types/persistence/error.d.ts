/** Stable persistence-service failures. */
/** A match create addressed an already durable room. */
export declare class LanGameMatchExistsError extends Error {
    readonly roomId: string;
    /** Stable machine-readable error code. */
    readonly code: "LAN_GAME_MATCH_EXISTS";
    constructor(roomId: string);
}
/** A mutation addressed a room absent from durable match storage. */
export declare class LanGameMatchNotFoundError extends Error {
    readonly roomId: string;
    /** Stable machine-readable error code. */
    readonly code: "LAN_GAME_MATCH_NOT_FOUND";
    constructor(roomId: string);
}
/** Compare-and-set guard rejected a stale writer. */
export declare class LanGameStaleRevisionError extends Error {
    readonly roomId: string;
    readonly expectedRecordRevision: number;
    readonly actualRecordRevision: number;
    readonly expectedCheckpointStateVersion: number;
    readonly actualCheckpointStateVersion: number;
    /** Stable machine-readable error code. */
    readonly code: "LAN_GAME_STALE_REVISION";
    constructor(roomId: string, expectedRecordRevision: number, actualRecordRevision: number, expectedCheckpointStateVersion: number, actualCheckpointStateVersion: number);
}
/** A candidate record is schema-valid JSON but violates replay or relational invariants. */
export declare class LanGameInvalidRecordError extends Error {
    readonly roomId: string;
    readonly failures: readonly string[];
    /** Stable machine-readable error code. */
    readonly code: "LAN_GAME_INVALID_RECORD";
    constructor(roomId: string, failures: readonly string[]);
}
/** Service teardown has begun and no later mutation may be admitted. */
export declare class LanGamePersistenceClosedError extends Error {
    /** Stable machine-readable error code. */
    readonly code: "LAN_GAME_PERSISTENCE_CLOSED";
    constructor();
}
//# sourceMappingURL=error.d.ts.map