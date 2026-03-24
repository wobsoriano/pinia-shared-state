import type { MethodType } from 'broadcast-channel';
import type { Store } from 'pinia';
import type { Serializer } from './utils.js';
import { BroadcastChannel as BroadcastChannelImpl } from 'broadcast-channel';
import { serialize } from './utils.js';

export interface Options {
  initialize?: boolean;
  type?: MethodType;
  serializer?: Serializer;
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
): { sync: () => void; unshare: () => void } {
  const channelName = `${store.$id}-${key.toString()}`;

  const channel = new BroadcastChannelImpl(channelName, {
    type,
  });
  let externalUpdate = false;
  let timestamp = 0;

  const valueSerializer = serializer ?? {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  const serializeValue = (value: unknown) => {
    return valueSerializer.serialize({ value });
  };

  const deserializeValue = (value: string) => {
    return valueSerializer.deserialize(value).value;
  };

  const getStateValue = (state: T['$state']) => {
    return state[key];
  };

  let lastSerializedValue = serializeValue(getStateValue(store.$state));

  store.$subscribe((_, state) => {
    const nextSerializedValue = serializeValue(getStateValue(state as T['$state']));
    if (nextSerializedValue === lastSerializedValue) {
      externalUpdate = false;
      return;
    }

    lastSerializedValue = nextSerializedValue;

    if (!externalUpdate) {
      timestamp = Date.now();
      void channel.postMessage({
        timestamp,
        newValue: deserializeValue(nextSerializedValue),
      });
    }
    externalUpdate = false;
  });

  channel.onmessage = (evt) => {
    if (evt === undefined) {
      void channel.postMessage({
        timestamp,
        // @ts-expect-error: TODO
        newValue: serialize(store.$state, serializer)[key],
      });
      return;
    }
    if (evt.timestamp <= timestamp) return;

    const incomingSerializedValue = serializeValue(evt.newValue);

    timestamp = evt.timestamp;
    if (incomingSerializedValue === lastSerializedValue) return;

    externalUpdate = true;
    lastSerializedValue = incomingSerializedValue;
    store.$patch({ [key]: evt.newValue });
  };

  const sync = () => {
    void channel.postMessage(undefined);
  };
  const unshare = () => {
    return channel.close();
  };

  if (initialize) {
    sync();
  }

  return { sync, unshare };
}
