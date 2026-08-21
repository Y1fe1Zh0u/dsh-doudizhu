/** Package-owned relational checks for authoritative LAN room snapshots. */
import { validateLanRoomSnapshot } from "./room.js";
const PACKAGE_NAME = 'dsh-doudizhu/room';
/** Cordis companion plugin name. */
export const name = 'lan-room-invariant';
/** Invariant registry required before package checks can install. */
export const inject = ['invariants'];
/** Validate current snapshots and every committed change against service state. */
const install = Object.assign((ctx, fail) => {
    const validate = (room) => {
        for (const message of validateLanRoomSnapshot(room))
            fail(message);
    };
    for (const room of ctx.lanRooms.list())
        validate(room);
    ctx.lanRooms.onChanged(({ kind, room }) => {
        validate(room);
        const current = ctx.lanRooms.get(room.id);
        if (kind === 'updated' && current?.revision !== room.revision) {
            fail(`changed room ${JSON.stringify(room.id)} does not match authoritative service state`);
        }
        if (kind === 'removed' && current !== undefined)
            fail(`removed room ${JSON.stringify(room.id)} remains in authoritative service state`);
    });
}, { inject: ['lanRooms'] });
/** Register the LAN room invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map