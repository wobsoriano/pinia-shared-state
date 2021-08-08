import { PiniaPluginContext, StateTree } from 'pinia';
import { watch } from 'vue-demi';

let isRegistered = false;
const CHANNEL_NAME = 'piniastatesync.message';

interface BroadcastMessage {
  event: 'storage';
  state: Record<string, StateTree>;
}

/**
 * Inspired by [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
 * Only not using it directly, because Safari does not support it.
 *
 * https://caniuse.com/?search=broadcastchannel
 */
function BroadcastChannel() {
  return {
     /** Get notified by other tabs/windows. */
    receive(onReceive: (message: BroadcastMessage) => void) {
      if (typeof window === 'undefined') return;
      window.addEventListener('storage', (event) => {
        if (event.key !== CHANNEL_NAME) return;
        const message = JSON.parse(event.newValue as string) as BroadcastMessage;
        if (message.event !== 'storage' || !message.state) return;
          
        onReceive(message);
      });
    },
    /** Notify other tabs/windows. */
    post(message: BroadcastMessage) {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(
          CHANNEL_NAME,
          JSON.stringify(message)
      );
    }
  };
}

const broadcast = BroadcastChannel();

export function PiniaStateSync({ pinia }: PiniaPluginContext) {
  if (!isRegistered) {
    /** Check storage for initial data. */
    const storage = localStorage.getItem(CHANNEL_NAME)
    if (storage) {
        pinia.state.value = JSON.parse(storage).state
    }

    watch(pinia.state, (state) => {
        broadcast.post({ event: 'storage', state: JSON.parse(JSON.stringify(state)) });
    }, { deep: true });

    broadcast.receive(({ state }) => {
        pinia.state.value = state;
    });

    isRegistered = true;
  }
}