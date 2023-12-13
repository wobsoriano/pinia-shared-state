import type { MethodType } from 'broadcast-channel'
import { BroadcastChannel as BroadcastChannelImpl } from 'broadcast-channel'
import type { Store } from 'pinia'
import { type Serializer, serialize } from './utils'

export interface Options {
  initialize?: boolean
  type?: MethodType
  serializer?: Serializer
}

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
 * @param options.serializer - Custom serializer to serialize state before broadcasting.
 */
export function share<T extends Store, K extends keyof T['$state']>(
  key: K,
  store: T,
  { initialize, serializer, type }: Options,
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
        newValue: serialize(state, serializer)[key],
      })
    }
    externalUpdate = false
  })

  channel.onmessage = (evt) => {
    if (evt === undefined) {
      channel.postMessage({
        timestamp,
        // @ts-expect-error: TODO
        newValue: serialize(store.$state, serializer)[key],
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
