import { watch } from 'vue-demi';
import { Store } from 'pinia';

declare global {
  interface Window {
    __SHARED_PINIA_USED_CHANNELS__: Set<string>;
  }
}

export function isSupported() {
  return 'BroadcastChannel' in window;
}

export function share<T extends Store, K extends keyof T['$state']>(
  key: K,
  store: T,
  { ref = 'shared-', initialize = true } = {}
): { sync: () => void, unshare: () => void } {
  const channelName = `${ref}-${key.toString()}`;

  if (process.env.NODE_ENV !== 'production') {
      if (!window.__SHARED_PINIA_USED_CHANNELS__) {
          window.__SHARED_PINIA_USED_CHANNELS__ = new Set();
      }
      if (window.__SHARED_PINIA_USED_CHANNELS__.has(channelName)) {
          console.warn(
              `Two shared properties are using the channel "${channelName}". If you want to reuse a channel name make sure to free the channel by calling unshare() first.`
          );
          // @ts-ignore
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