import { n as validateLanRoomSnapshot, r as LanRoomError, t as LanRoom } from "./room-0-HVl5QA.js";
import { randomInt, randomUUID } from "node:crypto";
import { Service } from "@deepseek-ai/cordis";
//#region lib/types/room/types.js
/** Public identities, snapshots, and commands for authoritative LAN rooms. */
/**
* Brand a generated room identity.
* @param value - validated opaque room identity.
* @returns the same string branded for room APIs.
*/
function LanRoomId(value) {
	return value;
}
/**
* Brand a validated participant identity.
* @param value - validated opaque member identity.
* @returns the same string branded for member APIs.
*/
function LanMemberId(value) {
	return value;
}
/**
* Brand a generated room pairing code.
* @param value - validated six-digit code.
* @returns the same string branded for pairing APIs.
*/
function LanRoomCode(value) {
	return value;
}
/** Exact participant count of the first LAN room protocol. */
const LAN_ROOM_MEMBER_COUNT = 3;
//#endregion
//#region lib/types/room/index.js
/** Authoritative in-process room service for trusted-LAN multi-Agent applications. */
/** Registry and command owner for active authoritative rooms. */
var LanRooms = class extends Service {
	rooms = /* @__PURE__ */ new Map();
	codes = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	/** Create the room registry. */
	constructor(ctx) {
		super(ctx, "lanRooms");
	}
	/**
	* Create a room and place its coordinator in seat zero.
	* @param request - coordinator identity for the new room.
	* @returns initial detached room snapshot.
	*/
	create(request) {
		assertMemberId(request.coordinatorId);
		const id = LanRoomId(`lan-room-${randomUUID()}`);
		const code = this.allocateCode();
		const room = new LanRoom(id, code, request.coordinatorId, 3);
		this.rooms.set(id, room);
		this.codes.set(code, id);
		return this.publish(room.snapshot());
	}
	/**
	* Join an existing lobby by pairing code.
	* @param request - pairing code and new member identity.
	* @returns committed room snapshot.
	*/
	join(request) {
		assertMemberId(request.memberId);
		const roomId = this.codes.get(request.code);
		if (roomId === void 0) throw new LanRoomError(`no active room uses code ${JSON.stringify(request.code)}`, "LAN_ROOM_CODE_NOT_FOUND");
		return this.publish(this.room(roomId).join(request.memberId));
	}
	/**
	* Return one detached room snapshot.
	* @param roomId - stable room identity.
	* @returns current snapshot, or undefined when no active room has the id.
	*/
	get(roomId) {
		return this.rooms.get(roomId)?.snapshot();
	}
	/**
	* List detached room snapshots in creation order.
	* @returns current active rooms with detached member rows.
	*/
	list() {
		return [...this.rooms.values()].map((room) => room.snapshot());
	}
	/**
	* Rehydrate one durable room identity before transport/runtime startup.
	* This is not a user command: it preserves the exact revision and does not emit a synthetic mutation.
	* @param snapshot - validated durable authoritative state.
	* @returns the detached restored snapshot.
	*/
	restore(snapshot) {
		if (this.rooms.has(snapshot.id)) throw new LanRoomError(`room ${JSON.stringify(snapshot.id)} is already active`, "LAN_ROOM_INVALID_ARGUMENT");
		if (this.codes.has(snapshot.code)) throw new LanRoomError(`pairing code ${JSON.stringify(snapshot.code)} is already active`, "LAN_ROOM_INVALID_ARGUMENT");
		const room = LanRoom.restore(snapshot);
		this.rooms.set(snapshot.id, room);
		this.codes.set(snapshot.code, snapshot.id);
		return room.snapshot();
	}
	/**
	* Replace one prompt hash and clear readiness.
	* @param request - addressed member update and expected revision.
	* @returns committed room snapshot.
	*/
	updatePrompt(request) {
		return this.publish(this.room(request.roomId).updatePrompt(request));
	}
	/**
	* Update readiness; the final required ready member locks the room.
	* @param request - addressed readiness update and expected revision.
	* @returns committed room snapshot.
	*/
	setReady(request) {
		return this.publish(this.room(request.roomId).setReady(request));
	}
	/**
	* Start autonomous execution from a locked room.
	* @param request - coordinator-authorized start command.
	* @returns committed running snapshot.
	*/
	start(request) {
		return this.publish(this.room(request.roomId).start(request));
	}
	/**
	* Commit one terminal result.
	* @param request - coordinator-authorized settlement command.
	* @returns committed finished snapshot.
	*/
	finish(request) {
		return this.publish(this.room(request.roomId).finish(request));
	}
	/**
	* Record one member transport connection edge.
	* @param request - addressed connection update and expected revision.
	* @returns committed room snapshot.
	*/
	setConnected(request) {
		return this.publish(this.room(request.roomId).setConnected(request));
	}
	/**
	* Leave a lobby before lock.
	* @param request - departing member and expected revision.
	* @returns committed lobby snapshot.
	*/
	leave(request) {
		return this.publish(this.room(request.roomId).leave(request.memberId, request.expectedRevision));
	}
	/**
	* Close a room and release its pairing code; only its coordinator may call.
	* @param roomId - active room identity.
	* @param coordinatorId - exact coordinator identity.
	*/
	close(roomId, coordinatorId) {
		const snapshot = this.room(roomId).snapshot();
		if (snapshot.coordinatorId !== coordinatorId) throw new LanRoomError(`member ${JSON.stringify(coordinatorId)} is not the room coordinator`, "LAN_ROOM_NOT_COORDINATOR");
		this.rooms.delete(roomId);
		this.codes.delete(snapshot.code);
		this.publish(snapshot, "removed");
	}
	/**
	* Subscribe to committed room snapshots.
	* @param listener - callback receiving updated and removed snapshots.
	* @returns disposer that stops future notifications.
	*/
	onChanged(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	room(roomId) {
		const room = this.rooms.get(roomId);
		if (room === void 0) throw new LanRoomError(`room ${JSON.stringify(roomId)} does not exist`, "LAN_ROOM_NOT_FOUND");
		return room;
	}
	allocateCode() {
		for (let attempt = 0; attempt < 100; attempt += 1) {
			const code = LanRoomCode(String(randomInt(0, 1e6)).padStart(6, "0"));
			if (!this.codes.has(code)) return code;
		}
		throw new Error("lan-room: failed to allocate a unique pairing code");
	}
	publish(room, kind = "updated") {
		for (const listener of this.listeners) listener({
			kind,
			room
		});
		return room;
	}
};
function assertMemberId(memberId) {
	if (memberId.length === 0 || memberId.length > 128 || memberId.trim() !== memberId) throw new LanRoomError("memberId must contain 1 to 128 characters with no surrounding whitespace", "LAN_ROOM_INVALID_ARGUMENT");
}
//#endregion
export { LAN_ROOM_MEMBER_COUNT, LanMemberId, LanRoomCode, LanRoomError, LanRoomId, LanRooms as default, validateLanRoomSnapshot };
