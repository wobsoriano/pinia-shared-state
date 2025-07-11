import type { MethodType } from 'broadcast-channel'
import type { Store } from 'pinia'
import type { Serializer } from './utils'
import { BroadcastChannel as BroadcastChannelImpl } from 'broadcast-channel'
import { serialize } from './utils'

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

  watch(() => serialize(store.$state, serializer)[key], newValue => {
    if (!externalUpdate) {
      timestamp = Date.now()
      channel.postMessage({
        timestamp,
        newValue,
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

    timestamp = evt.timestamp
    if (store[key] !== evt.newValue) {
      // Since we are using a watcher, it won't trigger if value are the same,
      // and externalUpdate won't be reset to false.
      externalUpdate = true
      store[key] = evt.newValue
    }
  }

  const sync = () => channel.postMessage(undefined)
  const unshare = () => {
    return channel.close()
  }

  if (initialize)
    sync()

  return { sync, unshare }
}
