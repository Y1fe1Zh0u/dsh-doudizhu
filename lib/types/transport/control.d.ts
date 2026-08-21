/** Local DSH Host controller joining room transport to hidden Game Sessions. */
import { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { JsonValue } from '@deepseek-ai/dsh-session';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type LanRoomSnapshot } from '../room/index.ts';
import type { HostLanRoomRequest, JoinLanRoomControlRequest, LanRoomParticipantView } from './control-types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        lanRoomTransport: LanRoomTransport;
    }
}
/** Coordinator request for one local or remote hidden Game Session decision. */
export interface LanRoomDecisionRequest {
    readonly roomId: LanRoomSnapshot['id'];
    readonly memberId: import('../room/index.ts').LanMemberId;
    readonly requestId: string;
    readonly stateVersion: number;
    readonly state: JsonValue;
    readonly signal: AbortSignal;
}
/** Session-scoped local control service exposed only through DSH's ordinary Remote gateway. */
export default class LanRoomTransport extends TypertRemoteService {
    static inject: string[];
    private readonly active;
    /** Install room change, Agent disposal, and provider teardown ownership. */
    constructor(ctx: Context);
    /**
     * Create one three-seat room and bind its coordinator listener on all IPv4 interfaces.
     * @param agent - visible foreground Agent that owns this participant.
     * @param request - only the pre-game strategy Prompt.
     * @returns local participant view after listener readiness.
     */
    host(agent: Agent, request: HostLanRoomRequest): Promise<LanRoomParticipantView>;
    /**
     * Join one coordinator through the Host process and publish this Session's Prompt hash.
     * @param agent - visible foreground Agent that owns this participant.
     * @param request - coordinator address, pairing code, and local strategy Prompt.
     * @returns local participant view after the prompt hash commits.
     */
    join(agent: Agent, request: JoinLanRoomControlRequest): Promise<LanRoomParticipantView>;
    /**
     * Read the current local participant attached to a visible Session.
     * @param agent - exact live foreground Agent.
     * @returns detached local view, or undefined outside a room.
     */
    status(agent: Agent): LanRoomParticipantView | undefined;
    /**
     * Replace the only user-editable game setting and clear readiness.
     * @param agent - exact live foreground Agent.
     * @param strategyPrompt - non-empty Prompt while the lobby remains open.
     * @returns committed local participant view.
     */
    updatePrompt(agent: Agent, strategyPrompt: string): Promise<LanRoomParticipantView>;
    /**
     * Change local readiness; the coordinator starts automatically after all three members lock.
     * @param agent - exact live foreground Agent.
     * @param ready - requested lobby readiness.
     * @returns committed local participant view.
     */
    setReady(agent: Agent, ready: boolean): Promise<LanRoomParticipantView>;
    /**
     * Leave an open lobby or close the coordinator-owned room.
     * @param agent - exact live foreground Agent.
     */
    leave(agent: Agent): Promise<void>;
    /**
     * Request one action from the addressed member's hidden Game Session.
     * @param request - room/member address, correlation values, private state, and cancellation.
     * @returns structured action from the local bridge or remote Host peer.
     */
    requestDecision(request: LanRoomDecisionRequest): Promise<JsonValue>;
    /**
     * Publish one public game projection locally and to every connected member.
     * @param roomId - coordinator-owned room identity.
     * @param game - JSON public game projection.
     */
    publishGameSnapshot(roomId: LanRoomSnapshot['id'], game: JsonValue): void;
    /**
     * Publish one seat-private browser projection only to the addressed local DSH Host.
     * @param roomId - coordinator-owned room identity.
     * @param memberId - exact room member identity.
     * @param game - JSON private game projection.
     */
    publishPrivateGameSnapshot(roomId: LanRoomSnapshot['id'], memberId: import('../room/index.ts').LanMemberId, game: JsonValue): void;
    /**
     * Return coordinator-held resume tokens for inclusion in a durable match commit.
     * @param roomId - exact locally coordinated room identity.
     * @returns detached member-id to token map, or an empty map without a live listener.
     */
    resumeTokens(roomId: LanRoomSnapshot['id']): Readonly<Record<string, string>>;
    private acceptSnapshot;
    private scheduleStart;
    private ensureGameSession;
    private answerRemoteDecision;
    private disposeAgent;
    private closeEntry;
    private assertAvailable;
    private entry;
    private persistence;
    private recoverableBinding;
    private resumeCoordinator;
    private persistBinding;
    private restoreGameSession;
}
//# sourceMappingURL=control.d.ts.map