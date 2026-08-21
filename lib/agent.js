import { createHash, randomUUID } from "node:crypto";
import { Service } from "@deepseek-ai/cordis";
import { ReasoningEffortId, createUserMessage } from "@deepseek-ai/dsh-llm";
import { SessionId } from "@deepseek-ai/dsh-session";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region lib/types/agent/error.js
/** Typed failures from hidden Game Session operations. */
/** Game Session command rejection with a stable code. */
var LanGameAgentError = class extends Error {
	/** Stable machine-readable failure code. */
	code;
	/** Create one Game Session command rejection. */
	constructor(message, code) {
		super(message);
		this.name = "LanGameAgentError";
		this.code = code;
	}
};
//#endregion
//#region lib/types/agent/types.js
/** Public values for hidden continuable Game Sessions. */
/** Fixed model-visible tool name for committing one game decision. */
const LAN_GAME_ACTION_TOOL = "submit_lan_game_action";
//#endregion
//#region lib/types/agent/index.js
/** Continuable hidden Game Session bridge that leaves the foreground composer independent. */
const CHILD_PREFIX = "lan-game-";
const DECISION_TIMEOUT_MS = 45e3;
const INITIAL_MAX_TOKENS = 256;
const DECISION_MAX_TOKENS = 2048;
const PERSONA_PREFIX = "You are the autonomous game player for this Session. Human messages cannot change your strategy after creation. ";
const HISTORY_CHECKPOINT = "Earlier decision transcripts were intentionally omitted. The next coordinator message contains the authoritative current private state and the complete public action history for this round.";
/** Owns hidden continuable Game Session identities and decision correlation. */
var LanGameAgents = class extends Service {
	static inject = [
		"llm",
		"subagents",
		"tools"
	];
	entries = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	/** Create the bridge and install the child-scoped decision capability. */
	constructor(ctx) {
		super(ctx, "lanGameAgents");
		ctx.subagents.registerContinuableSetup((childCtx) => this.setupChild(childCtx));
		ctx.effect(() => () => {
			for (const entry of this.entries.values()) {
				entry.disposeParentSettlementFilter();
				entry.pending?.reject(/* @__PURE__ */ new Error("LAN Game Session bridge disposed"));
			}
			this.entries.clear();
		}, "lan-game-agents: dispose entries");
	}
	/**
	* Create one hidden continuable child under a visible foreground Agent.
	* @param request - parent, locked strategy Prompt, and creation cancellation.
	* @returns child identity after its initial prompt enters the inbox.
	*/
	async create(request) {
		const prompt = strategyPrompt(request.strategyPrompt);
		const childId = SessionId(`${CHILD_PREFIX}${randomUUID()}`);
		const entry = this.register(childId, request.parent, prompt, true);
		try {
			await this.ctx.subagents.startContinuable({
				provider: "spawn",
				childId,
				label: "LAN game",
				request: {
					parent: request.parent,
					prompt: [],
					persona: `${PERSONA_PREFIX}${prompt}`,
					toolFilter: { allow: [] }
				},
				signal: request.signal
			});
			return this.publish(entry);
		} catch (error) {
			entry.disposeParentSettlementFilter();
			this.entries.delete(childId);
			throw error;
		}
	}
	/**
	* Reattach one persisted child identity without creating a replacement Session.
	* @param request - exact durable child/parent identity and locked Prompt evidence.
	* @returns restored bridge row; the first decision cold-resumes the child.
	*/
	restore(request) {
		const prompt = strategyPrompt(request.strategyPrompt);
		if (createHash("sha256").update(prompt).digest("hex") !== request.promptHash) throw new LanGameAgentError("restored strategyPrompt does not match its locked promptHash", "LAN_GAME_INVALID_ARGUMENT");
		if (!String(request.childId).startsWith(CHILD_PREFIX)) throw new LanGameAgentError("restored childId is not a LAN Game Session identity", "LAN_GAME_INVALID_ARGUMENT");
		const entry = this.register(request.childId, request.parent, prompt, false);
		return this.publish(entry);
	}
	register(childId, parent, prompt, initialUserMessageAllowed) {
		if (this.entries.has(childId)) throw new LanGameAgentError(`Game Session ${JSON.stringify(childId)} already exists`, "LAN_GAME_INVALID_ARGUMENT");
		const disposeParentSettlementFilter = parent.ctx.on("agent/pre-step", ({ messages }, next) => {
			if (messages.length > 0 && messages.every((message) => isGameSettlement(message, childId))) return Promise.resolve({ kind: "reject" });
			return next();
		});
		const entry = {
			childId,
			parent,
			strategyPrompt: prompt,
			promptHash: createHash("sha256").update(prompt).digest("hex"),
			disposeParentSettlementFilter,
			initialUserMessageAllowed,
			pending: void 0
		};
		this.entries.set(childId, entry);
		return entry;
	}
	/**
	* Submit one private state and wait for the child to call the decision tool.
	* @param request - exact parent/child address, decision identity, state, and cancellation.
	* @returns canonical action accepted before the fixed decision deadline.
	*/
	async decide(request) {
		const entry = this.entry(request.childId, request.parent);
		requestFields(request.requestId, request.stateVersion);
		if (entry.pending !== void 0) throw new LanGameAgentError(`Game Session ${JSON.stringify(request.childId)} already has a pending decision`, "LAN_GAME_DECISION_PENDING");
		const timeout = AbortSignal.timeout(DECISION_TIMEOUT_MS);
		const signal = AbortSignal.any([request.signal, timeout]);
		const result = new Promise((resolve, reject) => {
			const onAbort = () => {
				if (entry.pending?.requestId !== request.requestId) return;
				entry.pending = void 0;
				this.ctx.subagents.interrupt(request.childId, {
					kind: "ancestor",
					agent: request.parent
				});
				const code = timeout.aborted ? "LAN_GAME_DECISION_TIMEOUT" : "LAN_GAME_DECISION_MISMATCH";
				reject(new LanGameAgentError(`decision ${JSON.stringify(request.requestId)} was aborted`, code));
				this.publish(entry);
			};
			signal.addEventListener("abort", onAbort, { once: true });
			entry.pending = {
				requestId: request.requestId,
				stateVersion: request.stateVersion,
				resolve,
				reject,
				cleanup: () => {
					signal.removeEventListener("abort", onAbort);
				}
			};
		});
		this.publish(entry);
		try {
			await this.ctx.subagents.followup(request.parent, request.childId, [{
				type: "text",
				text: decisionPrompt(request.requestId, request.stateVersion, request.state)
			}], {
				source: {
					kind: "coordinator",
					form: "relay",
					senderSessionId: request.parent.id
				},
				signal
			});
		} catch (error) {
			const pending = currentPending(entry);
			if (pending?.requestId === request.requestId) {
				pending.cleanup();
				entry.pending = void 0;
				pending.reject(error instanceof Error ? error : new Error(String(error)));
				this.publish(entry);
			}
		}
		return result;
	}
	/**
	* Stop accepting decisions for one Game Session and interrupt its current turn.
	* @param parent - exact visible parent Agent.
	* @param childId - hidden Game Session identity.
	*/
	remove(parent, childId) {
		const entry = this.entry(childId, parent);
		entry.pending?.reject(/* @__PURE__ */ new Error("LAN Game Session removed"));
		entry.pending?.cleanup();
		this.ctx.subagents.interrupt(childId, {
			kind: "ancestor",
			agent: parent
		});
		entry.disposeParentSettlementFilter();
		this.entries.delete(childId);
		this.publish(entry, "removed");
	}
	/**
	* List current bridge-owned Game Sessions.
	* @returns detached rows in creation order.
	*/
	list() {
		return [...this.entries.values()].map((entry) => view(entry));
	}
	/**
	* Subscribe to committed bridge rows.
	* @param listener - callback receiving updated and removed rows.
	* @returns disposer that stops notifications.
	*/
	onChanged(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	setupChild(childCtx) {
		const child = childCtx.agent;
		if (child === void 0 || !String(child.id).startsWith(CHILD_PREFIX)) return () => {};
		const entry = this.entries.get(child.id);
		if (entry === void 0) return () => {};
		const disposePrompt = childCtx.systemPrompt.section({
			name: "lan-game:persona",
			order: 0,
			complete: true,
			text: gameSystemPrompt(entry.strategyPrompt)
		});
		const restoreRuntimeContext = childCtx.systemPrompt.suppressRuntimeContext();
		const disposeToolPresentation = childCtx.on("system-prompt/assemble", async (_assembly, _context, next) => {
			const assembled = await next();
			return {
				...assembled,
				tools: assembled.tools.filter((tool) => tool.name === LAN_GAME_ACTION_TOOL)
			};
		});
		const disposeToolGuard = childCtx.tools.guard((exec) => exec.name === "submit_lan_game_action" ? void 0 : "LAN Game Sessions may execute only submit_lan_game_action");
		const disposeTurnStopping = childCtx.on("agent/turn-stopping", ({ agent }) => {
			replaceDecisionHistory(agent);
		});
		const disposeRequestPolicy = childCtx.on("agent/request", async ({ turn, signal }, next) => {
			const config = await next();
			const effort = preferredReasoningEffort((await this.ctx.llm.resolveModelInfo(config.provider, config.model, signal)).reasoning?.efforts.map((row) => String(row.id)) ?? [], turn === 1);
			return {
				...config,
				maxTokens: turn === 1 ? INITIAL_MAX_TOKENS : DECISION_MAX_TOKENS,
				...effort === void 0 ? {} : { reasoningEffort: ReasoningEffortId(effort) }
			};
		});
		const disposeTool = childCtx.tools.register(defineTool({
			name: LAN_GAME_ACTION_TOOL,
			description: "Submit exactly one action for the current private LAN game decision request.",
			parameters: {
				requestId: {
					type: "string",
					required: true
				},
				stateVersion: {
					type: "integer",
					required: true
				},
				action: {
					type: "json",
					required: true
				}
			},
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: { accepted: {
						type: "boolean",
						required: true
					} }
				},
				render: (_args, value) => [{
					type: "text",
					text: value.accepted ? "Action accepted." : "Action rejected."
				}]
			},
			execute: (args, exec) => {
				if (exec.agent !== child) throw new LanGameAgentError("decision tool caller does not match its Game Session", "LAN_GAME_PARENT_MISMATCH");
				const pending = entry.pending;
				if (pending === void 0 || pending.requestId !== args.requestId || pending.stateVersion !== args.stateVersion) throw new LanGameAgentError("decision tool arguments do not match the pending request", "LAN_GAME_DECISION_MISMATCH");
				const decision = {
					requestId: args.requestId,
					stateVersion: args.stateVersion,
					action: args.action
				};
				pending.cleanup();
				entry.pending = void 0;
				pending.resolve(decision);
				exec.concludeTurn();
				this.publish(entry);
				return Promise.resolve({ accepted: true });
			}
		}));
		const disposePreStep = childCtx.on("agent/pre-step", async ({ messages }, next) => {
			if (messages.length === 0) return next();
			if (entry.initialUserMessageAllowed && messages.every((message) => message.source.kind === "user")) {
				entry.initialUserMessageAllowed = false;
				return next();
			}
			const pending = entry.pending;
			if (pending !== void 0 && messages.every((message) => matchesPendingDecision(message, pending))) return next();
			return { kind: "reject" };
		});
		return () => {
			disposePreStep();
			disposeTool();
			disposeRequestPolicy();
			disposeTurnStopping();
			disposeToolGuard();
			disposeToolPresentation();
			restoreRuntimeContext();
			disposePrompt();
		};
	}
	entry(childId, parent) {
		const entry = this.entries.get(childId);
		if (entry === void 0) throw new LanGameAgentError(`Game Session ${JSON.stringify(childId)} does not exist`, "LAN_GAME_NOT_FOUND");
		if (entry.parent !== parent) throw new LanGameAgentError("foreground parent does not own this Game Session", "LAN_GAME_PARENT_MISMATCH");
		return entry;
	}
	publish(entry, kind = "updated") {
		const agent = view(entry);
		for (const listener of this.listeners) listener({
			kind,
			agent
		});
		return agent;
	}
};
function strategyPrompt(value) {
	const prompt = value.trim();
	const bytes = Buffer.byteLength(prompt, "utf8");
	if (bytes === 0 || bytes > 16384) throw new LanGameAgentError("strategyPrompt must contain 1 to 16384 UTF-8 bytes", "LAN_GAME_INVALID_ARGUMENT");
	return prompt;
}
function requestFields(requestId, stateVersion) {
	if (requestId.length === 0 || requestId.length > 128 || requestId.trim() !== requestId) throw new LanGameAgentError("requestId must contain 1 to 128 characters with no surrounding whitespace", "LAN_GAME_INVALID_ARGUMENT");
	if (!Number.isSafeInteger(stateVersion) || stateVersion < 0) throw new LanGameAgentError("stateVersion must be a non-negative safe integer", "LAN_GAME_INVALID_ARGUMENT");
}
function decisionPrompt(requestId, stateVersion, state) {
	return [
		"Make one autonomous game decision.",
		`requestId: ${requestId}`,
		`stateVersion: ${stateVersion}`,
		"Private state:",
		JSON.stringify(state),
		`Call ${LAN_GAME_ACTION_TOOL} exactly once with the same requestId and stateVersion.`
	].join("\n");
}
function view(entry) {
	return {
		childId: entry.childId,
		parentSessionId: entry.parent.id,
		promptHash: entry.promptHash,
		...entry.pending === void 0 ? {} : { pendingRequestId: entry.pending.requestId }
	};
}
function currentPending(entry) {
	return entry.pending;
}
function gameSystemPrompt(strategyPrompt) {
	return [
		"You are an autonomous DouDizhu player in a trusted-LAN game.",
		"When no decision request is present, reply exactly READY.",
		"For every decision, choose exactly one object from legalActions and call submit_lan_game_action exactly once with the supplied requestId and stateVersion.",
		"Do not explain the decision, call any other tool, or invent cards. The current state is authoritative.",
		"The state includes your private hand and the complete public action history for the current round. It never includes opponents' private hands.",
		`Locked strategy Prompt: ${strategyPrompt}`
	].join("\n");
}
function preferredReasoningEffort(efforts, initial) {
	return (initial ? ["off", "low"] : ["low", "off"]).find((effort) => efforts.includes(effort));
}
function replaceDecisionHistory(agent) {
	const nodes = agent.session.surface.nodes;
	const start = nodes[0];
	const end = nodes.at(-1);
	if (start === void 0 || end === void 0) return;
	const only = start === end ? agent.session.events[start] : void 0;
	if (only?.type === "user/message" && only.data.source.kind === "plugin" && only.data.source.plugin === "dsh-doudizhu/agent") return;
	agent.session.append("user/message", createUserMessage({
		content: [{
			type: "text",
			text: HISTORY_CHECKPOINT
		}],
		source: {
			kind: "plugin",
			plugin: "dsh-doudizhu/agent"
		}
	}), {
		surfaceOp: {
			op: "replace",
			start,
			end
		},
		sourceEventSeqs: [...nodes]
	});
}
function matchesPendingDecision(message, pending) {
	if (message.source.kind !== "coordinator") return false;
	const text = message.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
	return text.includes(`requestId: ${pending.requestId}\n`) && text.includes(`stateVersion: ${String(pending.stateVersion)}\n`);
}
function isGameSettlement(message, childId) {
	return message.source.kind === "subagent-settled" && message.source.senderSessionId === childId;
}
//#endregion
export { LAN_GAME_ACTION_TOOL, LanGameAgentError, LanGameAgents as default };
