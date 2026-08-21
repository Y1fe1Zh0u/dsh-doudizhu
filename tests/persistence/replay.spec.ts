import { describe, expect, it } from 'vitest'
import {
  replayMatchEvents,
  validateMatchCheckpoint,
  validateMatchRecord,
} from '../../src/persistence/index.ts'
import { fixtureRecord } from './fixtures.ts'

describe('LAN game match replay', () => {
  it('rebuilds exact engine state and action provenance from deal plus actions', () => {
    const record = fixtureRecord()
    const replay = replayMatchEvents(record.events)
    expect(replay.checkpoint).toEqual(record.checkpoint)
    expect(replay.pendingDecision).toBeUndefined()
    expect(validateMatchCheckpoint(record.events, record.checkpoint)).toEqual([])
    expect(validateMatchRecord(record)).toEqual([])
  })

  it('rejects a checkpoint that cannot be obtained from deterministic replay', () => {
    const record = fixtureRecord()
    const checkpoint = {
      ...record.checkpoint,
      totalScores: [1, 0, 0] as [number, number, number],
    }
    expect(validateMatchCheckpoint(record.events, checkpoint)).toEqual([
      'checkpoint does not equal deterministic event replay',
    ])
  })

  it('rejects non-contiguous events and mismatched committed versions', () => {
    const record = fixtureRecord()
    expect(() => replayMatchEvents(record.events.map((event, index) => (
      index === 1 ? { ...event, seq: 7 } : event
    )))).toThrow(/sequences must be contiguous/)
    expect(() => replayMatchEvents(record.events.map(event => (
      event.type === 'action-committed' ? { ...event, afterStateVersion: 9 } : event
    )))).toThrow(/afterStateVersion/)
  })
})
