import { BroadcastChannel as BroadcastChannelImpl } from 'broadcast-channel'
import type { PiniaPluginContext } from 'pinia'
import { serialize } from './utils'
import type { Options } from './vanilla'

function stateHasKey(key: string, $state: PiniaPluginContext['store']['$state']) {
  return Object.keys($state).includes(key)
}

/**
 * Adds a `share` option to your store to share state across browser tabs.
 *
 * @example
 *
 * ```ts
 * import { PiniaSharedState } from 'pinia-shared-state'
 *
 * // Pass the plugin to your application's pinia plugin
 * pinia.use(PiniaSharedState({ enable: true, initialize: false, type: 'localstorage' }))
 * ```
 *
 * @param options - Global plugin options.
 * @param options.enable - Enable/disable sharing of state for all stores.
 * @param options.initialize - Immediately recover the shared state from another tab.
 * @param options.type - 'native', 'idb', 'localstorage', 'node'.
 * @param options.serializer - Custom serializer to serialize store state before broadcasting.
 */
export function PiniaSharedState({
  enable = true,
  initialize = true,
  type,
  serializer,
}: Options & { enable?: boolean }) {
  return ({ store, options }: PiniaPluginContext) => {
    const isEnabled = options?.share?.enable ?? enable
    const omittedKeys = options?.share?.omit ?? []
    if (!isEnabled)
      return

    const channel = new BroadcastChannelImpl(store.$id, {
      type,
    })

    let timestamp = 0
    let externalUpdate = false

    const keysToUpdate = Object.keys(store.$state).filter(key => !omittedKeys.includes(key) && stateHasKey(key, store.$state))

    channel.onmessage = (newState) => {
      if (newState === undefined) {
        channel.postMessage({
          timestamp,
          state: serialize(store.$state, serializer),
        })
        return
      }

      if (newState.timestamp <= timestamp)
        return

      externalUpdate = true
      timestamp = Date.now()

      store.$patch((state) => {
        keysToUpdate.forEach((key) => {
          state[key] = newState.state[key]
        })
      })
    }

    const shouldInitialize = options?.share?.initialize ?? initialize
    if (shouldInitialize)
      channel.postMessage(undefined)

    store.$subscribe((_, state) => {
      if (!externalUpdate) {
        timestamp = Date.now()
        channel.postMessage({
          timestamp,
          state: serialize(state, serializer),
        })
      }
      externalUpdate = false
    })
  }
}

export { share } from './vanilla'

declare module 'pinia' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    /**
     * Override global config.
     *
     * @example
     *
     * ```js
     * defineStore({
     *   id: 'counter',
     *   state: () => ({ count: 0, name: 'John Doe' })
     *   share: {
     *     // An array of fields that the plugin will ignore.
     *     omit: ['name'],
     *     // Enable/disable sharing of state for this store.
     *     enable: false
     *     // If set to true this tab tries to immediately recover the
     *     // shared state from another tab. Defaults to true.
     *     initialize: false
     *     // Serialize store state before broadcasting. Defaults to `JSON.stringify`/`JSON.parse`.
     *     serializer: {
     *      serialize: JSON.stringify
     *      deserialize: JSON.parse
     *     }
     *   }
     * })
     * ```
     */
    share?: {
      omit?: Array<keyof S>
      enable?: boolean
      initialize?: boolean
    }
  }
}
