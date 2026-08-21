/** Coordinator runtime connecting deterministic rules to local and remote hidden Game Sessions. */
import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { type DoudizhuAction, type DoudizhuPrivateView } from '../doudizhu/index.ts';
import { type LanRoomSnapshot } from '../room/index.ts';
import type { DoudizhuGameRuntimeChanged, DoudizhuGameRuntimeView } from './types.ts';
export type * from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        doudizhuGames: DoudizhuGames;
    }
}
/** Deployment-level match timing and length; the browser exposes none of these as player settings. */
export interface Config {
    /** Positive number of automatically shuffled rounds in one room match. */
    readonly roundsPerMatch?: number;
    /** Public settlement display interval before the next round starts. */
    readonly roundPauseMs?: number;
    /** Coordinator deadline for one local or remote hidden-Session decision. */
    readonly decisionTimeoutMs?: number;
}
/** Starts and drives authoritative matches for locally coordinated running rooms. */
export default class DoudizhuGames extends Service {
    static inject: string[];
    static Config: z<Config>;
    private readonly games;
    private readonly listeners;
    private readonly config;
    /** Subscribe to room lifecycle and own every running match until settlement or close. */
    constructor(ctx: Context, config?: Config);
    /**
     * Return detached active runtime rows.
     * @returns current coordinator matches in insertion order.
     */
    list(): DoudizhuGameRuntimeView[];
    /**
     * Subscribe to active runtime row updates and removals.
     * @param listener - callback receiving committed runtime views.
     * @returns disposer that stops future notifications.
     */
    onChanged(listener: (change: DoudizhuGameRuntimeChanged) => void): () => void;
    /**
     * Resume a restored coordinator room from its validated durable checkpoint.
     * @param room - exact authoritative room rehydrated from the same match record.
     * @returns true when recovery starts or projects an already durable settlement.
     */
    resume(room: LanRoomSnapshot): boolean;
    private start;
    private run;
    private continueMatch;
    private step;
    private createDurableMatch;
    private persistDealStarted;
    private persistDecisionRequested;
    private persistActionCommitted;
    private persistRoundFinished;
    private persistMatchFinished;
    private updateDurable;
    private checkpoint;
    private currentPersistedRoom;
    private recoverableRecord;
    private publish;
    private publishFailure;
    private finishRoom;
    private notify;
}
/**
 * Choose a deliberately small timeout fallback without trying to replace the model's strategy.
 * Passing remains the default, except when the previous opponent is within two cards of winning;
 * then the lowest enumerated legal response is used to keep the game alive.
 * @param view - authoritative seat-private state and ordered legal actions.
 * @returns one legal action already enumerated by the rules engine.
 */
export declare function doudizhuFallbackAction(view: DoudizhuPrivateView): DoudizhuAction;
//# sourceMappingURL=index.d.ts.map