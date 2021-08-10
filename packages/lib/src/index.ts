import { watch } from 'vue-demi';
import type { PiniaPluginContext, Store } from 'pinia';

declare global {
  interface Window {
    __SHARED_PINIA_USED_CHANNELS__: Set<string>;
  }
}

export function isSupported() {
  return 'BroadcastChannel' in window;
}

/**
 * Adds a `share` option to your store to share state across browser tabs.
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
 */
export function share<T extends Store, K extends keyof T['$state']>(
  key: K,
  store: T,
  { initialize }: { initialize: boolean }
): { sync: () => void, unshare: () => void } {
  const channelName = `shared-${store['$id']}-${key.toString()}`;

  if (process.env.NODE_ENV !== 'production') {
      if (!window.__SHARED_PINIA_USED_CHANNELS__) {
          window.__SHARED_PINIA_USED_CHANNELS__ = new Set();
      }
      if (window.__SHARED_PINIA_USED_CHANNELS__.has(channelName)) {
          console.warn(`Channel with name "${channelName}" already exists.`);
          // @ts-expect-error: Shared properties using the same channel name.
          return;
      }
      window.__SHARED_PINIA_USED_CHANNELS__.add(channelName);
  }

  let channel = new BroadcastChannel(channelName);
  let externalUpdate = false;
  let timestamp = 0;

  watch(
    () => store[key],
    (state) => {
      if (!externalUpdate) {
        timestamp = Date.now();
        channel.postMessage({ timestamp, state });
      }
      externalUpdate = false;
    },
    { deep: true }
  );

  channel.onmessage = (evt) => {
    if (evt.data === undefined) {
      channel.postMessage({ timestamp: timestamp, state: store[key] });
      return;
    }
    if (evt.data.timestamp <= timestamp) {
      return;
    }
    externalUpdate = true;
    timestamp = evt.data.timestamp;
    store[key] = evt.data.state;
  }

  const sync = () => channel.postMessage(undefined);
  const unshare = () => {
    channel.close();
    if (process.env.NODE_ENV !== 'production') {
        window.__SHARED_PINIA_USED_CHANNELS__.delete(channelName);
    }
  };

  // fetches any available state
  if (initialize) {
    sync();
  }

  return { sync, unshare }
}

const stateHasKey = (key: string, $state: PiniaPluginContext['store']['$state']) => {
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
 * pinia.use(PiniaSharedState({ initialize: true }))
 * ```
 *
 * @param options - Global plugin options.
 * @param options.initialize - Immediately recover the shared state from another tab.
 */
export const PiniaSharedState = ({ initialize = true } = {}) => {
  return ({ store, options }: PiniaPluginContext) => {
    if (!isSupported()) {
      console.error('BroadcastChannel API is not supported in this device.');
      return;
    }

    const omit = options?.share?.omit ?? [];
    Object.keys(store.$state).forEach((key) => {
      if (omit.includes(key) || !stateHasKey(key, store.$state)) return;
      share(key, store, {
        initialize: options?.share?.initialize ?? initialize
      });
    });
  }
}

declare module 'pinia' {
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
     *     // If set to true this tab tries to immediately recover the
     *     // shared state from another tab. Defaults to true.
     *     initialize: false
     *   }
     * })
     * ```
     */
    share?: {
      omit?: string[];
      initialize?: boolean;
    }
  }
}