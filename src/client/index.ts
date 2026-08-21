/** Browser plugin registering the LAN game card table as a conversation view. */

import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import lanRoomRemote from '../transport/remote.ts'
import { LanGameClient } from './controller.ts'
import { LanGameTable, type LanGameTableInjected } from './LanGameTable.tsx'
import { en, zh, type LanGameKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    lanGame: LanGameKey
  }
}

/** Required local Remote carrier, locale registry, and conversation slot ledger. */
export const inject = ['remote', 'locale', 'slots']

/** Mount the package-owned Remote contribution and register the table view. */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register('lanGame', { zh, en }), 'lan-game-ui: dictionaries')
  ctx.effect(async () => {
    const unmountRemote = await ctx.remote.$mount(lanRoomRemote)
    const viewFiber = ctx.inject(['remote.lanRoomTransport'], (scope) => {
      scope.slots.inject('conversation.view', () => scope.slots.register({
        name: 'conversation.view',
        id: 'lan-game',
        order: 20,
        locale: 'lanGame',
        label: () => scope.locale.bind('lanGame')('view.label'),
        inject: (sessionId: SessionId): LanGameTableInjected => {
          const client = new LanGameClient(sessionId, scope.remote.lanRoomTransport)
          return {
            hooks: { lanGame: client.store },
            start: () => client.start(),
            host: strategyPrompt => client.host(strategyPrompt),
            join: request => client.join(request),
            updatePrompt: strategyPrompt => client.updatePrompt(strategyPrompt),
            setReady: ready => client.setReady(ready),
            leave: () => client.leave(),
          }
        },
      }, LanGameTable))
    })
    await viewFiber
    return async () => {
      await viewFiber.dispose()
      await unmountRemote()
    }
  }, 'lan-game-ui: Remote namespace and conversation view')
}
