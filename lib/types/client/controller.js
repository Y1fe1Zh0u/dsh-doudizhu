/** React-free browser controller for the local LAN room Remote namespace. */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client';
const INITIAL_STATE = { status: 'loading', participant: undefined, pending: false, error: undefined };
/** Polls the local Host projection and serializes user mutations. */
export class LanGameClient {
    sessionId;
    remote;
    /** Stable observable state source consumed by the conversation-view hook. */
    store = createSnapshotStore(INITIAL_STATE);
    timer;
    refreshing;
    fingerprint = '';
    generation = 0;
    /** @param sessionId - visible foreground Session owning the game participant. @param remote - mounted Host Remote namespace. */
    constructor(sessionId, remote) {
        this.sessionId = sessionId;
        this.remote = remote;
    }
    /**
     * Start polling immediately and every 750 ms.
     * @returns disposer that stops polling.
     */
    start() {
        void this.refresh();
        this.timer ??= setInterval(() => { void this.refresh(); }, 750);
        return () => {
            if (this.timer !== undefined)
                clearInterval(this.timer);
            this.timer = undefined;
        };
    }
    /**
     * Create a coordinator room.
     * @param strategyPrompt - local pre-game strategy.
     * @returns after Host settlement.
     */
    host(strategyPrompt) {
        return this.mutate(() => this.remote.host(this.sessionId, { strategyPrompt }));
    }
    /**
     * Join a coordinator room.
     * @param request - coordinator URL, code, and strategy.
     * @returns after Host settlement.
     */
    join(request) {
        return this.mutate(() => this.remote.join(this.sessionId, request));
    }
    /**
     * Save the editable lobby Prompt.
     * @param strategyPrompt - replacement strategy.
     * @returns after Host settlement.
     */
    updatePrompt(strategyPrompt) {
        return this.mutate(() => this.remote.updatePrompt(this.sessionId, strategyPrompt));
    }
    /**
     * Change readiness.
     * @param ready - requested state.
     * @returns after Host settlement.
     */
    setReady(ready) {
        return this.mutate(() => this.remote.setReady(this.sessionId, ready));
    }
    /** Leave the current lobby. @returns after Host settlement. */
    leave() {
        return this.mutate(async () => {
            const result = await this.remote.leave(this.sessionId);
            if (!result.ok)
                return result;
            return { ok: true, value: undefined };
        }, true);
    }
    refresh() {
        if (this.refreshing !== undefined)
            return this.refreshing;
        const generation = this.generation;
        this.refreshing = this.remote.status(this.sessionId).then((result) => {
            if (generation !== this.generation)
                return;
            if (!result.ok) {
                this.publish({ ...this.store.getSnapshot(), status: 'idle', error: failure(result) });
                return;
            }
            this.publish(result.value === undefined
                ? { status: 'idle', participant: undefined, pending: this.store.getSnapshot().pending, error: undefined }
                : { status: 'room', participant: result.value, pending: this.store.getSnapshot().pending, error: undefined });
        }).catch((error) => {
            if (generation !== this.generation)
                return;
            this.publish({ ...this.store.getSnapshot(), status: 'idle', error: messageOf(error) });
        }).finally(() => { this.refreshing = undefined; });
        return this.refreshing;
    }
    async mutate(operation, leave = false) {
        if (this.store.getSnapshot().pending)
            return;
        this.generation += 1;
        this.publish({ ...this.store.getSnapshot(), pending: true, error: undefined });
        try {
            const result = await operation();
            if (!result.ok) {
                this.publish({ ...this.store.getSnapshot(), pending: false, error: failure(result) });
            }
            else if (leave) {
                this.publish({ status: 'idle', participant: undefined, pending: false, error: undefined });
            }
            else if (result.value !== undefined) {
                this.publish({ status: 'room', participant: result.value, pending: false, error: undefined });
            }
        }
        catch (error) {
            this.publish({ ...this.store.getSnapshot(), pending: false, error: messageOf(error) });
        }
    }
    publish(next) {
        const fingerprint = JSON.stringify(next);
        if (fingerprint === this.fingerprint)
            return;
        this.fingerprint = fingerprint;
        this.store.set(next);
    }
}
function failure(result) {
    return `${result.error.message} (${result.error.code})`;
}
function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=controller.js.map