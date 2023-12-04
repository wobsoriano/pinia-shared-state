import { toRaw } from 'vue-demi'
import type { MethodType } from 'broadcast-channel'
import { BroadcastChannel as BroadcastChannelImpl } from 'broadcast-channel'
import type { Store } from 'pinia'

/**
 * Share state across browser tabs.
 *
 * @example
 *
 * ```ts
 * import useStore from './store'
 *
 * const counterStore = useStore()
 *
 * share('counter', counterStore, { initialize: true })
 * ```
 *
 * @param key - A property of a store state.
 * @param store - The store the plugin will augment.
 * @param options - Share state options.
 * @param options.initialize - Immediately recover the shared state from another tab.
 * @param options.type - 'native', 'idb', 'localstorage', 'node'.
 */
export function share<T extends Store, K extends keyof T['$state']>(
  key: K,
  store: T,
  { initialize, type }: { initialize: boolean, type?: MethodType },
): { sync: () => void, unshare: () => void } {
  const channelName = `${store.$id}-${key.toString()}`

  const channel = new BroadcastChannelImpl(channelName, {
    type,
  })
  let externalUpdate = false
  let timestamp = 0

  store.$subscribe((_, state) => {
    if (!externalUpdate) {
      timestamp = Date.now()
      channel.postMessage({
        timestamp,
        // @ts-expect-error: TODO
        newValue: toRaw(state)[key],
      })
    }
    externalUpdate = false
  })

  channel.onmessage = (evt) => {
    if (evt === undefined) {
      channel.postMessage({
        timestamp,
        // @ts-expect-error: TODO
        newValue: toRaw(store.$state)[key],
      })
      return
    }
    if (evt.timestamp <= timestamp)
      return

    externalUpdate = true
    timestamp = evt.timestamp
    store[key] = evt.newValue
  }

  const sync = () => channel.postMessage(undefined)
  const unshare = () => {
    return channel.close()
  }

  if (initialize)
    sync()

  return { sync, unshare }
}
