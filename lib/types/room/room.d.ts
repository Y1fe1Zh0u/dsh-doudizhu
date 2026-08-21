/** Pure authoritative state transitions for one LAN room. */
import type { FinishLanRoomRequest, LanMemberId, LanRoomCode, LanRoomId, LanRoomSnapshot, SetLanConnectedRequest, SetLanReadyRequest, StartLanRoomRequest, UpdateLanPromptRequest } from './types.ts';
/** In-memory authority for one room; callers retain only detached snapshots. */
export declare class LanRoom {
    readonly id: LanRoomId;
    readonly code: LanRoomCode;
    readonly coordinatorId: LanMemberId;
    readonly maxMembers: number;
    private revision;
    private phase;
    private result;
    private readonly members;
    /** Initialize one room with the coordinator at seat zero. */
    constructor(id: LanRoomId, code: LanRoomCode, coordinatorId: LanMemberId, maxMembers: number);
    /**
     * Rehydrate one previously validated authoritative snapshot without replaying commands.
     * @param snapshot - exact durable room state, including revision and seat ownership.
     * @returns an independent mutable authority whose first mutation continues from that revision.
     */
    static restore(snapshot: LanRoomSnapshot): LanRoom;
    /**
     * Return a detached, seat-ordered snapshot.
     * @returns current room state with detached member rows.
     */
    snapshot(): LanRoomSnapshot;
    /**
     * Add one connected member to the next seat in a lobby.
     * @param memberId - participant identity not already present.
     * @returns committed room snapshot.
     */
    join(memberId: LanMemberId): LanRoomSnapshot;
    /**
     * Replace one local prompt hash and clear that member's readiness.
     * @param request - member, digest, and expected room revision.
     * @returns committed room snapshot.
     */
    updatePrompt(request: UpdateLanPromptRequest): LanRoomSnapshot;
    /**
     * Update readiness and lock exactly when every required seat is ready.
     * @param request - member readiness and expected room revision.
     * @returns committed room snapshot.
     */
    setReady(request: SetLanReadyRequest): LanRoomSnapshot;
    /**
     * Enter autonomous execution after the coordinator observes the locked snapshot.
     * @param request - coordinator identity and expected locked revision.
     * @returns committed running snapshot.
     */
    start(request: StartLanRoomRequest): LanRoomSnapshot;
    /**
     * Commit one terminal result.
     * @param request - coordinator identity, expected revision, and bounded result.
     * @returns committed finished snapshot.
     */
    finish(request: FinishLanRoomRequest): LanRoomSnapshot;
    /**
     * Record one member's current transport reachability.
     * @param request - member connection state and expected room revision.
     * @returns committed room snapshot.
     */
    setConnected(request: SetLanConnectedRequest): LanRoomSnapshot;
    /**
     * Remove one non-coordinator member before lock and compact remaining seats.
     * @param memberId - departing participant identity.
     * @param expectedRevision - compare-and-set room revision.
     * @returns committed lobby snapshot.
     */
    leave(memberId: LanMemberId, expectedRevision: number): LanRoomSnapshot;
    private member;
    private requireRevision;
    private requirePhase;
    private requireCoordinator;
    private commit;
}
/**
 * Validate relationships in a detached room snapshot.
 * @param snapshot - candidate room value.
 * @returns diagnostics; empty means every owned relationship is coherent.
 */
export declare function validateLanRoomSnapshot(snapshot: LanRoomSnapshot): string[];
//# sourceMappingURL=room.d.ts.map