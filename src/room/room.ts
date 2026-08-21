/** Pure authoritative state transitions for one LAN room. */

import type {
  FinishLanRoomRequest,
  LanMemberId,
  LanRoomCode,
  LanRoomId,
  LanRoomPhase,
  LanRoomSnapshot,
  SetLanConnectedRequest,
  SetLanReadyRequest,
  StartLanRoomRequest,
  UpdateLanPromptRequest,
} from './types.ts'
import { LanRoomError } from './error.ts'

const PROMPT_HASH = /^[0-9a-f]{64}$/u

interface MutableMember {
  readonly id: LanMemberId
  seat: number
  ready: boolean
  connected: boolean
  promptHash?: string
}

/** In-memory authority for one room; callers retain only detached snapshots. */
export class LanRoom {
  private revision = 0
  private phase: LanRoomPhase = 'lobby'
  private result: string | undefined
  private readonly members: MutableMember[]

  /** Initialize one room with the coordinator at seat zero. */
  constructor(
    readonly id: LanRoomId,
    readonly code: LanRoomCode,
    readonly coordinatorId: LanMemberId,
    readonly maxMembers: number,
  ) {
    this.members = [{ id: coordinatorId, seat: 0, ready: false, connected: true }]
  }

  /**
   * Rehydrate one previously validated authoritative snapshot without replaying commands.
   * @param snapshot - exact durable room state, including revision and seat ownership.
   * @returns an independent mutable authority whose first mutation continues from that revision.
   */
  static restore(snapshot: LanRoomSnapshot): LanRoom {
    const failures = validateLanRoomSnapshot(snapshot)
    if (failures.length > 0) {
      throw new LanRoomError(`cannot restore invalid room snapshot: ${failures.join('; ')}`, 'LAN_ROOM_INVALID_ARGUMENT')
    }
    const room = new LanRoom(snapshot.id, snapshot.code, snapshot.coordinatorId, snapshot.maxMembers)
    room.revision = snapshot.revision
    room.phase = snapshot.phase
    room.result = snapshot.result
    room.members.splice(0, room.members.length, ...snapshot.members.map(member => ({ ...member })))
    return room
  }

  /**
   * Return a detached, seat-ordered snapshot.
   * @returns current room state with detached member rows.
   */
  snapshot(): LanRoomSnapshot {
    return {
      id: this.id,
      code: this.code,
      revision: this.revision,
      phase: this.phase,
      coordinatorId: this.coordinatorId,
      maxMembers: this.maxMembers,
      members: this.members.map(member => ({ ...member })),
      ...this.result === undefined ? {} : { result: this.result },
    }
  }

  /**
   * Add one connected member to the next seat in a lobby.
   * @param memberId - participant identity not already present.
   * @returns committed room snapshot.
   */
  join(memberId: LanMemberId): LanRoomSnapshot {
    this.requirePhase('lobby')
    if (this.members.some(member => member.id === memberId)) {
      throw new LanRoomError(`member ${JSON.stringify(memberId)} already joined room ${JSON.stringify(this.id)}`, 'LAN_ROOM_MEMBER_EXISTS')
    }
    if (this.members.length >= this.maxMembers) {
      throw new LanRoomError(`room ${JSON.stringify(this.id)} already has ${this.maxMembers} members`, 'LAN_ROOM_FULL')
    }
    this.members.push({ id: memberId, seat: this.members.length, ready: false, connected: true })
    return this.commit()
  }

  /**
   * Replace one local prompt hash and clear that member's readiness.
   * @param request - member, digest, and expected room revision.
   * @returns committed room snapshot.
   */
  updatePrompt(request: UpdateLanPromptRequest): LanRoomSnapshot {
    this.requireRevision(request.expectedRevision)
    this.requirePhase('lobby')
    if (!PROMPT_HASH.test(request.promptHash)) {
      throw new LanRoomError('promptHash must be a lowercase SHA-256 hex digest', 'LAN_ROOM_INVALID_ARGUMENT')
    }
    const member = this.member(request.memberId)
    member.promptHash = request.promptHash
    member.ready = false
    return this.commit()
  }

  /**
   * Update readiness and lock exactly when every required seat is ready.
   * @param request - member readiness and expected room revision.
   * @returns committed room snapshot.
   */
  setReady(request: SetLanReadyRequest): LanRoomSnapshot {
    this.requireRevision(request.expectedRevision)
    this.requirePhase('lobby')
    const member = this.member(request.memberId)
    if (request.ready && member.promptHash === undefined) {
      throw new LanRoomError(`member ${JSON.stringify(member.id)} must set a prompt before becoming ready`, 'LAN_ROOM_PROMPT_REQUIRED')
    }
    if (request.ready && !member.connected) {
      throw new LanRoomError(`member ${JSON.stringify(member.id)} must be connected before becoming ready`, 'LAN_ROOM_INVALID_ARGUMENT')
    }
    member.ready = request.ready
    if (this.members.length === this.maxMembers
      && this.members.every(candidate => candidate.ready && candidate.connected)) {
      this.phase = 'locked'
    }
    return this.commit()
  }

  /**
   * Enter autonomous execution after the coordinator observes the locked snapshot.
   * @param request - coordinator identity and expected locked revision.
   * @returns committed running snapshot.
   */
  start(request: StartLanRoomRequest): LanRoomSnapshot {
    this.requireRevision(request.expectedRevision)
    this.requireCoordinator(request.coordinatorId)
    this.requirePhase('locked')
    this.phase = 'running'
    return this.commit()
  }

  /**
   * Commit one terminal result.
   * @param request - coordinator identity, expected revision, and bounded result.
   * @returns committed finished snapshot.
   */
  finish(request: FinishLanRoomRequest): LanRoomSnapshot {
    this.requireRevision(request.expectedRevision)
    this.requireCoordinator(request.coordinatorId)
    this.requirePhase('running')
    const result = request.result.trim()
    if (result.length === 0 || result.length > 256) {
      throw new LanRoomError('result must contain 1 to 256 characters', 'LAN_ROOM_INVALID_ARGUMENT')
    }
    this.result = result
    this.phase = 'finished'
    return this.commit()
  }

  /**
   * Record one member's current transport reachability.
   * @param request - member connection state and expected room revision.
   * @returns committed room snapshot.
   */
  setConnected(request: SetLanConnectedRequest): LanRoomSnapshot {
    this.requireRevision(request.expectedRevision)
    const member = this.member(request.memberId)
    member.connected = request.connected
    if (!request.connected && this.phase === 'lobby') member.ready = false
    return this.commit()
  }

  /**
   * Remove one non-coordinator member before lock and compact remaining seats.
   * @param memberId - departing participant identity.
   * @param expectedRevision - compare-and-set room revision.
   * @returns committed lobby snapshot.
   */
  leave(memberId: LanMemberId, expectedRevision: number): LanRoomSnapshot {
    this.requireRevision(expectedRevision)
    this.requirePhase('lobby')
    if (memberId === this.coordinatorId) {
      throw new LanRoomError('the coordinator closes the room through the owning service', 'LAN_ROOM_NOT_COORDINATOR')
    }
    const index = this.members.findIndex(member => member.id === memberId)
    if (index < 0) this.member(memberId)
    this.members.splice(index, 1)
    this.members.forEach((member, seat) => { member.seat = seat })
    return this.commit()
  }

  private member(memberId: LanMemberId): MutableMember {
    const found = this.members.find(member => member.id === memberId)
    if (found === undefined) {
      throw new LanRoomError(`member ${JSON.stringify(memberId)} is not in room ${JSON.stringify(this.id)}`, 'LAN_ROOM_MEMBER_NOT_FOUND')
    }
    return found
  }

  private requireRevision(expected: number): void {
    if (!Number.isSafeInteger(expected) || expected < 0) {
      throw new LanRoomError('expectedRevision must be a non-negative safe integer', 'LAN_ROOM_INVALID_ARGUMENT')
    }
    if (expected !== this.revision) {
      throw new LanRoomError(`room ${JSON.stringify(this.id)} is at revision ${this.revision}, not ${expected}`, 'LAN_ROOM_STALE_REVISION')
    }
  }

  private requirePhase(expected: LanRoomPhase): void {
    if (this.phase !== expected) {
      throw new LanRoomError(`room ${JSON.stringify(this.id)} is ${this.phase}, expected ${expected}`, 'LAN_ROOM_INVALID_PHASE')
    }
  }

  private requireCoordinator(memberId: LanMemberId): void {
    if (memberId !== this.coordinatorId) {
      throw new LanRoomError(`member ${JSON.stringify(memberId)} is not the room coordinator`, 'LAN_ROOM_NOT_COORDINATOR')
    }
  }

  private commit(): LanRoomSnapshot {
    this.revision += 1
    return this.snapshot()
  }
}

/**
 * Validate relationships in a detached room snapshot.
 * @param snapshot - candidate room value.
 * @returns diagnostics; empty means every owned relationship is coherent.
 */
export function validateLanRoomSnapshot(snapshot: LanRoomSnapshot): string[] {
  const failures: string[] = []
  if (!Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0) failures.push('revision must be a non-negative safe integer')
  if (!Number.isSafeInteger(snapshot.maxMembers) || snapshot.maxMembers < 2) failures.push('maxMembers must be an integer of at least two')
  if (snapshot.members.length > snapshot.maxMembers) failures.push('member count exceeds maxMembers')
  if (!snapshot.members.some(member => member.id === snapshot.coordinatorId && member.seat === 0)) failures.push('coordinator must occupy seat zero')
  const ids = new Set<LanMemberId>()
  const seats = new Set<number>()
  for (const member of snapshot.members) {
    if (ids.has(member.id)) failures.push(`duplicate member id ${JSON.stringify(member.id)}`)
    if (seats.has(member.seat)) failures.push(`duplicate seat ${member.seat}`)
    ids.add(member.id)
    seats.add(member.seat)
    if (!Number.isSafeInteger(member.seat) || member.seat < 0 || member.seat >= snapshot.maxMembers) failures.push(`invalid seat ${member.seat}`)
    if (member.promptHash !== undefined && !PROMPT_HASH.test(member.promptHash)) failures.push(`member ${JSON.stringify(member.id)} has an invalid prompt hash`)
    if (member.ready && member.promptHash === undefined) failures.push(`ready member ${JSON.stringify(member.id)} has no prompt hash`)
  }
  if (snapshot.phase !== 'lobby' && (snapshot.members.length !== snapshot.maxMembers || snapshot.members.some(member => !member.ready))) {
    failures.push(`${snapshot.phase} room must have a full ready roster`)
  }
  if ((snapshot.phase === 'finished') !== (snapshot.result !== undefined)) failures.push('result must exist exactly for a finished room')
  return failures
}
