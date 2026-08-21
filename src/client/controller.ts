/** React-free browser controller for the local LAN room Remote namespace. */

import { createSnapshotStore, type SessionId, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  HostLanRoomRequest,
  JoinLanRoomControlRequest,
  LanRoomParticipantView,
} from '../transport/client.ts'

/** Remote methods mounted from the LAN room Host package. */
export interface LanRoomRemote {
  readonly status: (sessionId: SessionId) => Promise<RemoteResult<LanRoomParticipantView | undefined>>
  readonly host: (sessionId: SessionId, request: HostLanRoomRequest) => Promise<RemoteResult<LanRoomParticipantView>>
  readonly join: (sessionId: SessionId, request: JoinLanRoomControlRequest) => Promise<RemoteResult<LanRoomParticipantView>>
  readonly updatePrompt: (sessionId: SessionId, strategyPrompt: string) => Promise<RemoteResult<LanRoomParticipantView>>
  readonly setReady: (sessionId: SessionId, ready: boolean) => Promise<RemoteResult<LanRoomParticipantView>>
  readonly leave: (sessionId: SessionId) => Promise<RemoteResult<void>>
}

/** Browser state rendered by one Session's card-table tab. */
export interface LanGameClientState {
  readonly status: 'loading' | 'idle' | 'room'
  readonly participant: LanRoomParticipantView | undefined
  readonly pending: boolean
  readonly error: string | undefined
}

const INITIAL_STATE: LanGameClientState = { status: 'loading', participant: undefined, pending: false, error: undefined }

/** Polls the local Host projection and serializes user mutations. */
export class LanGameClient {
  /** Stable observable state source consumed by the conversation-view hook. */
  readonly store: SnapshotStore<LanGameClientState> = createSnapshotStore(INITIAL_STATE)

  private timer: ReturnType<typeof setInterval> | undefined
  private refreshing: Promise<void> | undefined
  private fingerprint = ''
  private generation = 0

  /** @param sessionId - visible foreground Session owning the game participant. @param remote - mounted Host Remote namespace. */
  constructor(private readonly sessionId: SessionId, private readonly remote: LanRoomRemote) {}

  /**
   * Start polling immediately and every 750 ms.
   * @returns disposer that stops polling.
   */
  start(): () => void {
    void this.refresh()
    this.timer ??= setInterval(() => { void this.refresh() }, 750)
    return () => {
      if (this.timer !== undefined) clearInterval(this.timer)
      this.timer = undefined
    }
  }

  /**
   * Create a coordinator room.
   * @param strategyPrompt - local pre-game strategy.
   * @returns after Host settlement.
   */
  host(strategyPrompt: string): Promise<void> {
    return this.mutate(() => this.remote.host(this.sessionId, { strategyPrompt }))
  }

  /**
   * Join a coordinator room.
   * @param request - coordinator URL, code, and strategy.
   * @returns after Host settlement.
   */
  join(request: JoinLanRoomControlRequest): Promise<void> {
    return this.mutate(() => this.remote.join(this.sessionId, request))
  }

  /**
   * Save the editable lobby Prompt.
   * @param strategyPrompt - replacement strategy.
   * @returns after Host settlement.
   */
  updatePrompt(strategyPrompt: string): Promise<void> {
    return this.mutate(() => this.remote.updatePrompt(this.sessionId, strategyPrompt))
  }

  /**
   * Change readiness.
   * @param ready - requested state.
   * @returns after Host settlement.
   */
  setReady(ready: boolean): Promise<void> {
    return this.mutate(() => this.remote.setReady(this.sessionId, ready))
  }

  /** Leave the current lobby. @returns after Host settlement. */
  leave(): Promise<void> {
    return this.mutate(async () => {
      const result = await this.remote.leave(this.sessionId)
      if (!result.ok) return result
      return { ok: true, value: undefined } as const
    }, true)
  }

  private refresh(): Promise<void> {
    if (this.refreshing !== undefined) return this.refreshing
    const generation = this.generation
    this.refreshing = this.remote.status(this.sessionId).then((result) => {
      if (generation !== this.generation) return
      if (!result.ok) {
        this.publish({ ...this.store.getSnapshot(), status: 'idle', error: failure(result) })
        return
      }
      this.publish(result.value === undefined
        ? { status: 'idle', participant: undefined, pending: this.store.getSnapshot().pending, error: undefined }
        : { status: 'room', participant: result.value, pending: this.store.getSnapshot().pending, error: undefined })
    }).catch((error: unknown) => {
      if (generation !== this.generation) return
      this.publish({ ...this.store.getSnapshot(), status: 'idle', error: messageOf(error) })
    }).finally(() => { this.refreshing = undefined })
    return this.refreshing
  }

  private async mutate(
    operation: () => Promise<RemoteResult<LanRoomParticipantView | undefined>>,
    leave = false,
  ): Promise<void> {
    if (this.store.getSnapshot().pending) return
    this.generation += 1
    this.publish({ ...this.store.getSnapshot(), pending: true, error: undefined })
    try {
      const result = await operation()
      if (!result.ok) {
        this.publish({ ...this.store.getSnapshot(), pending: false, error: failure(result) })
      } else if (leave) {
        this.publish({ status: 'idle', participant: undefined, pending: false, error: undefined })
      } else if (result.value !== undefined) {
        this.publish({ status: 'room', participant: result.value, pending: false, error: undefined })
      }
    } catch (error: unknown) {
      this.publish({ ...this.store.getSnapshot(), pending: false, error: messageOf(error) })
    }
  }

  private publish(next: LanGameClientState): void {
    const fingerprint = JSON.stringify(next)
    if (fingerprint === this.fingerprint) return
    this.fingerprint = fingerprint
    this.store.set(next)
  }
}

function failure(result: Extract<RemoteResult<unknown>, { ok: false }>): string {
  return `${result.error.message} (${result.error.code})`
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
