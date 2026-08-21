/** Browser plugin registering the LAN game card table as a conversation view. */
import type { Context } from '@deepseek-ai/cordis';
import { type LanGameKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        lanGame: LanGameKey;
    }
}
/** Required local Remote carrier, locale registry, and conversation slot ledger. */
export declare const inject: string[];
/** Mount the package-owned Remote contribution and register the table view. */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map