// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { LanRoomParticipantView } from '../../src/transport/client.ts'
import { LanGameClient, type LanRoomRemote } from '../../src/client/controller.ts'

vi.mock('@deepseek-ai/dsh-client-runtime/client', () => ({
  createSnapshotStore<T>(initial: T) {
    let state = initial
    const listeners = new Set<() => void>()
    const notify = () => { for (const listener of listeners) listener() }
    return {
      getSnapshot: () => state,
      subscribe(listener: () => void) {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
      update(mutator: (draft: T) => void) {
        const next = structuredClone(state)
        mutator(next)
        state = next
        notify()
      },
      set(next: T) {
        state = next
        notify()
      },
    }
  },
}))

function participant(phase: LanRoomParticipantView['room']['phase'] = 'lobby'): LanRoomParticipantView {
  return {
    memberId: 'session-a',
    role: 'coordinator',
    connection: 'connected',
    strategyPrompt: 'Keep bombs.',
    joinUrls: ['ws://127.0.0.1:4000/'],
    gameSessionState: phase === 'running' ? 'ready' : 'absent',
    room: {
      id: 'room-a',
      code: '123456',
      revision: 2,
      phase,
      coordinatorId: 'session-a',
      maxMembers: 3,
      members: [{ id: 'session-a', seat: 0, ready: false, connected: true, promptHash: 'a'.repeat(64) }],
    },
  }
}

function remote(): LanRoomRemote {
  return {
    status: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
    host: vi.fn().mockResolvedValue({ ok: true, value: participant() }),
    join: vi.fn().mockResolvedValue({ ok: true, value: participant() }),
    updatePrompt: vi.fn().mockResolvedValue({ ok: true, value: participant() }),
    setReady: vi.fn().mockResolvedValue({ ok: true, value: participant('running') }),
    leave: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
  }
}

describe('LanGameClient', () => {
  it('loads idle state, serializes mutations, and retains the Host projection', async () => {
    const api = remote()
    const client = new LanGameClient('session-a' as SessionId, api)
    const stop = client.start()
    await expect.poll(() => client.store.getSnapshot().status).toBe('idle')

    await client.host('Keep bombs.')
    expect(api.host).toHaveBeenCalledWith('session-a', { strategyPrompt: 'Keep bombs.' })
    expect(client.store.getSnapshot()).toMatchObject({ status: 'room', participant: { room: { code: '123456' } }, pending: false })
    await client.setReady(true)
    expect(client.store.getSnapshot().participant?.room.phase).toBe('running')
    await client.leave()
    expect(client.store.getSnapshot()).toMatchObject({ status: 'idle', participant: undefined })
    stop()
  })

  it('renders Remote and carrier failures through one local error field', async () => {
    const api = remote()
    vi.mocked(api.host).mockResolvedValue({ ok: false, error: { code: 'denied', message: 'not available', details: {} } })
    const client = new LanGameClient('session-a' as SessionId, api)
    await client.host('Keep bombs.')
    expect(client.store.getSnapshot().error).toBe('not available (denied)')

    vi.mocked(api.status).mockRejectedValue(new Error('connection lost'))
    const stop = client.start()
    await expect.poll(() => client.store.getSnapshot().error).toBe('connection lost')
    stop()
  })
})
