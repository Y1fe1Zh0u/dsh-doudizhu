/** Full conversation-view card table with lobby controls. */
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { LanGameClient } from './controller.ts';
/** Session-bound controller passed by the slot registration. */
export interface LanGameTableInjected {
    readonly hooks: {
        readonly lanGame: LanGameClient['store'];
    };
    readonly start: () => () => void;
    readonly host: (strategyPrompt: string) => Promise<void>;
    readonly join: (request: {
        url: string;
        code: string;
        strategyPrompt: string;
    }) => Promise<void>;
    readonly updatePrompt: (strategyPrompt: string) => Promise<void>;
    readonly setReady: (ready: boolean) => Promise<void>;
    readonly leave: () => Promise<void>;
}
type Props = ConvViewProps & InjectFace<LanGameTableInjected> & PropsLocale<'lanGame'>;
/** Render setup, lobby, and autonomous-game states without replacing the resident composer. */
export declare function LanGameTable({ useLanGame, start, host, join, updatePrompt, setReady, leave, t, }: Props): import("react").JSX.Element;
export {};
//# sourceMappingURL=LanGameTable.d.ts.map