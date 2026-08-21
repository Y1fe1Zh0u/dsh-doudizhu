/** Browser plugin registering the LAN game card table as a conversation view. */
import lanRoomRemote from "../transport/remote.js";
import { LanGameClient } from "./controller.js";
import { LanGameTable } from "./LanGameTable.js";
import { en, zh } from "./locales.js";
/** Required local Remote carrier, locale registry, and conversation slot ledger. */
export const inject = ['remote', 'locale', 'slots'];
/** Mount the package-owned Remote contribution and register the table view. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register('lanGame', { zh, en }), 'lan-game-ui: dictionaries');
    ctx.effect(async () => {
        const unmountRemote = await ctx.remote.$mount(lanRoomRemote);
        const viewFiber = ctx.inject(['remote.lanRoomTransport'], (scope) => {
            scope.slots.inject('conversation.view', () => scope.slots.register({
                name: 'conversation.view',
                id: 'lan-game',
                order: 20,
                locale: 'lanGame',
                label: () => scope.locale.bind('lanGame')('view.label'),
                inject: (sessionId) => {
                    const client = new LanGameClient(sessionId, scope.remote.lanRoomTransport);
                    return {
                        hooks: { lanGame: client.store },
                        start: () => client.start(),
                        host: strategyPrompt => client.host(strategyPrompt),
                        join: request => client.join(request),
                        updatePrompt: strategyPrompt => client.updatePrompt(strategyPrompt),
                        setReady: ready => client.setReady(ready),
                        leave: () => client.leave(),
                    };
                },
            }, LanGameTable));
        });
        await viewFiber;
        return async () => {
            await viewFiber.dispose();
            await unmountRemote();
        };
    }, 'lan-game-ui: Remote namespace and conversation view');
}
//# sourceMappingURL=index.js.map