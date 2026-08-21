/** Host-side participant connection to one coordinator-owned LAN room. */
import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import { LanMemberId, LanRoomCode, } from "../room/index.js";
import { LAN_ROOM_WIRE_VERSION, parseLanRoomServerMessage, } from "./protocol.js";
/**
 * Open and authenticate one Host-side participant connection.
 * @param request - coordinator URL, pairing identity, and lifecycle callbacks.
 * @returns authenticated connection after the joined response arrives.
 */
export async function connectLanRoom(request) {
    const url = roomUrl(request.url);
    const code = LanRoomCode(request.code);
    if (!/^\d{6}$/u.test(code))
        throw new Error('lan-room-ws: code must contain exactly six digits');
    const memberId = LanMemberId(requiredText(request.memberId, 'memberId', 128));
    const reconnect = reconnectPolicy(request.reconnect);
    const pending = new Map();
    const reconnectAbort = new AbortController();
    let socket;
    let room;
    let token;
    let terminal = false;
    let terminalNotified = false;
    let reconnecting = false;
    let handshake;
    const notify = (state) => { request.onConnectionState?.(state); };
    const rejectCommands = (reason) => {
        for (const command of pending.values())
            command.reject(new Error(reason));
        pending.clear();
    };
    const finish = (reason) => {
        if (terminalNotified)
            return;
        terminal = true;
        terminalNotified = true;
        reconnectAbort.abort();
        rejectCommands(reason);
        notify({ status: 'closed', reason });
        request.onClosed?.(reason);
    };
    const handleMessage = (candidate, raw, binary) => {
        if (binary)
            return;
        let message;
        try {
            message = parseLanRoomServerMessage(frameText(raw));
        }
        catch {
            candidate.close(1002, 'invalid coordinator message');
            return;
        }
        switch (message.type) {
            case 'joined': {
                if (handshake?.socket !== candidate || handshake.messageId !== message.messageId)
                    return;
                room = message.room;
                token = message.token;
                request.onSnapshot?.(message.room);
                const accepted = handshake;
                handshake = undefined;
                clearTimeout(accepted.timer);
                notify({ status: 'connected' });
                accepted.resolve();
                return;
            }
            case 'ack': {
                room = message.room;
                request.onSnapshot?.(message.room);
                const command = pending.get(message.messageId);
                pending.delete(message.messageId);
                command?.resolve(message.room);
                return;
            }
            case 'snapshot':
                room = message.room;
                request.onSnapshot?.(message.room);
                return;
            case 'room-closed':
                finish('room closed by coordinator');
                candidate.close(1000, 'room closed by coordinator');
                return;
            case 'decision-request':
                request.onDecisionRequest?.({
                    requestId: message.requestId,
                    stateVersion: message.stateVersion,
                    state: message.state,
                });
                return;
            case 'game-snapshot':
                request.onGameSnapshot?.(message.game);
                return;
            case 'private-game-snapshot':
                request.onPrivateGameSnapshot?.(message.game);
                return;
            case 'error': {
                if (message.messageId === undefined)
                    return;
                if (handshake?.socket === candidate && handshake.messageId === message.messageId) {
                    const rejected = handshake;
                    handshake = undefined;
                    clearTimeout(rejected.timer);
                    rejected.reject(new Error(`${message.code}: ${message.message}`));
                    candidate.terminate();
                    return;
                }
                const command = pending.get(message.messageId);
                pending.delete(message.messageId);
                if (message.room !== undefined) {
                    room = message.room;
                    request.onSnapshot?.(message.room);
                }
                if (message.code === 'LAN_ROOM_STALE_REVISION' && message.room !== undefined && command?.retry !== undefined) {
                    command.retry(message.room);
                    return;
                }
                command?.reject(new Error(`${message.code}: ${message.message}`));
                return;
            }
            default:
                message;
        }
    };
    const open = (message) => new Promise((resolve, reject) => {
        const candidate = new WebSocket(url);
        socket = candidate;
        const timer = setTimeout(() => {
            if (handshake?.socket !== candidate)
                return;
            const rejected = handshake;
            handshake = undefined;
            rejected.reject(new Error('LAN room handshake timed out'));
            candidate.terminate();
        }, reconnect.handshakeTimeoutMs);
        handshake = { socket: candidate, messageId: message.messageId, timer, resolve, reject };
        candidate.on('message', (raw, binary) => { handleMessage(candidate, raw, binary); });
        candidate.once('open', () => { send(candidate, message); });
        candidate.on('error', (error) => {
            if (handshake?.socket !== candidate)
                return;
            const rejected = handshake;
            handshake = undefined;
            clearTimeout(rejected.timer);
            rejected.reject(error);
        });
        candidate.once('close', (_code, rawReason) => {
            const reason = rawReason.length === 0 ? 'connection closed unexpectedly' : rawReason.toString();
            if (handshake?.socket === candidate) {
                const rejected = handshake;
                handshake = undefined;
                clearTimeout(rejected.timer);
                rejected.reject(new Error(reason));
            }
            if (socket !== candidate)
                return;
            socket = undefined;
            rejectCommands(`LAN room command failed because the socket closed: ${reason}`);
            if (terminal || token === undefined || room === undefined || reconnecting)
                return;
            void reconnectAfter(reason);
        });
    });
    const reconnectAfter = async (reason) => {
        reconnecting = true;
        for (let attempt = 1; attempt <= reconnect.maxAttempts && !terminal; attempt += 1) {
            const delayMs = Math.min(reconnect.initialDelayMs * 2 ** (attempt - 1), reconnect.maxDelayMs);
            notify({ status: 'reconnecting', attempt, delayMs, reason });
            await waitForRetry(delayMs, reconnectAbort.signal);
            if (reconnectAbort.signal.aborted)
                break;
            const authoritativeRoom = currentRoom(room);
            const resumeToken = token;
            if (resumeToken === undefined)
                break;
            try {
                await open({
                    version: LAN_ROOM_WIRE_VERSION,
                    type: 'resume',
                    messageId: randomUUID(),
                    roomId: authoritativeRoom.id,
                    memberId,
                    token: resumeToken,
                });
                reconnecting = false;
                return;
            }
            catch (error) {
                reason = error instanceof Error ? error.message : String(error);
                if (socket !== undefined) {
                    const failed = socket;
                    socket = undefined;
                    failed.terminate();
                }
            }
        }
        reconnecting = false;
        if (!terminal)
            finish(`LAN room reconnect exhausted: ${reason}`);
    };
    notify({ status: 'connecting' });
    try {
        await open(request.resume === undefined
            ? { version: LAN_ROOM_WIRE_VERSION, type: 'join', messageId: randomUUID(), code, memberId }
            : {
                version: LAN_ROOM_WIRE_VERSION,
                type: 'resume',
                messageId: randomUUID(),
                roomId: requiredText(request.resume.roomId, 'resume.roomId', 256),
                memberId,
                token: resumeToken(request.resume.token),
            });
    }
    catch (error) {
        terminal = true;
        reconnectAbort.abort();
        socket?.terminate();
        throw error;
    }
    const command = (message) => {
        const active = socket;
        if (terminal || active?.readyState !== WebSocket.OPEN)
            return Promise.reject(new Error('LAN room connection is not connected'));
        return new Promise((resolve, reject) => {
            const dispatch = (expectedRevision, allowRetry) => {
                const current = socket;
                if (terminal || current?.readyState !== WebSocket.OPEN) {
                    reject(new Error('LAN room command failed because the connection is not connected'));
                    return;
                }
                const messageId = randomUUID();
                pending.set(messageId, {
                    resolve,
                    reject,
                    ...(allowRetry ? { retry: (authoritative) => { dispatch(authoritative.revision, false); } } : {}),
                });
                send(current, { ...message, version: LAN_ROOM_WIRE_VERSION, messageId, expectedRevision });
            };
            dispatch(currentRoom(room).revision, true);
        });
    };
    return {
        memberId,
        coordinatorUrl: url,
        resumeToken: () => {
            if (token === undefined)
                throw new Error('LAN room connection has no resume token');
            return token;
        },
        snapshot: () => currentRoom(room),
        updatePrompt: promptHash => command({ type: 'update-prompt', promptHash }),
        setReady: ready => command({ type: 'set-ready', ready }),
        leave: () => command({ type: 'leave' }),
        respondDecision: (requestId, stateVersion, action) => {
            const active = socket;
            if (terminal || active?.readyState !== WebSocket.OPEN)
                throw new Error('LAN room connection is not connected');
            send(active, { version: 1, type: 'decision-response', requestId, stateVersion, action });
        },
        close: async () => {
            if (terminal)
                return;
            finish('participant closed connection');
            const active = socket;
            socket = undefined;
            if (active !== undefined)
                await closeSocket(active);
        },
    };
}
function resumeToken(value) {
    if (!/^[0-9a-f]{64}$/u.test(value))
        throw new Error('lan-room-ws: resume.token must be 64 lowercase hexadecimal characters');
    return value;
}
function reconnectPolicy(value) {
    const maxAttempts = boundedInteger(value?.maxAttempts ?? 8, 'reconnect.maxAttempts', 0, 32);
    const initialDelayMs = boundedInteger(value?.initialDelayMs ?? 250, 'reconnect.initialDelayMs', 1, 60_000);
    const maxDelayMs = boundedInteger(value?.maxDelayMs ?? 4_000, 'reconnect.maxDelayMs', 1, 60_000);
    const handshakeTimeoutMs = boundedInteger(value?.handshakeTimeoutMs ?? 5_000, 'reconnect.handshakeTimeoutMs', 1, 60_000);
    if (maxDelayMs < initialDelayMs)
        throw new Error('lan-room-ws: reconnect.maxDelayMs must be at least reconnect.initialDelayMs');
    return { maxAttempts, initialDelayMs, maxDelayMs, handshakeTimeoutMs };
}
function boundedInteger(value, field, minimum, maximum) {
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
        throw new Error(`lan-room-ws: ${field} must be an integer from ${minimum} through ${maximum}`);
    }
    return value;
}
function waitForRetry(delayMs, signal) {
    if (signal.aborted)
        return Promise.resolve();
    return new Promise((resolve) => {
        const timer = setTimeout(done, delayMs);
        function done() {
            clearTimeout(timer);
            signal.removeEventListener('abort', done);
            resolve();
        }
        signal.addEventListener('abort', done, { once: true });
    });
}
function roomUrl(value) {
    const url = new URL(value);
    if (url.protocol !== 'ws:')
        throw new Error('lan-room-ws: coordinator URL must use ws://');
    if (url.username !== '' || url.password !== '' || url.search !== '' || url.hash !== '') {
        throw new Error('lan-room-ws: coordinator URL cannot contain credentials, query, or fragment');
    }
    return url.toString();
}
function requiredText(value, field, maxLength) {
    if (value.length === 0 || value.length > maxLength || value.trim() !== value) {
        throw new Error(`lan-room-ws: ${field} must contain 1 to ${maxLength} characters with no surrounding whitespace`);
    }
    return value;
}
function currentRoom(room) {
    if (room === undefined)
        throw new Error('LAN room connection has no snapshot');
    return room;
}
function send(socket, message) {
    socket.send(JSON.stringify(message));
}
function closeSocket(socket) {
    if (socket.readyState === WebSocket.CLOSED)
        return Promise.resolve();
    return new Promise((resolve) => {
        socket.once('close', resolve);
        if (socket.readyState === WebSocket.CONNECTING)
            socket.terminate();
        else
            socket.close(1000, 'participant closed connection');
    });
}
function frameText(raw) {
    if (Array.isArray(raw))
        return Buffer.concat(raw).toString('utf8');
    if (raw instanceof ArrayBuffer)
        return Buffer.from(raw).toString('utf8');
    return raw.toString('utf8');
}
//# sourceMappingURL=connection.js.map