/** Restricted coordinator-side WebSocket transport for one authoritative LAN room. */
import type { JsonValue } from '@deepseek-ai/dsh-session/types';
import LanRooms, { LanMemberId, type LanRoomId } from '../room/index.ts';
import { type LanRoomDecisionRequestMessage } from './protocol.ts';
export * from './protocol.ts';
export * from './connection.ts';
export type * from './client.ts';
/** Request for binding one room-specific coordinator listener. */
export interface ListenLanRoomRequest {
    readonly roomId: LanRoomId;
    readonly coordinatorId: ReturnType<typeof LanMemberId>;
    readonly host: string;
    readonly port?: number;
    /** Interval between coordinator WebSocket ping frames. Defaults to 10 seconds. */
    readonly heartbeatIntervalMs?: number;
    /** Maximum time without a pong before terminating a half-open socket. Defaults to 30 seconds. */
    readonly heartbeatTimeoutMs?: number;
    /** Maximum time a socket may remain unauthenticated. Defaults to 5 seconds. */
    readonly unauthenticatedHandshakeTimeoutMs?: number;
    /** Maximum simultaneous unauthenticated sockets across the listener. Defaults to 64. */
    readonly maxUnauthenticatedConnections?: number;
    /** Maximum simultaneous unauthenticated sockets from one remote address. Defaults to 8. */
    readonly maxUnauthenticatedConnectionsPerIp?: number;
    /** Resume tokens recovered from the coordinator's validated durable record. */
    readonly resumeTokens?: Readonly<Record<string, string>>;
}
/** Live coordinator listener and its explicit async disposer. */
export interface LanRoomListener {
    readonly host: string;
    readonly port: number;
    requestDecision(memberId: ReturnType<typeof LanMemberId>, request: Omit<LanRoomDecisionRequestMessage, 'version' | 'type'>, signal: AbortSignal): Promise<JsonValue>;
    publishGameSnapshot(game: JsonValue): void;
    publishPrivateGameSnapshot(memberId: ReturnType<typeof LanMemberId>, game: JsonValue): void;
    /** Return detached participant resume tokens for durable coordinator checkpoints. */
    resumeTokens(): Readonly<Record<string, string>>;
    close(): Promise<void>;
}
/**
 * Bind a restricted WebSocket endpoint for one room.
 * @param rooms - authoritative room service used for identity and mutations.
 * @param request - coordinator identity and listener address.
 * @returns live listener after the operating system accepts the bind.
 */
export declare function listenLanRoom(rooms: LanRooms, request: ListenLanRoomRequest): Promise<LanRoomListener>;
//# sourceMappingURL=gateway.d.ts.map