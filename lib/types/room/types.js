/** Public identities, snapshots, and commands for authoritative LAN rooms. */
/**
 * Brand a generated room identity.
 * @param value - validated opaque room identity.
 * @returns the same string branded for room APIs.
 */
export function LanRoomId(value) {
    return value;
}
/**
 * Brand a validated participant identity.
 * @param value - validated opaque member identity.
 * @returns the same string branded for member APIs.
 */
export function LanMemberId(value) {
    return value;
}
/**
 * Brand a generated room pairing code.
 * @param value - validated six-digit code.
 * @returns the same string branded for pairing APIs.
 */
export function LanRoomCode(value) {
    return value;
}
/** Exact participant count of the first LAN room protocol. */
export const LAN_ROOM_MEMBER_COUNT = 3;
//# sourceMappingURL=types.js.map