/** Stable persistence-service failures. */

/** A match create addressed an already durable room. */
export class LanGameMatchExistsError extends Error {
  /** Stable machine-readable error code. */
  readonly code = 'LAN_GAME_MATCH_EXISTS' as const

  constructor(readonly roomId: string) {
    super(`LAN game match ${JSON.stringify(roomId)} already exists`)
    this.name = 'LanGameMatchExistsError'
  }
}

/** A mutation addressed a room absent from durable match storage. */
export class LanGameMatchNotFoundError extends Error {
  /** Stable machine-readable error code. */
  readonly code = 'LAN_GAME_MATCH_NOT_FOUND' as const

  constructor(readonly roomId: string) {
    super(`LAN game match ${JSON.stringify(roomId)} was not found`)
    this.name = 'LanGameMatchNotFoundError'
  }
}

/** Compare-and-set guard rejected a stale writer. */
export class LanGameStaleRevisionError extends Error {
  /** Stable machine-readable error code. */
  readonly code = 'LAN_GAME_STALE_REVISION' as const

  constructor(
    readonly roomId: string,
    readonly expectedRecordRevision: number,
    readonly actualRecordRevision: number,
    readonly expectedCheckpointStateVersion: number,
    readonly actualCheckpointStateVersion: number,
  ) {
    super(
      `stale LAN game match ${JSON.stringify(roomId)}: expected record/checkpoint revisions `
      + `${expectedRecordRevision}/${expectedCheckpointStateVersion}, got `
      + `${actualRecordRevision}/${actualCheckpointStateVersion}`,
    )
    this.name = 'LanGameStaleRevisionError'
  }
}

/** A candidate record is schema-valid JSON but violates replay or relational invariants. */
export class LanGameInvalidRecordError extends Error {
  /** Stable machine-readable error code. */
  readonly code = 'LAN_GAME_INVALID_RECORD' as const

  constructor(readonly roomId: string, readonly failures: readonly string[]) {
    super(`invalid LAN game match ${JSON.stringify(roomId)}: ${failures.join('; ')}`)
    this.name = 'LanGameInvalidRecordError'
  }
}

/** Service teardown has begun and no later mutation may be admitted. */
export class LanGamePersistenceClosedError extends Error {
  /** Stable machine-readable error code. */
  readonly code = 'LAN_GAME_PERSISTENCE_CLOSED' as const

  constructor() {
    super('LAN game persistence is closing')
    this.name = 'LanGamePersistenceClosedError'
  }
}
