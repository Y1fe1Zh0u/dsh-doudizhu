/** Stable persistence-service failures. */
/** A match create addressed an already durable room. */
export class LanGameMatchExistsError extends Error {
    roomId;
    /** Stable machine-readable error code. */
    code = 'LAN_GAME_MATCH_EXISTS';
    constructor(roomId) {
        super(`LAN game match ${JSON.stringify(roomId)} already exists`);
        this.roomId = roomId;
        this.name = 'LanGameMatchExistsError';
    }
}
/** A mutation addressed a room absent from durable match storage. */
export class LanGameMatchNotFoundError extends Error {
    roomId;
    /** Stable machine-readable error code. */
    code = 'LAN_GAME_MATCH_NOT_FOUND';
    constructor(roomId) {
        super(`LAN game match ${JSON.stringify(roomId)} was not found`);
        this.roomId = roomId;
        this.name = 'LanGameMatchNotFoundError';
    }
}
/** Compare-and-set guard rejected a stale writer. */
export class LanGameStaleRevisionError extends Error {
    roomId;
    expectedRecordRevision;
    actualRecordRevision;
    expectedCheckpointStateVersion;
    actualCheckpointStateVersion;
    /** Stable machine-readable error code. */
    code = 'LAN_GAME_STALE_REVISION';
    constructor(roomId, expectedRecordRevision, actualRecordRevision, expectedCheckpointStateVersion, actualCheckpointStateVersion) {
        super(`stale LAN game match ${JSON.stringify(roomId)}: expected record/checkpoint revisions `
            + `${expectedRecordRevision}/${expectedCheckpointStateVersion}, got `
            + `${actualRecordRevision}/${actualCheckpointStateVersion}`);
        this.roomId = roomId;
        this.expectedRecordRevision = expectedRecordRevision;
        this.actualRecordRevision = actualRecordRevision;
        this.expectedCheckpointStateVersion = expectedCheckpointStateVersion;
        this.actualCheckpointStateVersion = actualCheckpointStateVersion;
        this.name = 'LanGameStaleRevisionError';
    }
}
/** A candidate record is schema-valid JSON but violates replay or relational invariants. */
export class LanGameInvalidRecordError extends Error {
    roomId;
    failures;
    /** Stable machine-readable error code. */
    code = 'LAN_GAME_INVALID_RECORD';
    constructor(roomId, failures) {
        super(`invalid LAN game match ${JSON.stringify(roomId)}: ${failures.join('; ')}`);
        this.roomId = roomId;
        this.failures = failures;
        this.name = 'LanGameInvalidRecordError';
    }
}
/** Service teardown has begun and no later mutation may be admitted. */
export class LanGamePersistenceClosedError extends Error {
    /** Stable machine-readable error code. */
    code = 'LAN_GAME_PERSISTENCE_CLOSED';
    constructor() {
        super('LAN game persistence is closing');
        this.name = 'LanGamePersistenceClosedError';
    }
}
//# sourceMappingURL=error.js.map