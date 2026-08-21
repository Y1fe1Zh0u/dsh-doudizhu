/** Authoritative in-process room service for trusted-LAN multi-Agent applications. */
import { Context, Service } from '@deepseek-ai/cordis';
import { LanRoomId, type CreateLanRoomRequest, type FinishLanRoomRequest, type JoinLanRoomRequest, type LanMemberId, type LanRoomChanged, type LanRoomSnapshot, type LeaveLanRoomRequest, type SetLanConnectedRequest, type SetLanReadyRequest, type StartLanRoomRequest, type UpdateLanPromptRequest } from './types.ts';
export * from './types.ts';
export * from './error.ts';
export { validateLanRoomSnapshot } from './room.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        lanRooms: LanRooms;
    }
}
/** Registry and command owner for active authoritative rooms. */
export default class LanRooms extends Service {
    private readonly rooms;
    private readonly codes;
    private readonly listeners;
    /** Create the room registry. */
    constructor(ctx: Context);
    /**
     * Create a room and place its coordinator in seat zero.
     * @param request - coordinator identity for the new room.
     * @returns initial detached room snapshot.
     */
    create(request: CreateLanRoomRequest): LanRoomSnapshot;
    /**
     * Join an existing lobby by pairing code.
     * @param request - pairing code and new member identity.
     * @returns committed room snapshot.
     */
    join(request: JoinLanRoomRequest): LanRoomSnapshot;
    /**
     * Return one detached room snapshot.
     * @param roomId - stable room identity.
     * @returns current snapshot, or undefined when no active room has the id.
     */
    get(roomId: LanRoomId): LanRoomSnapshot | undefined;
    /**
     * List detached room snapshots in creation order.
     * @returns current active rooms with detached member rows.
     */
    list(): LanRoomSnapshot[];
    /**
     * Rehydrate one durable room identity before transport/runtime startup.
     * This is not a user command: it preserves the exact revision and does not emit a synthetic mutation.
     * @param snapshot - validated durable authoritative state.
     * @returns the detached restored snapshot.
     */
    restore(snapshot: LanRoomSnapshot): LanRoomSnapshot;
    /**
     * Replace one prompt hash and clear readiness.
     * @param request - addressed member update and expected revision.
     * @returns committed room snapshot.
     */
    updatePrompt(request: UpdateLanPromptRequest): LanRoomSnapshot;
    /**
     * Update readiness; the final required ready member locks the room.
     * @param request - addressed readiness update and expected revision.
     * @returns committed room snapshot.
     */
    setReady(request: SetLanReadyRequest): LanRoomSnapshot;
    /**
     * Start autonomous execution from a locked room.
     * @param request - coordinator-authorized start command.
     * @returns committed running snapshot.
     */
    start(request: StartLanRoomRequest): LanRoomSnapshot;
    /**
     * Commit one terminal result.
     * @param request - coordinator-authorized settlement command.
     * @returns committed finished snapshot.
     */
    finish(request: FinishLanRoomRequest): LanRoomSnapshot;
    /**
     * Record one member transport connection edge.
     * @param request - addressed connection update and expected revision.
     * @returns committed room snapshot.
     */
    setConnected(request: SetLanConnectedRequest): LanRoomSnapshot;
    /**
     * Leave a lobby before lock.
     * @param request - departing member and expected revision.
     * @returns committed lobby snapshot.
     */
    leave(request: LeaveLanRoomRequest): LanRoomSnapshot;
    /**
     * Close a room and release its pairing code; only its coordinator may call.
     * @param roomId - active room identity.
     * @param coordinatorId - exact coordinator identity.
     */
    close(roomId: LanRoomId, coordinatorId: LanMemberId): void;
    /**
     * Subscribe to committed room snapshots.
     * @param listener - callback receiving updated and removed snapshots.
     * @returns disposer that stops future notifications.
     */
    onChanged(listener: (change: LanRoomChanged) => void): () => void;
    private room;
    private allocateCode;
    private publish;
}
//# sourceMappingURL=index.d.ts.map