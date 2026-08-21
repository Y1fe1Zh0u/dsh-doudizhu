/** Public values for hidden continuable Game Sessions. */

import type { Agent } from '@deepseek-ai/dsh-agent'
import type { JsonValue, SessionId } from '@deepseek-ai/dsh-session'

/** Fixed model-visible tool name for committing one game decision. */
export const LAN_GAME_ACTION_TOOL = 'submit_lan_game_action'

/** Create one hidden continuable Game Session below a visible foreground Agent. */
export interface CreateLanGameAgentRequest {
  readonly parent: Agent
  readonly strategyPrompt: string
  readonly signal: AbortSignal
}

/** Reattach the bridge to one durable continuable Game Session after Host restart. */
export interface RestoreLanGameAgentRequest {
  readonly parent: Agent
  readonly childId: SessionId
  readonly strategyPrompt: string
  readonly promptHash: string
}

/** Address one pending private game decision. */
export interface RequestLanGameDecision {
  readonly parent: Agent
  readonly childId: SessionId
  readonly requestId: string
  readonly stateVersion: number
  readonly state: JsonValue
  readonly signal: AbortSignal
}

/** Canonical decision accepted from the hidden Game Session tool. */
export interface LanGameDecision {
  readonly requestId: string
  readonly stateVersion: number
  readonly action: JsonValue
}

/** Host-facing current Game Session row. */
export interface LanGameAgentView {
  readonly childId: SessionId
  readonly parentSessionId: SessionId
  readonly promptHash: string
  readonly pendingRequestId?: string
}

/** Notification emitted after a Game Session row changes or is removed. */
export interface LanGameAgentChanged {
  readonly kind: 'updated' | 'removed'
  readonly agent: LanGameAgentView
}

/** Stable failures owned by the Game Session bridge. */
export type LanGameAgentErrorCode =
  | 'LAN_GAME_INVALID_ARGUMENT'
  | 'LAN_GAME_NOT_FOUND'
  | 'LAN_GAME_PARENT_MISMATCH'
  | 'LAN_GAME_DECISION_PENDING'
  | 'LAN_GAME_DECISION_MISMATCH'
  | 'LAN_GAME_DECISION_TIMEOUT'
