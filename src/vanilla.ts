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
 * Global map to count how many keys we have for each store
 */
const vanillaSharesMap = new Map()
/**
 * Global map to count how many remaining update we have for each store
 */
const externalUpdateMap = new Map()

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
  const currentCount = vanillaSharesMap.get(store) ?? 0
  vanillaSharesMap.set(store, currentCount + 1)
  externalUpdateMap.set(store, 0)
  let timestamp = 0

  store.$subscribe((_, state) => {
    const externalCount = externalUpdateMap.get(store)
    if (externalCount <= 0) {
      timestamp = Date.now()
      channel.postMessage({
        timestamp,
        newValue: serialize(state, serializer)[key],
      })
    }
    externalUpdateMap.set(store, Math.max(0, externalCount - 1))
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

    externalUpdateMap.set(store, vanillaSharesMap.get(store))
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
