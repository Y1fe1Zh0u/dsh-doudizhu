/** Versioned JSON messages accepted by the restricted LAN room WebSocket. */
import { LanMemberId, LanRoomCode, LanRoomId, type LanRoomErrorCode, type LanRoomSnapshot } from '../room/index.ts';
import type { JsonValue } from '@deepseek-ai/dsh-session/types';
/** Initial trusted-LAN room wire version. */
export declare const LAN_ROOM_WIRE_VERSION = 1;
/** Client message accepted before a socket has a room identity. */
export type LanRoomHandshakeMessage = {
    version: 1;
    type: 'join';
    messageId: string;
    code: LanRoomCode;
    memberId: LanMemberId;
} | {
    version: 1;
    type: 'resume';
    messageId: string;
    roomId: LanRoomId;
    memberId: LanMemberId;
    token: string;
};
/** Authenticated room mutation sent by one participant. */
export type LanRoomCommandMessage = {
    version: 1;
    type: 'update-prompt';
    messageId: string;
    expectedRevision: number;
    promptHash: string;
} | {
    version: 1;
    type: 'set-ready';
    messageId: string;
    expectedRevision: number;
    ready: boolean;
} | {
    version: 1;
    type: 'leave';
    messageId: string;
    expectedRevision: number;
};
/** Hidden Game Session decision returned to the coordinator. */
export interface LanRoomDecisionResponseMessage {
    readonly version: 1;
    readonly type: 'decision-response';
    readonly requestId: string;
    readonly stateVersion: number;
    readonly action: JsonValue;
}
/** Every client-to-coordinator message. */
export type LanRoomClientMessage = LanRoomHandshakeMessage | LanRoomCommandMessage | LanRoomDecisionResponseMessage;
/** Private decision request sent only to its addressed member. */
export interface LanRoomDecisionRequestMessage {
    readonly version: 1;
    readonly type: 'decision-request';
    readonly requestId: string;
    readonly stateVersion: number;
    readonly state: JsonValue;
}
/** Public game snapshot broadcast to all three local browser projections. */
export interface LanRoomGameSnapshotMessage {
    readonly version: 1;
    readonly type: 'game-snapshot';
    readonly game: JsonValue;
}
/** Seat-private browser snapshot sent only to its addressed Host peer. */
export interface LanRoomPrivateGameSnapshotMessage {
    readonly version: 1;
    readonly type: 'private-game-snapshot';
    readonly game: JsonValue;
}
/** Every coordinator-to-client message. */
export type LanRoomServerMessage = {
    version: 1;
    type: 'joined';
    messageId: string;
    token: string;
    room: LanRoomSnapshot;
} | {
    version: 1;
    type: 'ack';
    messageId: string;
    room: LanRoomSnapshot;
} | {
    version: 1;
    type: 'snapshot';
    room: LanRoomSnapshot;
} | {
    version: 1;
    type: 'room-closed';
    roomId: LanRoomId;
} | LanRoomDecisionRequestMessage | LanRoomGameSnapshotMessage | LanRoomPrivateGameSnapshotMessage | {
    version: 1;
    type: 'error';
    messageId?: string;
    code: LanRoomErrorCode | 'LAN_ROOM_WIRE_INVALID';
    message: string;
    room?: LanRoomSnapshot;
};
/**
 * Parse and validate one complete client text frame.
 * @param text - UTF-8 JSON text from one WebSocket frame.
 * @returns detached supported client message.
 */
export declare function parseLanRoomClientMessage(text: string): LanRoomClientMessage;
/**
 * Parse and validate one complete coordinator text frame.
 * @param text - UTF-8 JSON text from one WebSocket frame.
 * @returns detached supported server message.
 */
export declare function parseLanRoomServerMessage(text: string): LanRoomServerMessage;
//# sourceMappingURL=protocol.d.ts.map