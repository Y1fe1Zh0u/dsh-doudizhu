/** Control types shared by the local DSH Host plugin and its browser UI. */

import type { JsonValue } from '@deepseek-ai/dsh-session/types'

/** JSON room member projected across the local loopback Remote API. */
export interface LanRoomPublicMember {
  readonly id: string
  readonly seat: number
  readonly ready: boolean
  readonly connected: boolean
  readonly promptHash?: string
}

/** JSON room snapshot projected across the local loopback Remote API. */
export interface LanRoomPublicSnapshot {
  readonly id: string
  readonly code: string
  readonly revision: number
  readonly phase: 'lobby' | 'locked' | 'running' | 'finished'
  readonly coordinatorId: string
  readonly maxMembers: number
  readonly members: readonly LanRoomPublicMember[]
  readonly result?: string
}

/** Request to create and advertise a room from this DSH Host. */
export interface HostLanRoomRequest {
  readonly strategyPrompt: string
}

/** Request to join a coordinator from this DSH Host. */
export interface JoinLanRoomControlRequest {
  readonly url: string
  readonly code: string
  readonly strategyPrompt: string
}

/** Current local participant state projected to the browser plugin. */
export interface LanRoomParticipantView {
  readonly memberId: string
  readonly role: 'coordinator' | 'participant'
  readonly connection: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  readonly room: LanRoomPublicSnapshot
  readonly strategyPrompt: string
  readonly joinUrls: readonly string[]
  readonly gameSessionId?: string
  readonly gameSessionState: 'absent' | 'starting' | 'ready' | 'failed'
  readonly game?: JsonValue
  readonly privateGame?: JsonValue
  readonly error?: string
}
