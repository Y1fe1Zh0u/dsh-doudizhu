/** React-free browser controller for the local LAN room Remote namespace. */
import { type SessionId, type SnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { HostLanRoomRequest, JoinLanRoomControlRequest, LanRoomParticipantView } from '../transport/client.ts';
/** Remote methods mounted from the LAN room Host package. */
export interface LanRoomRemote {
    readonly status: (sessionId: SessionId) => Promise<RemoteResult<LanRoomParticipantView | undefined>>;
    readonly host: (sessionId: SessionId, request: HostLanRoomRequest) => Promise<RemoteResult<LanRoomParticipantView>>;
    readonly join: (sessionId: SessionId, request: JoinLanRoomControlRequest) => Promise<RemoteResult<LanRoomParticipantView>>;
    readonly updatePrompt: (sessionId: SessionId, strategyPrompt: string) => Promise<RemoteResult<LanRoomParticipantView>>;
    readonly setReady: (sessionId: SessionId, ready: boolean) => Promise<RemoteResult<LanRoomParticipantView>>;
    readonly leave: (sessionId: SessionId) => Promise<RemoteResult<void>>;
}
/** Browser state rendered by one Session's card-table tab. */
export interface LanGameClientState {
    readonly status: 'loading' | 'idle' | 'room';
    readonly participant: LanRoomParticipantView | undefined;
    readonly pending: boolean;
    readonly error: string | undefined;
}
/** Polls the local Host projection and serializes user mutations. */
export declare class LanGameClient {
    private readonly sessionId;
    private readonly remote;
    /** Stable observable state source consumed by the conversation-view hook. */
    readonly store: SnapshotStore<LanGameClientState>;
    private timer;
    private refreshing;
    private fingerprint;
    private generation;
    /** @param sessionId - visible foreground Session owning the game participant. @param remote - mounted Host Remote namespace. */
    constructor(sessionId: SessionId, remote: LanRoomRemote);
    /**
     * Start polling immediately and every 750 ms.
     * @returns disposer that stops polling.
     */
    start(): () => void;
    /**
     * Create a coordinator room.
     * @param strategyPrompt - local pre-game strategy.
     * @returns after Host settlement.
     */
    host(strategyPrompt: string): Promise<void>;
    /**
     * Join a coordinator room.
     * @param request - coordinator URL, code, and strategy.
     * @returns after Host settlement.
     */
    join(request: JoinLanRoomControlRequest): Promise<void>;
    /**
     * Save the editable lobby Prompt.
     * @param strategyPrompt - replacement strategy.
     * @returns after Host settlement.
     */
    updatePrompt(strategyPrompt: string): Promise<void>;
    /**
     * Change readiness.
     * @param ready - requested state.
     * @returns after Host settlement.
     */
    setReady(ready: boolean): Promise<void>;
    /** Leave the current lobby. @returns after Host settlement. */
    leave(): Promise<void>;
    private refresh;
    private mutate;
    private publish;
}
//# sourceMappingURL=controller.d.ts.map