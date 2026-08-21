/** Runtime guards for game payloads crossing the Host Remote boundary as JSON. */
import type { JsonValue } from '@deepseek-ai/dsh-api-remotes/client';
import type { DoudizhuPrivateView } from '../doudizhu/client.ts';
import type { DoudizhuTableSnapshot } from '../doudizhu-runtime/client.ts';
/**
 * Parse one public game JSON payload.
 * @param value - Host Remote game payload.
 * @returns usable DouDizhu snapshot, or undefined for absent, foreign, or malformed data.
 */
export declare function doudizhuTableSnapshot(value: JsonValue | undefined): DoudizhuTableSnapshot | undefined;
/**
 * Parse one seat-private game JSON payload.
 * @param value - Host Remote private-game payload.
 * @returns usable local private view, or undefined before the first addressed decision.
 */
export declare function doudizhuPrivateSnapshot(value: JsonValue | undefined): DoudizhuPrivateView | undefined;
//# sourceMappingURL=game-view.d.ts.map