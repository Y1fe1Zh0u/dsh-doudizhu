/** Production persistence boundary for resumable experimental LAN matches. */

import { Context, Service } from '@deepseek-ai/cordis'
import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import {
  LanGameInvalidRecordError,
  LanGameMatchExistsError,
  LanGameMatchNotFoundError,
  LanGamePersistenceClosedError,
  LanGameStaleRevisionError,
} from './error.ts'
import { validateMatchRecord } from './replay.ts'
import {
  lanGameDomainSpec,
  localBindingSchema,
  matchRecordSchema,
  type LocalBinding,
  type MatchRecord,
} from './spec.ts'

export * from './error.ts'
export * from './replay.ts'
export {
  doudizhuActionSchema,
  doudizhuDecisionOutcomeSchema,
  doudizhuResultSchema,
  doudizhuStateSchema,
  lanGameDomainSpec,
  localBindingSchema,
  matchCheckpointSchema,
  matchEventSchema,
  matchRecordSchema,
  pendingDecisionSchema,
} from './spec.ts'
export type {
  DoudizhuActionRecord,
  LocalBinding,
  MatchCheckpoint,
  MatchEvent,
  MatchRecord,
  PendingDecision,
} from './spec.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    lanGamePersistence: LanGamePersistence
  }
}

/** Both optimistic guards required by every mutation of an existing match. */
export interface MatchRevisionGuard {
  readonly expectedRecordRevision: number
  readonly expectedCheckpointStateVersion: number
}

/**
 * Single-writer service over the `lan_game` storage domain. Match mutations
 * serialize locally and use the table's atomic update slot for their final
 * record/checkpoint compare-and-set.
 */
export default class LanGamePersistence extends Service {
  static inject = ['storageDomain']

  private matches?: KvTable<string, MatchRecord>
  private bindings?: KvTable<string, LocalBinding>
  private operationTail: Promise<void> = Promise.resolve()
  private mutationAdmissionOpen = true

  constructor(ctx: Context) {
    super(ctx, 'lanGamePersistence')
  }

  /** Open, validate, and own the production LAN game storage domain. */
  protected async [Service.init](): Promise<void> {
    const domain = await this.ctx.storageDomain.open(lanGameDomainSpec)
    this.matches = domain.table('matches')
    this.bindings = domain.table('bindings')
    this.ctx.effect(() => async () => {
      this.mutationAdmissionOpen = false
      await this.operationTail
      await domain.close()
    }, 'lan-game-persistence.domainClose')

    for (const [roomId, record] of this.matches.entries()) this.assertValid(roomId, record)
    for (const [roomId, binding] of this.bindings.entries()) {
      if (binding.roomId !== roomId) {
        throw new LanGameInvalidRecordError(roomId, ['bindings table key must equal binding.roomId'])
      }
    }
  }

  /**
   * Create one room match at record revision zero.
   *
   * @param record - Initial durable match snapshot.
   * @returns A detached snapshot of the newly persisted match.
   */
  create(record: MatchRecord): Promise<MatchRecord> {
    return this.enqueue(async () => {
      const table = this.requireMatches()
      const parsed = snapshotMatch(record)
      const roomId = parsed.room.id
      if (table.get(roomId) !== undefined) throw new LanGameMatchExistsError(roomId)
      if (parsed.recordRevision !== 0) {
        throw new LanGameInvalidRecordError(roomId, ['new match recordRevision must be zero'])
      }
      this.assertValid(roomId, parsed)
      await table.put(roomId, parsed)
      return snapshotMatch(parsed)
    })
  }

  /**
   * Replace an existing record behind both optimistic guards. The service,
   * not the caller, advances `recordRevision` exactly once.
   *
   * @param record - Replacement match contents.
   * @param guard - Expected record and checkpoint revisions.
   * @returns A detached snapshot of the committed replacement.
   */
  put(record: MatchRecord, guard: MatchRevisionGuard): Promise<MatchRecord> {
    return this.update(record.room.id, guard, () => record)
  }

  /**
   * Atomically transform an existing full match record behind both guards.
   *
   * @param roomId - Durable room identifier.
   * @param guard - Expected record and checkpoint revisions.
   * @param transform - Pure transformation applied to a detached current snapshot.
   * @returns A detached snapshot of the committed result.
   */
  update(
    roomId: string,
    guard: MatchRevisionGuard,
    transform: (current: MatchRecord) => MatchRecord,
  ): Promise<MatchRecord> {
    return this.enqueue(() => this.updateKnown(roomId, guard, transform))
  }

  /**
   * Return one detached durable match snapshot.
   *
   * @param roomId - Durable room identifier.
   * @returns The detached match snapshot, or `undefined` when absent.
   */
  get(roomId: string): MatchRecord | undefined {
    const record = this.requireMatches().get(roomId)
    return record === undefined ? undefined : snapshotMatch(record)
  }

  /**
   * Return detached durable matches in stable room-id order.
   *
   * @returns All detached match snapshots ordered by room identifier.
   */
  list(): MatchRecord[] {
    return [...this.requireMatches().entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, record]) => snapshotMatch(record))
  }

  /**
   * Close and redact one match. Local secrets are scrubbed before the match
   * record commits, so a later match-write failure cannot leave a strategy
   * prompt or resume token behind.
   *
   * @param roomId - Durable room identifier.
   * @param guard - Expected record and checkpoint revisions.
   * @param closedAt - Timestamp recorded on the closure event and snapshots.
   * @returns A detached snapshot of the archived match.
   */
  archive(
    roomId: string,
    guard: MatchRevisionGuard,
    closedAt: string = new Date().toISOString(),
  ): Promise<MatchRecord> {
    return this.enqueue(async () => {
      const current = this.requireMatches().get(roomId)
      if (current === undefined) throw new LanGameMatchNotFoundError(roomId)
      this.assertGuard(roomId, current, guard)

      const binding = this.requireBindings().get(roomId)
      if (binding !== undefined) {
        await this.requireBindings().put(roomId, snapshotBinding({
          ...binding,
          strategyPrompt: undefined,
          resumeToken: undefined,
          state: 'archived',
          updatedAt: closedAt,
        }))
      }

      return await this.updateKnown(roomId, guard, value => redactMatch(value, closedAt))
    })
  }

  /**
   * Create or replace the one installation-local binding for a room.
   *
   * @param binding - Installation-local room and session binding.
   * @returns A detached snapshot of the persisted binding.
   */
  putBinding(binding: LocalBinding): Promise<LocalBinding> {
    return this.enqueue(async () => {
      const parsed = snapshotBinding(binding)
      await this.requireBindings().put(parsed.roomId, parsed)
      return snapshotBinding(parsed)
    })
  }

  /**
   * Return the detached local binding for a room.
   *
   * @param roomId - Durable room identifier.
   * @returns The detached local binding, or `undefined` when absent.
   */
  getBinding(roomId: string): LocalBinding | undefined {
    const binding = this.requireBindings().get(roomId)
    return binding === undefined ? undefined : snapshotBinding(binding)
  }

  /**
   * Return detached local bindings, optionally restricted to one room.
   *
   * @param roomId - Optional room identifier used to restrict the result.
   * @returns Detached bindings ordered by room identifier.
   */
  listBindings(roomId?: string): LocalBinding[] {
    return [...this.requireBindings().entries()]
      .filter(([key]) => roomId === undefined || key === roomId)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, binding]) => snapshotBinding(binding))
  }

  private async updateKnown(
    roomId: string,
    guard: MatchRevisionGuard,
    transform: (current: MatchRecord) => MatchRecord,
  ): Promise<MatchRecord> {
    let missing = false
    try {
      const next = await this.requireMatches().update(roomId, (current) => {
        this.assertGuard(roomId, current, guard)
        const transformed = transform(snapshotMatch(current))
        const parsed = snapshotMatch({ ...transformed, recordRevision: current.recordRevision + 1 })
        this.assertValid(roomId, parsed)
        return parsed
      })
      return snapshotMatch(next)
    } catch (error: unknown) {
      if (isMissingKey(error)) missing = true
      if (!missing) throw error
    }
    throw new LanGameMatchNotFoundError(roomId)
  }

  private assertGuard(roomId: string, current: MatchRecord, guard: MatchRevisionGuard): void {
    const actualStateVersion = current.checkpoint.state.version
    if (current.recordRevision !== guard.expectedRecordRevision
      || actualStateVersion !== guard.expectedCheckpointStateVersion) {
      throw new LanGameStaleRevisionError(
        roomId,
        guard.expectedRecordRevision,
        current.recordRevision,
        guard.expectedCheckpointStateVersion,
        actualStateVersion,
      )
    }
  }

  private assertValid(roomId: string, record: MatchRecord): void {
    const failures = validateMatchRecord(record, roomId)
    if (failures.length > 0) throw new LanGameInvalidRecordError(roomId, failures)
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.mutationAdmissionOpen) return Promise.reject(new LanGamePersistenceClosedError())
    const run = this.operationTail.then(operation, operation)
    this.operationTail = run.then(() => {}, () => {})
    return run
  }

  private requireMatches(): KvTable<string, MatchRecord> {
    if (this.matches === undefined) throw new Error('LAN game persistence has not initialized')
    return this.matches
  }

  private requireBindings(): KvTable<string, LocalBinding> {
    if (this.bindings === undefined) throw new Error('LAN game persistence has not initialized')
    return this.bindings
  }
}

function redactMatch(record: MatchRecord, closedAt: string): MatchRecord {
  const last = record.events[record.events.length - 1]
  const events = last?.type === 'room-closed'
    ? record.events
    : [...record.events, {
      type: 'room-closed' as const,
      seq: (last?.seq ?? -1) + 1,
      at: closedAt,
      reason: 'archived',
    }]
  return {
    ...record,
    updatedAt: closedAt,
    closedAt,
    room: {
      ...record.room,
      members: record.room.members.map(({ resumeToken: _resumeToken, ...member }) => member),
    },
    events,
    pendingDecision: undefined,
  }
}

function snapshotMatch(record: MatchRecord): MatchRecord {
  return matchRecordSchema.parse(record)
}

function snapshotBinding(binding: LocalBinding): LocalBinding {
  return localBindingSchema.parse(binding)
}

function isMissingKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'missing-key'
}
