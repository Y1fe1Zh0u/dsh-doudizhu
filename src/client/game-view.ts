/** Runtime guards for game payloads crossing the Host Remote boundary as JSON. */

import type { JsonValue } from '@deepseek-ai/dsh-api-remotes/client'
import type { DoudizhuPrivateView } from '../doudizhu/client.ts'
import type { DoudizhuTableSnapshot } from '../doudizhu-runtime/client.ts'

/**
 * Parse one public game JSON payload.
 * @param value - Host Remote game payload.
 * @returns usable DouDizhu snapshot, or undefined for absent, foreign, or malformed data.
 */
export function doudizhuTableSnapshot(value: JsonValue | undefined): DoudizhuTableSnapshot | undefined {
  if (!record(value) || value.game !== 'doudizhu' || typeof value.status !== 'string') return undefined
  if (value.status === 'failed') return typeof value.error === 'string' ? value as DoudizhuTableSnapshot : undefined
  if ((value.status !== 'running' && value.status !== 'round-finished' && value.status !== 'finished') || !record(value.state)) return undefined
  const state = value.state
  if (typeof state.version !== 'number' || typeof state.phase !== 'string' || !threeNumbers(state.cardCounts)) return undefined
  if (typeof value.round !== 'number' || typeof value.totalRounds !== 'number' || !threeNumbers(value.totalScores)) return undefined
  if (value.deal !== undefined && typeof value.deal !== 'number') return undefined
  if (value.decisionSeat !== undefined && !seat(value.decisionSeat)) return undefined
  if (value.decisionOutcomes !== undefined
    && (!Array.isArray(value.decisionOutcomes) || !value.decisionOutcomes.every(decisionOutcome))) return undefined
  return value as DoudizhuTableSnapshot
}

/**
 * Parse one seat-private game JSON payload.
 * @param value - Host Remote private-game payload.
 * @returns usable local private view, or undefined before the first addressed decision.
 */
export function doudizhuPrivateSnapshot(value: JsonValue | undefined): DoudizhuPrivateView | undefined {
  if (!record(value) || typeof value.version !== 'number' || typeof value.phase !== 'string') return undefined
  if (!Array.isArray(value.yourCards) || !value.yourCards.every(card => typeof card === 'string')) return undefined
  if (!threeNumbers(value.cardCounts) || !Array.isArray(value.legalActions)) return undefined
  return value as unknown as DoudizhuPrivateView
}

function record(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function threeNumbers(value: JsonValue | undefined): boolean {
  return Array.isArray(value) && value.length === 3 && value.every(item => typeof item === 'number')
}

function seat(value: JsonValue | undefined): boolean {
  return value === 0 || value === 1 || value === 2
}

function decisionOutcome(value: JsonValue): boolean {
  if (!record(value)) return false
  if (typeof value.historyIndex !== 'number' || typeof value.afterStateVersion !== 'number' || !seat(value.seat)) return false
  if (value.source !== 'agent' && value.source !== 'fallback') return false
  if (value.fallbackReason === undefined) return true
  return typeof value.fallbackReason === 'string'
    && ['timeout', 'disconnected', 'invalid-response', 'transport-error'].includes(value.fallbackReason)
}
