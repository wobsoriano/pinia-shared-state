import { watch } from 'vue-demi';
import type { MethodType } from 'broadcast-channel';
import * as BroadcastChannelLib from 'broadcast-channel';
import type { PiniaPluginContext, Store } from 'pinia';
import * as devalue from 'devalue';

const { BroadcastChannel: BroadcastChannelImpl } = BroadcastChannelLib;

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
  { initialize, type }: { initialize: boolean; type?: MethodType },
): { sync: () => void; unshare: () => void } {
  const channelName = `${store.$id}-${key.toString()}`;

  const channel = new BroadcastChannelImpl(channelName, {
    type,
  });
  let externalUpdate = false;
  let timestamp = 0;

  watch(
    () => store[key],
    (state) => {
      if (!externalUpdate) {
        timestamp = Date.now();
        channel.postMessage({
          timestamp,
          state: devalue.parse(devalue.stringify(state)),
        });
      }
      externalUpdate = false;
    },
    { deep: true },
  );

  channel.onmessage = (evt) => {
    if (evt === undefined) {
      channel.postMessage({
        timestamp,
        state: devalue.parse(devalue.stringify(store[key])),
      });
      return;
    }
    if (evt.timestamp <= timestamp)
      return;

    externalUpdate = true;
    timestamp = evt.timestamp;
    store[key] = evt.state;
  };

  const sync = () => channel.postMessage(undefined);
  const unshare = () => {
    return channel.close();
  };

  // fetches any available state
  if (initialize)
    sync();

  return { sync, unshare };
}

const stateHasKey = (key: string, $state: PiniaPluginContext['store']['$state']) => {
  return Object.keys($state).includes(key);
};

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
 */
export const PiniaSharedState = ({ initialize = true, enable = true, type }: { initialize?: boolean; enable?: boolean; type?: MethodType }) => {
  return ({ store, options }: PiniaPluginContext) => {
    const isEnabled = options?.share?.enable ?? enable;
    const omittedKeys = options?.share?.omit ?? [];
    if (!isEnabled)
      return;

    Object.keys(store.$state).forEach((key) => {
      if (omittedKeys.includes(key) || !stateHasKey(key, store.$state))
        return;
      share(key, store, {
        initialize: options?.share?.initialize ?? initialize,
        type,
      });
    });
  };
};

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
