/** Public identities, snapshots, and commands for authoritative LAN rooms. */
import type { Branded } from '@deepseek-ai/dsh-brand';
/** Stable identity of one active LAN room. */
export type LanRoomId = Branded<'LanRoomId'>;
/**
 * Brand a generated room identity.
 * @param value - validated opaque room identity.
 * @returns the same string branded for room APIs.
 */
export declare function LanRoomId(value: string): LanRoomId;
/** Stable identity of one participant installation within a room. */
export type LanMemberId = Branded<'LanMemberId'>;
/**
 * Brand a validated participant identity.
 * @param value - validated opaque member identity.
 * @returns the same string branded for member APIs.
 */
export declare function LanMemberId(value: string): LanMemberId;
/** Six-digit pairing code displayed only while a room accepts joins. */
export type LanRoomCode = Branded<'LanRoomCode'>;
/**
 * Brand a generated room pairing code.
 * @param value - validated six-digit code.
 * @returns the same string branded for pairing APIs.
 */
export declare function LanRoomCode(value: string): LanRoomCode;
/** Authoritative room lifecycle. */
export type LanRoomPhase = 'lobby' | 'locked' | 'running' | 'finished';
/** Public participant row retained by the coordinator. */
export interface LanRoomMemberSnapshot {
    readonly id: LanMemberId;
    readonly seat: number;
    readonly ready: boolean;
    readonly connected: boolean;
    /** SHA-256 of the local prompt; prompt text never enters room state. */
    readonly promptHash?: string;
}
/** Detached current room value returned after every accepted command. */
export interface LanRoomSnapshot {
    readonly id: LanRoomId;
    readonly code: LanRoomCode;
    readonly revision: number;
    readonly phase: LanRoomPhase;
    readonly coordinatorId: LanMemberId;
    readonly maxMembers: number;
    readonly members: readonly LanRoomMemberSnapshot[];
    readonly result?: string;
}
/** Exact participant count of the first LAN room protocol. */
export declare const LAN_ROOM_MEMBER_COUNT = 3;
/** Create one room with its coordinator occupying seat zero. */
export interface CreateLanRoomRequest {
    readonly coordinatorId: LanMemberId;
}
/** Join one lobby using its pairing code. */
export interface JoinLanRoomRequest {
    readonly code: LanRoomCode;
    readonly memberId: LanMemberId;
}
/** Compare-and-set prompt-hash update; it also clears readiness. */
export interface UpdateLanPromptRequest {
    readonly roomId: LanRoomId;
    readonly memberId: LanMemberId;
    readonly expectedRevision: number;
    readonly promptHash: string;
}
/** Compare-and-set readiness update. */
export interface SetLanReadyRequest {
    readonly roomId: LanRoomId;
    readonly memberId: LanMemberId;
    readonly expectedRevision: number;
    readonly ready: boolean;
}
/** Coordinator-only compare-and-set transition into autonomous execution. */
export interface StartLanRoomRequest {
    readonly roomId: LanRoomId;
    readonly coordinatorId: LanMemberId;
    readonly expectedRevision: number;
}
/** Coordinator-only compare-and-set settlement. */
export interface FinishLanRoomRequest {
    readonly roomId: LanRoomId;
    readonly coordinatorId: LanMemberId;
    readonly expectedRevision: number;
    readonly result: string;
}
/** Update the coordinator-observed connection state of one member. */
export interface SetLanConnectedRequest {
    readonly roomId: LanRoomId;
    readonly memberId: LanMemberId;
    readonly expectedRevision: number;
    readonly connected: boolean;
}
/** Leave one lobby before prompts are locked. */
export interface LeaveLanRoomRequest {
    readonly roomId: LanRoomId;
    readonly memberId: LanMemberId;
    readonly expectedRevision: number;
}
/** Machine-readable room-operation failure codes. */
export type LanRoomErrorCode = 'LAN_ROOM_INVALID_ARGUMENT' | 'LAN_ROOM_NOT_FOUND' | 'LAN_ROOM_CODE_NOT_FOUND' | 'LAN_ROOM_MEMBER_EXISTS' | 'LAN_ROOM_MEMBER_NOT_FOUND' | 'LAN_ROOM_FULL' | 'LAN_ROOM_STALE_REVISION' | 'LAN_ROOM_INVALID_PHASE' | 'LAN_ROOM_PROMPT_REQUIRED' | 'LAN_ROOM_NOT_COORDINATOR';
/** Notification emitted only after an authoritative room mutation commits. */
export interface LanRoomChanged {
    readonly kind: 'updated' | 'removed';
    readonly room: LanRoomSnapshot;
}
//# sourceMappingURL=types.d.ts.map