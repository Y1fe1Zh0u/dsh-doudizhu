/** Continuable hidden Game Session bridge that leaves the foreground composer independent. */
import { Context, Service } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { SessionId } from '@deepseek-ai/dsh-session';
import { type CreateLanGameAgentRequest, type LanGameAgentChanged, type LanGameAgentView, type LanGameDecision, type RequestLanGameDecision, type RestoreLanGameAgentRequest } from './types.ts';
export * from './types.ts';
export * from './error.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        lanGameAgents: LanGameAgents;
    }
}
/** Owns hidden continuable Game Session identities and decision correlation. */
export default class LanGameAgents extends Service {
    static inject: string[];
    private readonly entries;
    private readonly listeners;
    /** Create the bridge and install the child-scoped decision capability. */
    constructor(ctx: Context);
    /**
     * Create one hidden continuable child under a visible foreground Agent.
     * @param request - parent, locked strategy Prompt, and creation cancellation.
     * @returns child identity after its initial prompt enters the inbox.
     */
    create(request: CreateLanGameAgentRequest): Promise<LanGameAgentView>;
    /**
     * Reattach one persisted child identity without creating a replacement Session.
     * @param request - exact durable child/parent identity and locked Prompt evidence.
     * @returns restored bridge row; the first decision cold-resumes the child.
     */
    restore(request: RestoreLanGameAgentRequest): LanGameAgentView;
    private register;
    /**
     * Submit one private state and wait for the child to call the decision tool.
     * @param request - exact parent/child address, decision identity, state, and cancellation.
     * @returns canonical action accepted before the fixed decision deadline.
     */
    decide(request: RequestLanGameDecision): Promise<LanGameDecision>;
    /**
     * Stop accepting decisions for one Game Session and interrupt its current turn.
     * @param parent - exact visible parent Agent.
     * @param childId - hidden Game Session identity.
     */
    remove(parent: Agent, childId: SessionId): void;
    /**
     * List current bridge-owned Game Sessions.
     * @returns detached rows in creation order.
     */
    list(): LanGameAgentView[];
    /**
     * Subscribe to committed bridge rows.
     * @param listener - callback receiving updated and removed rows.
     * @returns disposer that stops notifications.
     */
    onChanged(listener: (change: LanGameAgentChanged) => void): () => void;
    private setupChild;
    private entry;
    private publish;
}
//# sourceMappingURL=index.d.ts.map