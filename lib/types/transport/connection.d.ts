/** Host-side participant connection to one coordinator-owned LAN room. */
import type { JsonValue } from '@deepseek-ai/dsh-session/types';
import { LanMemberId, type LanRoomSnapshot } from '../room/index.ts';
/** Observable lifecycle state for UI/control projections. */
export type LanRoomConnectionState = {
    readonly status: 'connecting';
} | {
    readonly status: 'connected';
} | {
    readonly status: 'reconnecting';
    readonly attempt: number;
    readonly delayMs: number;
    readonly reason: string;
} | {
    readonly status: 'closed';
    readonly reason: string;
};
/** Bounded exponential retry policy used after an authenticated socket is lost. */
export interface LanRoomReconnectPolicy {
    readonly maxAttempts?: number;
    readonly initialDelayMs?: number;
    readonly maxDelayMs?: number;
    readonly handshakeTimeoutMs?: number;
}
/** Initial participant handshake and committed-snapshot callbacks. */
export interface ConnectLanRoomRequest {
    readonly url: string;
    readonly code: string;
    readonly memberId: string;
    /** Durable identity used when this process is restarting an existing participant. */
    readonly resume?: {
        readonly roomId: string;
        readonly token: string;
    };
    readonly reconnect?: LanRoomReconnectPolicy;
    readonly onConnectionState?: (state: LanRoomConnectionState) => void;
    readonly onSnapshot?: (room: LanRoomSnapshot) => void;
    /** Called once when the connection permanently closes, not for recoverable socket loss. */
    readonly onClosed?: (reason: string) => void;
    readonly onDecisionRequest?: (request: {
        readonly requestId: string;
        readonly stateVersion: number;
        readonly state: JsonValue;
    }) => void;
    readonly onGameSnapshot?: (game: JsonValue) => void;
    readonly onPrivateGameSnapshot?: (game: JsonValue) => void;
}
/** One authenticated participant connection with revision-aware mutations. */
export interface LanRoomConnection {
    readonly memberId: ReturnType<typeof LanMemberId>;
    readonly coordinatorUrl: string;
    resumeToken(): string;
    snapshot(): LanRoomSnapshot;
    updatePrompt(promptHash: string): Promise<LanRoomSnapshot>;
    setReady(ready: boolean): Promise<LanRoomSnapshot>;
    leave(): Promise<LanRoomSnapshot>;
    respondDecision(requestId: string, stateVersion: number, action: JsonValue): void;
    close(): Promise<void>;
}
/**
 * Open and authenticate one Host-side participant connection.
 * @param request - coordinator URL, pairing identity, and lifecycle callbacks.
 * @returns authenticated connection after the joined response arrives.
 */
export declare function connectLanRoom(request: ConnectLanRoomRequest): Promise<LanRoomConnection>;
//# sourceMappingURL=connection.d.ts.map