import { n as validateLanRoomSnapshot, r as LanRoomError } from "./room-0-HVl5QA.js";
import { LanMemberId, LanRoomCode, LanRoomId } from "./room.js";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import "@deepseek-ai/cordis";
import { SessionId } from "@deepseek-ai/dsh-session";
import { networkInterfaces } from "node:os";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import WebSocket, { WebSocketServer } from "ws";
import { createServer } from "node:http";
//#region lib/types/transport/protocol.js
/** Versioned JSON messages accepted by the restricted LAN room WebSocket. */
/** Initial trusted-LAN room wire version. */
const LAN_ROOM_WIRE_VERSION = 1;
/**
* Parse and validate one complete client text frame.
* @param text - UTF-8 JSON text from one WebSocket frame.
* @returns detached supported client message.
*/
function parseLanRoomClientMessage(text) {
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		throw new Error("message must be valid JSON");
	}
	if (!record(value) || value.version !== 1 || typeof value.type !== "string") throw new Error("message must contain supported version and type fields");
	switch (value.type) {
		case "join": return {
			version: 1,
			type: "join",
			messageId: requiredString(value.messageId, "messageId", 128),
			code: LanRoomCode(exactDigits(value.code, "code", 6)),
			memberId: LanMemberId(requiredString(value.memberId, "memberId", 128))
		};
		case "resume": return {
			version: 1,
			type: "resume",
			messageId: requiredString(value.messageId, "messageId", 128),
			roomId: LanRoomId(requiredString(value.roomId, "roomId", 256)),
			memberId: LanMemberId(requiredString(value.memberId, "memberId", 128)),
			token: exactHex(value.token, "token", 64)
		};
		case "update-prompt": return {
			version: 1,
			type: "update-prompt",
			messageId: requiredString(value.messageId, "messageId", 128),
			expectedRevision: revision(value.expectedRevision),
			promptHash: exactHex(value.promptHash, "promptHash", 64)
		};
		case "set-ready":
			if (typeof value.ready !== "boolean") throw new Error("ready must be boolean");
			return {
				version: 1,
				type: "set-ready",
				messageId: requiredString(value.messageId, "messageId", 128),
				expectedRevision: revision(value.expectedRevision),
				ready: value.ready
			};
		case "leave": return {
			version: 1,
			type: "leave",
			messageId: requiredString(value.messageId, "messageId", 128),
			expectedRevision: revision(value.expectedRevision)
		};
		case "decision-response": return {
			version: 1,
			type: "decision-response",
			requestId: requiredString(value.requestId, "requestId", 128),
			stateVersion: revision(value.stateVersion, "stateVersion"),
			action: jsonValue(value.action, "action")
		};
		default: throw new Error(`unsupported message type ${JSON.stringify(value.type)}`);
	}
}
/**
* Parse and validate one complete coordinator text frame.
* @param text - UTF-8 JSON text from one WebSocket frame.
* @returns detached supported server message.
*/
function parseLanRoomServerMessage(text) {
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		throw new Error("message must be valid JSON");
	}
	if (!record(value) || value.version !== 1 || typeof value.type !== "string") throw new Error("message must contain supported version and type fields");
	switch (value.type) {
		case "joined": return {
			version: 1,
			type: "joined",
			messageId: requiredString(value.messageId, "messageId", 128),
			token: exactHex(value.token, "token", 64),
			room: roomSnapshot$1(value.room)
		};
		case "ack": return {
			version: 1,
			type: "ack",
			messageId: requiredString(value.messageId, "messageId", 128),
			room: roomSnapshot$1(value.room)
		};
		case "snapshot": return {
			version: 1,
			type: "snapshot",
			room: roomSnapshot$1(value.room)
		};
		case "room-closed": return {
			version: 1,
			type: "room-closed",
			roomId: LanRoomId(requiredString(value.roomId, "roomId", 256))
		};
		case "decision-request": return {
			version: 1,
			type: "decision-request",
			requestId: requiredString(value.requestId, "requestId", 128),
			stateVersion: revision(value.stateVersion, "stateVersion"),
			state: jsonValue(value.state, "state")
		};
		case "game-snapshot": return {
			version: 1,
			type: "game-snapshot",
			game: jsonValue(value.game, "game")
		};
		case "private-game-snapshot": return {
			version: 1,
			type: "private-game-snapshot",
			game: jsonValue(value.game, "game")
		};
		case "error": {
			const code = requiredString(value.code, "code", 128);
			if (!SERVER_ERROR_CODES.has(code)) throw new Error(`unsupported error code ${JSON.stringify(code)}`);
			return {
				version: 1,
				type: "error",
				code,
				message: requiredString(value.message, "message", 4096),
				...value.messageId === void 0 ? {} : { messageId: requiredString(value.messageId, "messageId", 128) },
				...value.room === void 0 ? {} : { room: roomSnapshot$1(value.room) }
			};
		}
		default: throw new Error(`unsupported message type ${JSON.stringify(value.type)}`);
	}
}
const SERVER_ERROR_CODES = /* @__PURE__ */ new Set([
	"LAN_ROOM_INVALID_ARGUMENT",
	"LAN_ROOM_NOT_FOUND",
	"LAN_ROOM_CODE_NOT_FOUND",
	"LAN_ROOM_MEMBER_EXISTS",
	"LAN_ROOM_MEMBER_NOT_FOUND",
	"LAN_ROOM_FULL",
	"LAN_ROOM_STALE_REVISION",
	"LAN_ROOM_INVALID_PHASE",
	"LAN_ROOM_PROMPT_REQUIRED",
	"LAN_ROOM_NOT_COORDINATOR",
	"LAN_ROOM_WIRE_INVALID"
]);
function roomSnapshot$1(value) {
	if (!record(value) || !Array.isArray(value.members)) throw new Error("room must be an object with a members array");
	if (!ROOM_PHASES.has(String(value.phase))) throw new Error("room phase is unsupported");
	const members = value.members.map((member, index) => {
		if (!record(member)) throw new Error(`room member ${index} must be an object`);
		if (typeof member.ready !== "boolean" || typeof member.connected !== "boolean") throw new Error(`room member ${index} must contain boolean ready and connected fields`);
		return {
			id: LanMemberId(requiredString(member.id, `members[${index}].id`, 128)),
			seat: revision(member.seat, `members[${index}].seat`),
			ready: member.ready,
			connected: member.connected,
			...member.promptHash === void 0 ? {} : { promptHash: exactHex(member.promptHash, `members[${index}].promptHash`, 64) }
		};
	});
	const snapshot = {
		id: LanRoomId(requiredString(value.id, "room.id", 256)),
		code: LanRoomCode(exactDigits(value.code, "room.code", 6)),
		revision: revision(value.revision),
		phase: value.phase,
		coordinatorId: LanMemberId(requiredString(value.coordinatorId, "room.coordinatorId", 128)),
		maxMembers: positiveInteger(value.maxMembers, "room.maxMembers"),
		members,
		...value.result === void 0 ? {} : { result: requiredString(value.result, "room.result", 4096) }
	};
	const failures = validateLanRoomSnapshot(snapshot);
	if (failures.length > 0) throw new Error(`room snapshot is invalid: ${failures.join("; ")}`);
	return snapshot;
}
const ROOM_PHASES = /* @__PURE__ */ new Set([
	"lobby",
	"locked",
	"running",
	"finished"
]);
function record(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requiredString(value, field, maxLength) {
	if (typeof value !== "string" || value.length === 0 || value.length > maxLength || value.trim() !== value) throw new Error(`${field} must contain 1 to ${maxLength} characters with no surrounding whitespace`);
	return value;
}
function exactDigits(value, field, length) {
	if (typeof value !== "string" || value.length !== length || !/^\d+$/u.test(value)) throw new Error(`${field} must contain exactly ${length} digits`);
	return value;
}
function exactHex(value, field, length) {
	if (typeof value !== "string" || value.length !== length || !/^[0-9a-f]+$/u.test(value)) throw new Error(`${field} must contain exactly ${length} lowercase hexadecimal characters`);
	return value;
}
function revision(value, field = "expectedRevision") {
	if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${field} must be a non-negative safe integer`);
	return value;
}
function positiveInteger(value, field) {
	if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${field} must be a positive safe integer`);
	return value;
}
function jsonValue(value, field) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return value;
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (Array.isArray(value)) return value.map((item, index) => jsonValue(item, `${field}[${index}]`));
	if (record(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsonValue(item, `${field}.${key}`)]));
	throw new Error(`${field} must be a JSON value`);
}
//#endregion
//#region lib/types/transport/connection.js
/** Host-side participant connection to one coordinator-owned LAN room. */
/**
* Open and authenticate one Host-side participant connection.
* @param request - coordinator URL, pairing identity, and lifecycle callbacks.
* @returns authenticated connection after the joined response arrives.
*/
async function connectLanRoom(request) {
	const url = roomUrl(request.url);
	const code = LanRoomCode(request.code);
	if (!/^\d{6}$/u.test(code)) throw new Error("lan-room-ws: code must contain exactly six digits");
	const memberId = LanMemberId(requiredText(request.memberId, "memberId", 128));
	const reconnect = reconnectPolicy(request.reconnect);
	const pending = /* @__PURE__ */ new Map();
	const reconnectAbort = new AbortController();
	let socket;
	let room;
	let token;
	let terminal = false;
	let terminalNotified = false;
	let reconnecting = false;
	let handshake;
	const notify = (state) => {
		request.onConnectionState?.(state);
	};
	const rejectCommands = (reason) => {
		for (const command of pending.values()) command.reject(new Error(reason));
		pending.clear();
	};
	const finish = (reason) => {
		if (terminalNotified) return;
		terminal = true;
		terminalNotified = true;
		reconnectAbort.abort();
		rejectCommands(reason);
		notify({
			status: "closed",
			reason
		});
		request.onClosed?.(reason);
	};
	const handleMessage = (candidate, raw, binary) => {
		if (binary) return;
		let message;
		try {
			message = parseLanRoomServerMessage(frameText$1(raw));
		} catch {
			candidate.close(1002, "invalid coordinator message");
			return;
		}
		switch (message.type) {
			case "joined": {
				if (handshake?.socket !== candidate || handshake.messageId !== message.messageId) return;
				room = message.room;
				token = message.token;
				request.onSnapshot?.(message.room);
				const accepted = handshake;
				handshake = void 0;
				clearTimeout(accepted.timer);
				notify({ status: "connected" });
				accepted.resolve();
				return;
			}
			case "ack": {
				room = message.room;
				request.onSnapshot?.(message.room);
				const command = pending.get(message.messageId);
				pending.delete(message.messageId);
				command?.resolve(message.room);
				return;
			}
			case "snapshot":
				room = message.room;
				request.onSnapshot?.(message.room);
				return;
			case "room-closed":
				finish("room closed by coordinator");
				candidate.close(1e3, "room closed by coordinator");
				return;
			case "decision-request":
				request.onDecisionRequest?.({
					requestId: message.requestId,
					stateVersion: message.stateVersion,
					state: message.state
				});
				return;
			case "game-snapshot":
				request.onGameSnapshot?.(message.game);
				return;
			case "private-game-snapshot":
				request.onPrivateGameSnapshot?.(message.game);
				return;
			case "error": {
				if (message.messageId === void 0) return;
				if (handshake?.socket === candidate && handshake.messageId === message.messageId) {
					const rejected = handshake;
					handshake = void 0;
					clearTimeout(rejected.timer);
					rejected.reject(/* @__PURE__ */ new Error(`${message.code}: ${message.message}`));
					candidate.terminate();
					return;
				}
				const command = pending.get(message.messageId);
				pending.delete(message.messageId);
				if (message.room !== void 0) {
					room = message.room;
					request.onSnapshot?.(message.room);
				}
				if (message.code === "LAN_ROOM_STALE_REVISION" && message.room !== void 0 && command?.retry !== void 0) {
					command.retry(message.room);
					return;
				}
				command?.reject(/* @__PURE__ */ new Error(`${message.code}: ${message.message}`));
				return;
			}
		}
	};
	const open = (message) => new Promise((resolve, reject) => {
		const candidate = new WebSocket(url);
		socket = candidate;
		const timer = setTimeout(() => {
			if (handshake?.socket !== candidate) return;
			const rejected = handshake;
			handshake = void 0;
			rejected.reject(/* @__PURE__ */ new Error("LAN room handshake timed out"));
			candidate.terminate();
		}, reconnect.handshakeTimeoutMs);
		handshake = {
			socket: candidate,
			messageId: message.messageId,
			timer,
			resolve,
			reject
		};
		candidate.on("message", (raw, binary) => {
			handleMessage(candidate, raw, binary);
		});
		candidate.once("open", () => {
			send(candidate, message);
		});
		candidate.on("error", (error) => {
			if (handshake?.socket !== candidate) return;
			const rejected = handshake;
			handshake = void 0;
			clearTimeout(rejected.timer);
			rejected.reject(error);
		});
		candidate.once("close", (_code, rawReason) => {
			const reason = rawReason.length === 0 ? "connection closed unexpectedly" : rawReason.toString();
			if (handshake?.socket === candidate) {
				const rejected = handshake;
				handshake = void 0;
				clearTimeout(rejected.timer);
				rejected.reject(new Error(reason));
			}
			if (socket !== candidate) return;
			socket = void 0;
			rejectCommands(`LAN room command failed because the socket closed: ${reason}`);
			if (terminal || token === void 0 || room === void 0 || reconnecting) return;
			reconnectAfter(reason);
		});
	});
	const reconnectAfter = async (reason) => {
		reconnecting = true;
		for (let attempt = 1; attempt <= reconnect.maxAttempts && !terminal; attempt += 1) {
			const delayMs = Math.min(reconnect.initialDelayMs * 2 ** (attempt - 1), reconnect.maxDelayMs);
			notify({
				status: "reconnecting",
				attempt,
				delayMs,
				reason
			});
			await waitForRetry(delayMs, reconnectAbort.signal);
			if (reconnectAbort.signal.aborted) break;
			const authoritativeRoom = currentRoom(room);
			const resumeToken = token;
			if (resumeToken === void 0) break;
			try {
				await open({
					version: 1,
					type: "resume",
					messageId: randomUUID(),
					roomId: authoritativeRoom.id,
					memberId,
					token: resumeToken
				});
				reconnecting = false;
				return;
			} catch (error) {
				reason = error instanceof Error ? error.message : String(error);
				if (socket !== void 0) {
					const failed = socket;
					socket = void 0;
					failed.terminate();
				}
			}
		}
		reconnecting = false;
		if (!terminal) finish(`LAN room reconnect exhausted: ${reason}`);
	};
	notify({ status: "connecting" });
	try {
		await open(request.resume === void 0 ? {
			version: 1,
			type: "join",
			messageId: randomUUID(),
			code,
			memberId
		} : {
			version: 1,
			type: "resume",
			messageId: randomUUID(),
			roomId: requiredText(request.resume.roomId, "resume.roomId", 256),
			memberId,
			token: resumeToken(request.resume.token)
		});
	} catch (error) {
		terminal = true;
		reconnectAbort.abort();
		socket?.terminate();
		throw error;
	}
	const command = (message) => {
		if (terminal || socket?.readyState !== WebSocket.OPEN) return Promise.reject(/* @__PURE__ */ new Error("LAN room connection is not connected"));
		return new Promise((resolve, reject) => {
			const dispatch = (expectedRevision, allowRetry) => {
				const current = socket;
				if (terminal || current?.readyState !== WebSocket.OPEN) {
					reject(/* @__PURE__ */ new Error("LAN room command failed because the connection is not connected"));
					return;
				}
				const messageId = randomUUID();
				pending.set(messageId, {
					resolve,
					reject,
					...allowRetry ? { retry: (authoritative) => {
						dispatch(authoritative.revision, false);
					} } : {}
				});
				send(current, {
					...message,
					version: 1,
					messageId,
					expectedRevision
				});
			};
			dispatch(currentRoom(room).revision, true);
		});
	};
	return {
		memberId,
		coordinatorUrl: url,
		resumeToken: () => {
			if (token === void 0) throw new Error("LAN room connection has no resume token");
			return token;
		},
		snapshot: () => currentRoom(room),
		updatePrompt: (promptHash) => command({
			type: "update-prompt",
			promptHash
		}),
		setReady: (ready) => command({
			type: "set-ready",
			ready
		}),
		leave: () => command({ type: "leave" }),
		respondDecision: (requestId, stateVersion, action) => {
			const active = socket;
			if (terminal || active?.readyState !== WebSocket.OPEN) throw new Error("LAN room connection is not connected");
			send(active, {
				version: 1,
				type: "decision-response",
				requestId,
				stateVersion,
				action
			});
		},
		close: async () => {
			if (terminal) return;
			finish("participant closed connection");
			const active = socket;
			socket = void 0;
			if (active !== void 0) await closeSocket(active);
		}
	};
}
function resumeToken(value) {
	if (!/^[0-9a-f]{64}$/u.test(value)) throw new Error("lan-room-ws: resume.token must be 64 lowercase hexadecimal characters");
	return value;
}
function reconnectPolicy(value) {
	const maxAttempts = boundedInteger(value?.maxAttempts ?? 8, "reconnect.maxAttempts", 0, 32);
	const initialDelayMs = boundedInteger(value?.initialDelayMs ?? 250, "reconnect.initialDelayMs", 1, 6e4);
	const maxDelayMs = boundedInteger(value?.maxDelayMs ?? 4e3, "reconnect.maxDelayMs", 1, 6e4);
	const handshakeTimeoutMs = boundedInteger(value?.handshakeTimeoutMs ?? 5e3, "reconnect.handshakeTimeoutMs", 1, 6e4);
	if (maxDelayMs < initialDelayMs) throw new Error("lan-room-ws: reconnect.maxDelayMs must be at least reconnect.initialDelayMs");
	return {
		maxAttempts,
		initialDelayMs,
		maxDelayMs,
		handshakeTimeoutMs
	};
}
function boundedInteger(value, field, minimum, maximum) {
	if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new Error(`lan-room-ws: ${field} must be an integer from ${minimum} through ${maximum}`);
	return value;
}
function waitForRetry(delayMs, signal) {
	if (signal.aborted) return Promise.resolve();
	return new Promise((resolve) => {
		const timer = setTimeout(done, delayMs);
		function done() {
			clearTimeout(timer);
			signal.removeEventListener("abort", done);
			resolve();
		}
		signal.addEventListener("abort", done, { once: true });
	});
}
function roomUrl(value) {
	const url = new URL(value);
	if (url.protocol !== "ws:") throw new Error("lan-room-ws: coordinator URL must use ws://");
	if (url.username !== "" || url.password !== "" || url.search !== "" || url.hash !== "") throw new Error("lan-room-ws: coordinator URL cannot contain credentials, query, or fragment");
	return url.toString();
}
function requiredText(value, field, maxLength) {
	if (value.length === 0 || value.length > maxLength || value.trim() !== value) throw new Error(`lan-room-ws: ${field} must contain 1 to ${maxLength} characters with no surrounding whitespace`);
	return value;
}
function currentRoom(room) {
	if (room === void 0) throw new Error("LAN room connection has no snapshot");
	return room;
}
function send(socket, message) {
	socket.send(JSON.stringify(message));
}
function closeSocket(socket) {
	if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
	return new Promise((resolve) => {
		socket.once("close", resolve);
		if (socket.readyState === WebSocket.CONNECTING) socket.terminate();
		else socket.close(1e3, "participant closed connection");
	});
}
function frameText$1(raw) {
	if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
	if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString("utf8");
	return raw.toString("utf8");
}
//#endregion
//#region lib/types/transport/gateway.js
/** Restricted coordinator-side WebSocket transport for one authoritative LAN room. */
/**
* Bind a restricted WebSocket endpoint for one room.
* @param rooms - authoritative room service used for identity and mutations.
* @param request - coordinator identity and listener address.
* @returns live listener after the operating system accepts the bind.
*/
async function listenLanRoom(rooms, request) {
	const room = rooms.get(request.roomId);
	if (room === void 0) throw new LanRoomError(`room ${JSON.stringify(request.roomId)} does not exist`, "LAN_ROOM_NOT_FOUND");
	if (room.coordinatorId !== request.coordinatorId) throw new LanRoomError(`member ${JSON.stringify(request.coordinatorId)} is not the room coordinator`, "LAN_ROOM_NOT_COORDINATOR");
	if (request.host.length === 0 || request.host.trim() !== request.host) throw new Error("lan-room-ws: host must be non-empty with no surrounding whitespace");
	const port = request.port ?? 0;
	if (!Number.isSafeInteger(port) || port < 0 || port > 65535) throw new Error("lan-room-ws: port must be an integer from 0 through 65535");
	const heartbeatIntervalMs = positiveDuration(request.heartbeatIntervalMs ?? 1e4, "heartbeatIntervalMs");
	const heartbeatTimeoutMs = positiveDuration(request.heartbeatTimeoutMs ?? 3e4, "heartbeatTimeoutMs");
	const unauthenticatedHandshakeTimeoutMs = positiveDuration(request.unauthenticatedHandshakeTimeoutMs ?? 5e3, "unauthenticatedHandshakeTimeoutMs");
	const maxUnauthenticatedConnections = positiveDuration(request.maxUnauthenticatedConnections ?? 64, "maxUnauthenticatedConnections");
	const maxUnauthenticatedConnectionsPerIp = positiveDuration(request.maxUnauthenticatedConnectionsPerIp ?? 8, "maxUnauthenticatedConnectionsPerIp");
	if (heartbeatTimeoutMs < heartbeatIntervalMs) throw new Error("lan-room-ws: heartbeatTimeoutMs must be at least heartbeatIntervalMs");
	const server = createServer((_req, res) => {
		res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
		res.end("Not found");
	});
	const sockets = new WebSocketServer({
		server,
		maxPayload: 524288
	});
	const peers = /* @__PURE__ */ new Map();
	const currentSockets = /* @__PURE__ */ new Map();
	const tokens = /* @__PURE__ */ new Map();
	const lastPongs = /* @__PURE__ */ new Map();
	const handshakeAttempts = /* @__PURE__ */ new Map();
	const unauthenticated = /* @__PURE__ */ new Map();
	const unauthenticatedByAddress = /* @__PURE__ */ new Map();
	const pendingDecisions = /* @__PURE__ */ new Map();
	const send = (socket, message) => {
		if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
	};
	const sendError = (socket, error, messageId) => {
		const code = error instanceof LanRoomError ? error.code : "LAN_ROOM_WIRE_INVALID";
		const message = error instanceof Error ? error.message : String(error);
		const peer = peers.get(socket);
		const room = peer === void 0 ? void 0 : rooms.get(peer.roomId);
		send(socket, {
			version: 1,
			type: "error",
			...messageId === void 0 ? {} : { messageId },
			code,
			message,
			...room === void 0 ? {} : { room }
		});
	};
	const keyOf = (roomId, memberId) => `${roomId}\u0000${memberId}`;
	for (const [memberId, token] of Object.entries(request.resumeTokens ?? {})) {
		if (!/^[0-9a-f]{64}$/u.test(token)) throw new Error(`lan-room-ws: invalid recovered resume token for ${JSON.stringify(memberId)}`);
		tokens.set(keyOf(request.roomId, LanMemberId(memberId)), token);
	}
	const authenticate = (socket, peer) => {
		clearUnauthenticated(socket);
		const key = keyOf(peer.roomId, peer.memberId);
		const previous = currentSockets.get(key);
		currentSockets.set(key, socket);
		peers.set(socket, peer);
		if (previous !== void 0 && previous !== socket) previous.close(4001, "replaced by resumed connection");
	};
	function clearUnauthenticated(socket) {
		const pending = unauthenticated.get(socket);
		if (pending === void 0) return;
		unauthenticated.delete(socket);
		clearTimeout(pending.timer);
		const count = (unauthenticatedByAddress.get(pending.address) ?? 1) - 1;
		if (count === 0) unauthenticatedByAddress.delete(pending.address);
		else unauthenticatedByAddress.set(pending.address, count);
	}
	const resendPendingDecisions = (socket, memberId) => {
		for (const pending of pendingDecisions.values()) if (pending.memberId === memberId) send(socket, pending.request);
	};
	const admitHandshake = (address) => {
		const now = Date.now();
		const current = handshakeAttempts.get(address);
		if (current === void 0 || now - current.windowStartedAt >= 6e4) {
			handshakeAttempts.set(address, {
				windowStartedAt: now,
				count: 1
			});
			return true;
		}
		current.count += 1;
		return current.count <= 12;
	};
	const off = rooms.onChanged(({ kind, room: changed }) => {
		if (changed.id !== request.roomId) return;
		for (const [socket, peer] of peers) {
			if (peer.roomId !== request.roomId) continue;
			if (kind === "removed") send(socket, {
				version: 1,
				type: "room-closed",
				roomId: request.roomId
			});
			else send(socket, {
				version: 1,
				type: "snapshot",
				room: changed
			});
		}
	});
	sockets.on("connection", (socket, upgradeRequest) => {
		if (upgradeRequest.headers.origin !== void 0) {
			socket.close(1008, "browser-origin connections are not accepted");
			return;
		}
		const remoteAddress = upgradeRequest.socket.remoteAddress ?? "unknown";
		const addressCount = unauthenticatedByAddress.get(remoteAddress) ?? 0;
		if (unauthenticated.size >= maxUnauthenticatedConnections || addressCount >= maxUnauthenticatedConnectionsPerIp) {
			socket.close(1008, "unauthenticated connection limit exceeded");
			return;
		}
		const handshakeTimer = setTimeout(() => {
			if (!unauthenticated.has(socket)) return;
			socket.close(1008, "authentication handshake timed out");
		}, unauthenticatedHandshakeTimeoutMs);
		handshakeTimer.unref();
		unauthenticated.set(socket, {
			address: remoteAddress,
			timer: handshakeTimer
		});
		unauthenticatedByAddress.set(remoteAddress, addressCount + 1);
		lastPongs.set(socket, Date.now());
		socket.on("pong", () => {
			lastPongs.set(socket, Date.now());
		});
		socket.on("message", (raw, binary) => {
			if (binary) {
				sendError(socket, /* @__PURE__ */ new Error("binary messages are not supported"));
				return;
			}
			let message;
			try {
				message = parseLanRoomClientMessage(frameText(raw));
			} catch (error) {
				sendError(socket, error);
				return;
			}
			try {
				const peer = peers.get(socket);
				if (peer === void 0) {
					if (!admitHandshake(remoteAddress)) {
						socket.close(1008, "handshake rate limit exceeded");
						return;
					}
					if (message.type === "join") {
						if (requiredRoom(rooms, request.roomId).code !== message.code) throw new Error("pairing code does not belong to this listener");
						const joined = rooms.join({
							code: message.code,
							memberId: message.memberId
						});
						const token = randomBytes(32).toString("hex");
						tokens.set(keyOf(joined.id, message.memberId), token);
						authenticate(socket, {
							roomId: joined.id,
							memberId: message.memberId,
							token
						});
						send(socket, {
							version: 1,
							type: "joined",
							messageId: message.messageId,
							token,
							room: joined
						});
						return;
					}
					if (message.type === "resume") {
						const key = keyOf(message.roomId, message.memberId);
						if (message.roomId !== request.roomId || tokens.get(key) !== message.token) throw new Error("resume token is invalid");
						let resumed = requiredRoom(rooms, message.roomId);
						if (!resumed.members.some((member) => member.id === message.memberId)) throw new Error("resume member is not in the room");
						if (!resumed.members.find((member) => member.id === message.memberId)?.connected) resumed = rooms.setConnected({
							roomId: message.roomId,
							memberId: message.memberId,
							expectedRevision: resumed.revision,
							connected: true
						});
						authenticate(socket, {
							roomId: message.roomId,
							memberId: message.memberId,
							token: message.token
						});
						send(socket, {
							version: 1,
							type: "joined",
							messageId: message.messageId,
							token: message.token,
							room: resumed
						});
						resendPendingDecisions(socket, message.memberId);
						return;
					}
					throw new Error("first message must join or resume");
				}
				if (currentSockets.get(keyOf(peer.roomId, peer.memberId)) !== socket) throw new Error("authenticated socket has been replaced");
				if (message.type === "join" || message.type === "resume") throw new Error("authenticated socket cannot repeat handshake");
				if (message.type === "decision-response") {
					const pending = pendingDecisions.get(message.requestId);
					if (pending === void 0 || pending.memberId !== peer.memberId || pending.stateVersion !== message.stateVersion) throw new Error("decision response does not match an active request");
					pendingDecisions.delete(message.requestId);
					pending.cleanup();
					pending.resolve(message.action);
					return;
				}
				const updated = applyCommand(rooms, peer, message);
				send(socket, {
					version: 1,
					type: "ack",
					messageId: message.messageId,
					room: updated
				});
			} catch (error) {
				sendError(socket, error, "messageId" in message ? message.messageId : void 0);
			}
		});
		socket.on("close", () => {
			clearUnauthenticated(socket);
			lastPongs.delete(socket);
			const peer = peers.get(socket);
			peers.delete(socket);
			if (peer === void 0) return;
			const key = keyOf(peer.roomId, peer.memberId);
			if (currentSockets.get(key) !== socket) return;
			currentSockets.delete(key);
			const current = rooms.get(peer.roomId);
			const member = current?.members.find((candidate) => candidate.id === peer.memberId);
			if (current !== void 0 && member?.connected) try {
				rooms.setConnected({
					roomId: peer.roomId,
					memberId: peer.memberId,
					expectedRevision: current.revision,
					connected: false
				});
			} catch {}
		});
	});
	await listen(server, request.host, port);
	const address = server.address();
	if (address === null || typeof address === "string") throw new Error("lan-room-ws: listener did not expose an IP address");
	const heartbeat = setInterval(() => {
		const now = Date.now();
		for (const [address, attempt] of handshakeAttempts) if (now - attempt.windowStartedAt >= 6e4) handshakeAttempts.delete(address);
		for (const socket of sockets.clients) {
			if (socket.readyState !== WebSocket.OPEN) continue;
			if (now - (lastPongs.get(socket) ?? 0) >= heartbeatTimeoutMs) {
				socket.terminate();
				continue;
			}
			socket.ping();
		}
	}, heartbeatIntervalMs);
	heartbeat.unref();
	let closed = false;
	return {
		host: request.host,
		port: address.port,
		requestDecision(memberId, decision, signal) {
			if (closed) return Promise.reject(/* @__PURE__ */ new Error("LAN room listener is closed"));
			if (pendingDecisions.has(decision.requestId)) return Promise.reject(/* @__PURE__ */ new Error(`decision ${JSON.stringify(decision.requestId)} is already pending`));
			const socket = currentSockets.get(keyOf(request.roomId, memberId));
			if (socket === void 0 || socket.readyState !== WebSocket.OPEN) return Promise.reject(/* @__PURE__ */ new Error(`member ${JSON.stringify(memberId)} is not connected`));
			return new Promise((resolve, reject) => {
				const onAbort = () => {
					if (pendingDecisions.get(decision.requestId)?.reject !== reject) return;
					pendingDecisions.delete(decision.requestId);
					reject(signal.reason instanceof Error ? signal.reason : /* @__PURE__ */ new Error("decision aborted"));
				};
				signal.addEventListener("abort", onAbort, { once: true });
				pendingDecisions.set(decision.requestId, {
					memberId,
					stateVersion: decision.stateVersion,
					request: {
						version: 1,
						type: "decision-request",
						...decision
					},
					resolve,
					reject,
					cleanup: () => {
						signal.removeEventListener("abort", onAbort);
					}
				});
				send(socket, {
					version: 1,
					type: "decision-request",
					...decision
				});
				if (signal.aborted) onAbort();
			});
		},
		publishGameSnapshot(game) {
			if (closed) return;
			for (const [socket, peer] of peers) if (peer.roomId === request.roomId) send(socket, {
				version: 1,
				type: "game-snapshot",
				game
			});
		},
		publishPrivateGameSnapshot(memberId, game) {
			if (closed) return;
			const socket = currentSockets.get(keyOf(request.roomId, memberId));
			if (socket !== void 0) send(socket, {
				version: 1,
				type: "private-game-snapshot",
				game
			});
		},
		resumeTokens() {
			const prefix = `${request.roomId}\u0000`;
			return Object.fromEntries([...tokens.entries()].filter(([key]) => key.startsWith(prefix)).map(([key, token]) => [key.slice(prefix.length), token]));
		},
		async close() {
			if (closed) return;
			closed = true;
			clearInterval(heartbeat);
			off();
			for (const [requestId, pending] of pendingDecisions) {
				pendingDecisions.delete(requestId);
				pending.cleanup();
				pending.reject(/* @__PURE__ */ new Error("LAN room listener closed during decision"));
			}
			for (const socket of sockets.clients) socket.terminate();
			for (const socket of unauthenticated.keys()) clearUnauthenticated(socket);
			await closeServer(sockets, server);
		}
	};
}
function positiveDuration(value, field) {
	if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`lan-room-ws: ${field} must be a positive integer`);
	return value;
}
function applyCommand(rooms, peer, message) {
	switch (message.type) {
		case "update-prompt": return rooms.updatePrompt({
			roomId: peer.roomId,
			memberId: peer.memberId,
			expectedRevision: message.expectedRevision,
			promptHash: message.promptHash
		});
		case "set-ready": return rooms.setReady({
			roomId: peer.roomId,
			memberId: peer.memberId,
			expectedRevision: message.expectedRevision,
			ready: message.ready
		});
		case "leave": return rooms.leave({
			roomId: peer.roomId,
			memberId: peer.memberId,
			expectedRevision: message.expectedRevision
		});
		default: throw new Error("unreachable LAN room command");
	}
}
function requiredRoom(rooms, roomId) {
	const room = rooms.get(roomId);
	if (room === void 0) throw new LanRoomError(`room ${JSON.stringify(roomId)} does not exist`, "LAN_ROOM_NOT_FOUND");
	return room;
}
function listen(server, host, port) {
	return new Promise((resolve, reject) => {
		const onError = (error) => {
			reject(error);
		};
		server.once("error", onError);
		server.listen(port, host, () => {
			server.off("error", onError);
			resolve();
		});
	});
}
function closeServer(sockets, server) {
	return new Promise((resolve, reject) => {
		sockets.close((socketError) => {
			if (socketError !== void 0) {
				reject(socketError);
				return;
			}
			server.close((error) => {
				if (error === void 0) resolve();
				else reject(error);
			});
		});
	});
}
function frameText(raw) {
	if (Array.isArray(raw)) return Buffer.concat(raw).toString("utf8");
	if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString("utf8");
	return raw.toString("utf8");
}
//#endregion
//#region lib/types/transport/control.js
/** Local DSH Host controller joining room transport to hidden Game Sessions. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
let LanRoomTransport = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _host_decorators;
	let _join_decorators;
	let _status_decorators;
	let _updatePrompt_decorators;
	let _setReady_decorators;
	let _leave_decorators;
	return class LanRoomTransport extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_host_decorators = [Remote("host")];
			_join_decorators = [Remote("join")];
			_status_decorators = [Remote("status")];
			_updatePrompt_decorators = [Remote("updatePrompt")];
			_setReady_decorators = [Remote("setReady")];
			_leave_decorators = [Remote("leave")];
			__esDecorate(this, null, _host_decorators, {
				kind: "method",
				name: "host",
				static: false,
				private: false,
				access: {
					has: (obj) => "host" in obj,
					get: (obj) => obj.host
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _join_decorators, {
				kind: "method",
				name: "join",
				static: false,
				private: false,
				access: {
					has: (obj) => "join" in obj,
					get: (obj) => obj.join
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _status_decorators, {
				kind: "method",
				name: "status",
				static: false,
				private: false,
				access: {
					has: (obj) => "status" in obj,
					get: (obj) => obj.status
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updatePrompt_decorators, {
				kind: "method",
				name: "updatePrompt",
				static: false,
				private: false,
				access: {
					has: (obj) => "updatePrompt" in obj,
					get: (obj) => obj.updatePrompt
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _setReady_decorators, {
				kind: "method",
				name: "setReady",
				static: false,
				private: false,
				access: {
					has: (obj) => "setReady" in obj,
					get: (obj) => obj.setReady
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _leave_decorators, {
				kind: "method",
				name: "leave",
				static: false,
				private: false,
				access: {
					has: (obj) => "leave" in obj,
					get: (obj) => obj.leave
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [
			"agents",
			"lanRooms",
			"lanGameAgents"
		];
		active = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new Map());
		/** Install room change, Agent disposal, and provider teardown ownership. */
		constructor(ctx) {
			super(ctx, "lanRoomTransport");
			ctx.effect(() => ctx.lanRooms.onChanged(({ kind, room }) => {
				for (const entry of this.active.values()) {
					if (entry.role !== "coordinator" || entry.room.id !== room.id) continue;
					if (kind === "removed") {
						entry.connection = "disconnected";
						continue;
					}
					this.acceptSnapshot(entry, room);
				}
			}), "lan-room-transport: follow coordinator rooms");
			ctx.on("agent/disposed", ({ agent }) => {
				this.disposeAgent(agent.id).catch((error) => {
					this.ctx.logger.warn(`lan-room-transport: Agent disposal failed: ${messageOf(error)}`);
				});
			});
			ctx.effect(() => async () => {
				const entries = [...this.active.values()];
				this.active.clear();
				await Promise.all(entries.map((entry) => this.closeEntry(entry, false)));
			}, "lan-room-transport: close listeners and participant sockets");
		}
		/**
		* Create one three-seat room and bind its coordinator listener on all IPv4 interfaces.
		* @param agent - visible foreground Agent that owns this participant.
		* @param request - only the pre-game strategy Prompt.
		* @returns local participant view after listener readiness.
		*/
		async host(agent, request) {
			this.assertAvailable(agent);
			let strategyPrompt = prompt(request.strategyPrompt);
			const recovered = this.recoverableBinding(agent, "coordinator");
			if (recovered !== void 0) {
				strategyPrompt = recoveredPrompt(recovered.binding);
				return await this.resumeCoordinator(agent, strategyPrompt, recovered.binding, recovered.match);
			}
			let room = this.ctx.lanRooms.create({ coordinatorId: LanMemberId(agent.id) });
			room = this.ctx.lanRooms.updatePrompt({
				roomId: room.id,
				memberId: LanMemberId(agent.id),
				expectedRevision: room.revision,
				promptHash: hashPrompt(strategyPrompt)
			});
			const entry = {
				parent: agent,
				role: "coordinator",
				abort: new AbortController(),
				strategyPrompt,
				room,
				connection: "connected",
				joinUrls: [],
				gameSessionState: "absent",
				error: void 0
			};
			this.active.set(agent.id, entry);
			try {
				entry.listener = await listenLanRoom(this.ctx.lanRooms, {
					roomId: room.id,
					coordinatorId: LanMemberId(agent.id),
					host: "0.0.0.0"
				});
				entry.joinUrls = advertisedUrls(entry.listener.port);
				await this.persistBinding(entry);
				return view(entry);
			} catch (error) {
				this.active.delete(agent.id);
				this.ctx.lanRooms.close(room.id, LanMemberId(agent.id));
				throw error;
			}
		}
		/**
		* Join one coordinator through the Host process and publish this Session's Prompt hash.
		* @param agent - visible foreground Agent that owns this participant.
		* @param request - coordinator address, pairing code, and local strategy Prompt.
		* @returns local participant view after the prompt hash commits.
		*/
		async join(agent, request) {
			this.assertAvailable(agent);
			const binding = this.recoverableBinding(agent, "participant")?.binding;
			const strategyPrompt = binding?.resumeToken === void 0 ? prompt(request.strategyPrompt) : recoveredPrompt(binding);
			const entry = {
				parent: agent,
				role: "participant",
				abort: new AbortController(),
				strategyPrompt,
				room: void 0,
				connection: "connecting",
				joinUrls: [],
				gameSessionState: "absent",
				error: void 0
			};
			try {
				entry.peer = await connectLanRoom({
					url: request.url,
					code: request.code,
					memberId: agent.id,
					...binding?.resumeToken === void 0 || normalizedUrl(binding.coordinatorUrl) !== normalizedUrl(request.url) ? {} : { resume: {
						roomId: binding.roomId,
						token: binding.resumeToken
					} },
					onConnectionState: (state) => {
						switch (state.status) {
							case "connecting":
								entry.connection = "connecting";
								break;
							case "connected":
								entry.connection = "connected";
								entry.error = void 0;
								break;
							case "reconnecting":
								entry.connection = "reconnecting";
								entry.error = state.reason;
								break;
							case "closed":
								entry.connection = "disconnected";
								entry.error = state.reason;
						}
					},
					onSnapshot: (room) => {
						this.acceptSnapshot(entry, room);
					},
					onClosed: (reason) => {
						entry.connection = "disconnected";
						entry.error = reason;
					},
					onGameSnapshot: (game) => {
						entry.game = game;
					},
					onPrivateGameSnapshot: (game) => {
						entry.privateGame = game;
					},
					onDecisionRequest: (decision) => {
						this.answerRemoteDecision(entry, decision).catch((error) => {
							entry.error = messageOf(error);
						});
					}
				});
				entry.room = entry.peer.snapshot().phase === "lobby" ? await entry.peer.updatePrompt(hashPrompt(strategyPrompt)) : entry.peer.snapshot();
				this.active.set(agent.id, entry);
				if (binding !== void 0 && entry.room.phase === "running") this.restoreGameSession(entry, binding);
				await this.persistBinding(entry);
				return view(entry);
			} catch (error) {
				await entry.peer?.close();
				throw error;
			}
		}
		/**
		* Read the current local participant attached to a visible Session.
		* @param agent - exact live foreground Agent.
		* @returns detached local view, or undefined outside a room.
		*/
		status(agent) {
			const entry = this.active.get(agent.id);
			return entry === void 0 ? void 0 : view(entry);
		}
		/**
		* Replace the only user-editable game setting and clear readiness.
		* @param agent - exact live foreground Agent.
		* @param strategyPrompt - non-empty Prompt while the lobby remains open.
		* @returns committed local participant view.
		*/
		async updatePrompt(agent, strategyPrompt) {
			const entry = this.entry(agent);
			const next = prompt(strategyPrompt);
			if (entry.room.phase !== "lobby") throw new Error("strategy Prompt is locked after the lobby");
			entry.room = entry.role === "coordinator" ? this.ctx.lanRooms.updatePrompt({
				roomId: entry.room.id,
				memberId: LanMemberId(agent.id),
				expectedRevision: entry.room.revision,
				promptHash: hashPrompt(next)
			}) : await requiredPeer(entry).updatePrompt(hashPrompt(next));
			entry.strategyPrompt = next;
			return view(entry);
		}
		/**
		* Change local readiness; the coordinator starts automatically after all three members lock.
		* @param agent - exact live foreground Agent.
		* @param ready - requested lobby readiness.
		* @returns committed local participant view.
		*/
		async setReady(agent, ready) {
			const entry = this.entry(agent);
			entry.room = entry.role === "coordinator" ? this.ctx.lanRooms.setReady({
				roomId: entry.room.id,
				memberId: LanMemberId(agent.id),
				expectedRevision: entry.room.revision,
				ready
			}) : await requiredPeer(entry).setReady(ready);
			this.scheduleStart(entry);
			return view(entry);
		}
		/**
		* Leave an open lobby or close the coordinator-owned room.
		* @param agent - exact live foreground Agent.
		*/
		async leave(agent) {
			const entry = this.entry(agent);
			this.active.delete(agent.id);
			await this.closeEntry(entry, true);
		}
		/**
		* Request one action from the addressed member's hidden Game Session.
		* @param request - room/member address, correlation values, private state, and cancellation.
		* @returns structured action from the local bridge or remote Host peer.
		*/
		async requestDecision(request) {
			const entry = [...this.active.values()].find((candidate) => candidate.room.id === request.roomId && candidate.role === "coordinator");
			if (entry === void 0) throw new Error(`room ${JSON.stringify(request.roomId)} has no local coordinator transport`);
			if (request.memberId === LanMemberId(entry.parent.id)) {
				entry.privateGame = structuredClone(request.state);
				await this.ensureGameSession(entry);
				if (entry.gameSessionId === void 0) throw new Error("coordinator Game Session is unavailable");
				return (await this.ctx.lanGameAgents.decide({
					parent: entry.parent,
					childId: entry.gameSessionId,
					requestId: request.requestId,
					stateVersion: request.stateVersion,
					state: request.state,
					signal: request.signal
				})).action;
			}
			if (entry.listener === void 0) throw new Error("coordinator listener is unavailable");
			return await entry.listener.requestDecision(request.memberId, {
				requestId: request.requestId,
				stateVersion: request.stateVersion,
				state: request.state
			}, request.signal);
		}
		/**
		* Publish one public game projection locally and to every connected member.
		* @param roomId - coordinator-owned room identity.
		* @param game - JSON public game projection.
		*/
		publishGameSnapshot(roomId, game) {
			const entry = [...this.active.values()].find((candidate) => candidate.room.id === roomId && candidate.role === "coordinator");
			if (entry === void 0) throw new Error(`room ${JSON.stringify(roomId)} has no local coordinator transport`);
			entry.game = structuredClone(game);
			entry.listener?.publishGameSnapshot(game);
		}
		/**
		* Publish one seat-private browser projection only to the addressed local DSH Host.
		* @param roomId - coordinator-owned room identity.
		* @param memberId - exact room member identity.
		* @param game - JSON private game projection.
		*/
		publishPrivateGameSnapshot(roomId, memberId, game) {
			const entry = [...this.active.values()].find((candidate) => candidate.room.id === roomId && candidate.role === "coordinator");
			if (entry === void 0) throw new Error(`room ${JSON.stringify(roomId)} has no local coordinator transport`);
			if (memberId === LanMemberId(entry.parent.id)) entry.privateGame = structuredClone(game);
			else entry.listener?.publishPrivateGameSnapshot(memberId, game);
		}
		/**
		* Return coordinator-held resume tokens for inclusion in a durable match commit.
		* @param roomId - exact locally coordinated room identity.
		* @returns detached member-id to token map, or an empty map without a live listener.
		*/
		resumeTokens(roomId) {
			return [...this.active.values()].find((candidate) => candidate.room.id === roomId && candidate.role === "coordinator")?.listener?.resumeTokens() ?? {};
		}
		acceptSnapshot(entry, room) {
			entry.room = room;
			entry.error = void 0;
			this.scheduleStart(entry);
			if (room.phase === "running") this.ensureGameSession(entry);
		}
		scheduleStart(entry) {
			if (entry.role !== "coordinator" || entry.room.phase !== "locked") return;
			queueMicrotask(() => {
				if (this.active.get(entry.parent.id) !== entry || entry.room.phase !== "locked") return;
				try {
					const room = this.ctx.lanRooms.get(entry.room.id);
					if (room?.phase !== "locked") return;
					this.acceptSnapshot(entry, this.ctx.lanRooms.start({
						roomId: room.id,
						coordinatorId: LanMemberId(entry.parent.id),
						expectedRevision: room.revision
					}));
				} catch (error) {
					entry.error = messageOf(error);
				}
			});
		}
		ensureGameSession(entry) {
			if (entry.gameSessionState !== "absent") return entry.gameSessionStart ?? Promise.resolve();
			entry.gameSessionState = "starting";
			entry.gameSessionStart = this.ctx.lanGameAgents.create({
				parent: entry.parent,
				strategyPrompt: entry.strategyPrompt,
				signal: entry.abort.signal
			}).then(async (created) => {
				entry.gameSessionId = created.childId;
				entry.gameSessionState = "ready";
				if (entry.role === "coordinator" || entry.peer !== void 0) await this.persistBinding(entry);
			}, (error) => {
				entry.gameSessionState = "failed";
				entry.error = messageOf(error);
			});
			return entry.gameSessionStart;
		}
		async answerRemoteDecision(entry, request) {
			entry.privateGame = structuredClone(request.state);
			await this.ensureGameSession(entry);
			if (entry.gameSessionId === void 0 || entry.peer === void 0) throw new Error("participant Game Session is unavailable");
			const decision = await this.ctx.lanGameAgents.decide({
				parent: entry.parent,
				childId: entry.gameSessionId,
				requestId: request.requestId,
				stateVersion: request.stateVersion,
				state: request.state,
				signal: entry.abort.signal
			});
			entry.peer.respondDecision(decision.requestId, decision.stateVersion, decision.action);
		}
		async disposeAgent(agentId) {
			const entry = this.active.get(agentId);
			if (entry === void 0) return;
			this.active.delete(agentId);
			await this.closeEntry(entry, false);
		}
		async closeEntry(entry, mutateRoom) {
			entry.abort.abort();
			if (entry.role === "coordinator") {
				if (this.ctx.lanRooms.get(entry.room.id) !== void 0) this.ctx.lanRooms.close(entry.room.id, LanMemberId(entry.parent.id));
			} else if (mutateRoom && entry.room.phase === "lobby" && entry.connection === "connected") await entry.peer?.leave();
			await entry.peer?.close();
			await entry.listener?.close();
			await entry.gameSessionStart;
			if (entry.gameSessionId !== void 0) this.ctx.lanGameAgents.remove(entry.parent, entry.gameSessionId);
		}
		assertAvailable(agent) {
			if (this.active.has(agent.id)) throw new Error(`Session ${JSON.stringify(agent.id)} already has a LAN room participant`);
		}
		entry(agent) {
			const entry = this.active.get(agent.id);
			if (entry === void 0 || entry.parent !== agent) throw new Error(`Session ${JSON.stringify(agent.id)} has no LAN room participant`);
			return entry;
		}
		persistence() {
			return this.ctx.get("lanGamePersistence");
		}
		recoverableBinding(agent, role) {
			const persistence = this.persistence();
			const binding = persistence?.listBindings().find((candidate) => candidate.state === "active" && candidate.role === role && candidate.parentSessionId === agent.id && candidate.memberId === agent.id);
			if (binding === void 0) return void 0;
			const match = persistence?.get(binding.roomId);
			if (role === "coordinator") {
				if (match === void 0 || match.closedAt !== void 0) return void 0;
				if (match.room.coordinatorId !== agent.id) return void 0;
			}
			return {
				binding,
				...match === void 0 ? {} : { match }
			};
		}
		async resumeCoordinator(agent, strategyPrompt, binding, match) {
			if (match === void 0) throw new Error(`durable coordinator binding ${JSON.stringify(binding.roomId)} has no match`);
			const room = this.ctx.lanRooms.restore(roomSnapshot(match.room));
			const entry = {
				parent: agent,
				role: "coordinator",
				abort: new AbortController(),
				strategyPrompt,
				room,
				connection: "connected",
				joinUrls: [],
				gameSessionState: "absent",
				error: void 0
			};
			this.active.set(agent.id, entry);
			try {
				entry.listener = await listenLanRoom(this.ctx.lanRooms, {
					roomId: room.id,
					coordinatorId: LanMemberId(agent.id),
					host: "0.0.0.0",
					port: coordinatorPort(binding.coordinatorUrl),
					resumeTokens: Object.fromEntries(match.room.members.flatMap((member) => member.resumeToken === void 0 ? [] : [[member.id, member.resumeToken]]))
				});
				entry.joinUrls = advertisedUrls(entry.listener.port);
				if (room.phase === "running") this.restoreGameSession(entry, binding);
				await this.persistBinding(entry);
				const runtime = this.ctx.get("doudizhuGames");
				if (room.phase === "running") runtime?.resume(room);
				return view(entry);
			} catch (error) {
				this.active.delete(agent.id);
				await entry.listener?.close();
				throw error;
			}
		}
		async persistBinding(entry) {
			const persistence = this.persistence();
			if (persistence === void 0) return;
			const promptHash = hashPrompt(entry.strategyPrompt);
			const coordinatorUrl = entry.role === "participant" ? requiredPeer(entry).coordinatorUrl : entry.joinUrls[0];
			if (coordinatorUrl === void 0) throw new Error("coordinator listener has no advertised URL");
			await persistence.putBinding({
				schemaVersion: 1,
				roomId: entry.room.id,
				role: entry.role,
				memberId: entry.parent.id,
				parentSessionId: entry.parent.id,
				...entry.gameSessionId === void 0 ? {} : { gameSessionId: entry.gameSessionId },
				strategyPrompt: entry.strategyPrompt,
				promptHash,
				coordinatorUrl,
				...entry.peer === void 0 ? {} : { resumeToken: entry.peer.resumeToken() },
				state: entry.room.phase === "finished" ? "finished" : "active",
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
		}
		restoreGameSession(entry, binding) {
			if (binding.gameSessionId === void 0) {
				if (entry.room.phase === "running") throw new Error(`durable binding ${JSON.stringify(binding.roomId)} has no Game Session identity`);
				return;
			}
			entry.gameSessionId = this.ctx.lanGameAgents.restore({
				parent: entry.parent,
				childId: SessionId(binding.gameSessionId),
				strategyPrompt: entry.strategyPrompt,
				promptHash: binding.promptHash
			}).childId;
			entry.gameSessionState = "ready";
		}
	};
})();
function view(entry) {
	return {
		memberId: entry.parent.id,
		role: entry.role,
		connection: entry.connection,
		room: structuredClone(entry.room),
		strategyPrompt: entry.strategyPrompt,
		joinUrls: [...entry.joinUrls],
		gameSessionState: entry.gameSessionState,
		...entry.game === void 0 ? {} : { game: structuredClone(entry.game) },
		...entry.privateGame === void 0 ? {} : { privateGame: structuredClone(entry.privateGame) },
		...entry.gameSessionId === void 0 ? {} : { gameSessionId: entry.gameSessionId },
		...entry.error === void 0 ? {} : { error: entry.error }
	};
}
function prompt(value) {
	const resolved = value.trim();
	if (resolved.length === 0 || resolved.length > 8e3) throw new Error("strategy Prompt must contain 1 to 8000 characters");
	return resolved;
}
function hashPrompt(value) {
	return createHash("sha256").update(value).digest("hex");
}
function requiredPeer(entry) {
	if (entry.peer === void 0) throw new Error("participant connection is unavailable");
	return entry.peer;
}
function advertisedUrls(port) {
	const addresses = /* @__PURE__ */ new Set(["127.0.0.1"]);
	for (const rows of Object.values(networkInterfaces())) for (const row of rows ?? []) if (row.family === "IPv4" && !row.internal) addresses.add(row.address);
	return [...addresses].map((address) => `ws://${address}:${port}/`);
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
function normalizedUrl(value) {
	return new URL(value).toString();
}
function coordinatorPort(value) {
	const url = new URL(value);
	const port = Number(url.port);
	if (url.protocol !== "ws:" && url.protocol !== "wss:" || !Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error(`durable coordinator URL ${JSON.stringify(value)} has no valid WebSocket port`);
	return port;
}
function roomSnapshot(room) {
	return {
		id: LanRoomId(room.id),
		code: LanRoomCode(room.code),
		revision: room.revision,
		phase: room.phase,
		coordinatorId: LanMemberId(room.coordinatorId),
		maxMembers: room.maxMembers,
		members: room.members.map(({ resumeToken: _resumeToken, ...member }) => ({
			...member,
			id: LanMemberId(member.id)
		})),
		...room.result === void 0 ? {} : { result: room.result }
	};
}
function recoveredPrompt(binding) {
	const strategyPrompt = prompt(binding.strategyPrompt ?? "");
	if (hashPrompt(strategyPrompt) !== binding.promptHash) throw new Error(`durable binding ${JSON.stringify(binding.roomId)} strategy Prompt does not match its hash`);
	return strategyPrompt;
}
//#endregion
export { LAN_ROOM_WIRE_VERSION, connectLanRoom, LanRoomTransport as default, listenLanRoom, parseLanRoomClientMessage, parseLanRoomServerMessage };
