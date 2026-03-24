import { createPinia, defineStore, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createApp, ref } from 'vue';
import { PiniaSharedState } from '../index.js';

// Registry of all mock BroadcastChannel instances, keyed by channel name.
// vi.hoisted ensures this is set up before vi.mock factories run.
const channelRegistry = vi.hoisted(() => new Map<string, Set<MockBroadcastChannelInstance>>());

interface MockBroadcastChannelInstance {
  name: string;
  onmessage: ((msg: unknown) => void) | null;
  postedMessages: unknown[];
  close: () => Promise<void>;
}

vi.mock('broadcast-channel', () => {
  class MockBroadcastChannel implements MockBroadcastChannelInstance {
    name: string;
    onmessage: ((msg: unknown) => void) | null = null;
    postedMessages: unknown[] = [];

    constructor(name: string, _options?: unknown) {
      this.name = name;
      if (!channelRegistry.has(name)) {
        channelRegistry.set(name, new Set());
      }
      channelRegistry.get(name)!.add(this);
    }

    postMessage(msg: unknown) {
      this.postedMessages.push(msg);
      channelRegistry.get(this.name)?.forEach((ch) => {
        if (ch !== this && ch.onmessage) {
          ch.onmessage(msg);
        }
      });
    }

    close() {
      channelRegistry.get(this.name)?.delete(this);
      return Promise.resolve();
    }
  }

  return { BroadcastChannel: MockBroadcastChannel };
});

// Helper: get the single channel instance for a given store id.
function getChannel(storeId: string): MockBroadcastChannelInstance {
  const instances = channelRegistry.get(storeId);
  if (!instances || instances.size === 0) {
    throw new Error(`No channel registered for "${storeId}"`);
  }
  return [...instances][0];
}

// Helper: send a fake cross-tab message directly to a store's channel.
function sendCrossTabMessage(
  storeId: string,
  state: Record<string, unknown>,
  timestamp = Date.now() + 10_000,
) {
  const channel = getChannel(storeId);
  channel.onmessage?.({ timestamp, state });
}

let storeCounter = 0;

/**
 * Create a pinia instance with the PiniaSharedState plugin properly installed.
 * Pinia plugins are only flushed from `toBeInstalled` to `_p` when
 * `app.use(pinia)` is called, so we must mount a throw-away Vue app.
 */
function createTestPinia(options: Parameters<typeof PiniaSharedState>[0] = {}) {
  const pinia = createPinia();
  pinia.use(PiniaSharedState(options));
  createApp({}).use(pinia); // triggers pinia.install() which applies queued plugins
  setActivePinia(pinia);
  return pinia;
}

beforeEach(() => {
  channelRegistry.clear();
  storeCounter++;
  setActivePinia(undefined);
});

describe('piniaSharedState plugin', () => {
  describe('primitive state sharing', () => {
    it('applies incoming state from another tab', () => {
      const id = `incoming-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        const name = ref('Alice');
        return { count, name };
      });

      createTestPinia({ enable: true, initialize: false });
      const store = useStore();

      sendCrossTabMessage(id, { count: 7, name: 'Bob' });

      expect(store.count).toBe(7);
      expect(store.name).toBe('Bob');
    });

    it('ignores messages with an outdated timestamp', () => {
      const id = `ts-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        return { count };
      });

      createTestPinia({ enable: true, initialize: false });
      const store = useStore();

      // Send a message with a future timestamp to advance the store's internal clock
      sendCrossTabMessage(id, { count: 99 }, Date.now() + 10_000);
      expect(store.count).toBe(99);

      // Send a message with an older timestamp — must be ignored
      sendCrossTabMessage(id, { count: 1 }, Date.now() - 1);
      expect(store.count).toBe(99);
    });
  });

  describe('object state sharing (bug fix)', () => {
    it('applies nested object updates from another tab', () => {
      const id = `obj-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const settings = ref({ fps: 60 });
        return { settings };
      });

      createTestPinia({ enable: true, initialize: false });
      const store = useStore();

      sendCrossTabMessage(id, { settings: { fps: 30 } });

      expect(store.settings.fps).toBe(30);
    });

    it('preserves the reactive object reference when merging updates', () => {
      const id = `ref-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const settings = ref({ fps: 60 });
        return { settings };
      });

      createTestPinia({ enable: true, initialize: false });
      const store = useStore();

      // Capture reference BEFORE the cross-tab update
      const originalSettings = store.settings;

      sendCrossTabMessage(id, { settings: { fps: 30 } });

      // The object is mutated in-place — same reference, updated value
      expect(store.settings).toBe(originalSettings);
      expect(store.settings.fps).toBe(30);
    });

    it('merges partial object updates without clobbering untouched keys', () => {
      const id = `partial-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const config = ref({ fps: 60, quality: 'high' });
        return { config };
      });

      createTestPinia({ enable: true, initialize: false });
      const store = useStore();

      sendCrossTabMessage(id, { config: { fps: 30, quality: 'high' } });

      expect(store.config.fps).toBe(30);
      expect(store.config.quality).toBe('high');
    });
  });

  describe('omit option', () => {
    it('does not apply updates for omitted keys', () => {
      const id = `omit-${storeCounter}`;
      const useStore = defineStore(
        id,
        () => {
          const count = ref(0);
          const name = ref('Alice');
          return { count, name };
        },
        { share: { omit: ['name'] } },
      );

      createTestPinia({ enable: true, initialize: false });
      const store = useStore();

      sendCrossTabMessage(id, { count: 5, name: 'Bob' });

      expect(store.count).toBe(5);
      // 'name' was omitted — must not be overwritten
      expect(store.name).toBe('Alice');
    });
  });

  describe('enable option', () => {
    it('does not register a channel when disabled via store option', () => {
      const id = `disabled-${storeCounter}`;
      const useStore = defineStore(
        id,
        () => {
          const count = ref(0);
          return { count };
        },
        { share: { enable: false } },
      );

      createTestPinia({ enable: true, initialize: false });
      useStore();

      // No channel should have been created for a disabled store
      expect(channelRegistry.has(id)).toBe(false);
    });

    it('does not register a channel when disabled via global option', () => {
      const id = `global-disabled-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        return { count };
      });

      createTestPinia({ enable: false, initialize: false });
      useStore();

      expect(channelRegistry.has(id)).toBe(false);
    });
  });

  describe('initialize option', () => {
    it('posts a sync request (undefined) on startup when initialize is true', () => {
      const id = `init-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        return { count };
      });

      createTestPinia({ enable: true, initialize: true });
      useStore();

      const channel = getChannel(id);
      // The first posted message must be `undefined` (the sync-request signal)
      expect(channel.postedMessages[0]).toBe(undefined);
    });

    it('does not post a sync request when initialize is false', () => {
      const id = `no-init-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        return { count };
      });

      createTestPinia({ enable: true, initialize: false });
      useStore();

      const channel = getChannel(id);
      expect(channel.postedMessages).toHaveLength(0);
    });

    it('responds to a sync request from another tab with current state', () => {
      const id = `sync-reply-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(5);
        return { count };
      });

      createTestPinia({ enable: true, initialize: false });
      useStore();

      const channel = getChannel(id);
      // Another tab requests state by sending undefined
      channel.onmessage?.(undefined);

      // The store should have replied with its current state
      expect(channel.postedMessages).toHaveLength(1);
      const reply = channel.postedMessages[0] as { state: Record<string, unknown> };
      expect(reply.state.count).toBe(5);
    });
  });

  describe('two-tab simulation', () => {
    it('synchronises primitive state from tab1 to tab2', () => {
      const id = `sync-tabs-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        return { count };
      });

      // Create two pinias, each installed on their own Vue app (simulating two tabs)
      const pinia1 = createPinia();
      pinia1.use(PiniaSharedState({ enable: true, initialize: false }));
      createApp({}).use(pinia1);

      const pinia2 = createPinia();
      pinia2.use(PiniaSharedState({ enable: true, initialize: false }));
      createApp({}).use(pinia2);

      setActivePinia(pinia1);
      const store1 = useStore();
      setActivePinia(pinia2);
      const store2 = useStore();

      const channels = [...(channelRegistry.get(id) ?? [])];
      expect(channels).toHaveLength(2);

      // Deliver a message directly to store2's channel
      const ts = Date.now() + 10_000;
      channels[1].onmessage?.({ timestamp: ts, state: { count: 99 } });

      expect(store2.count).toBe(99);
      expect(store1.count).toBe(0); // store1 was not the target
    });

    it('synchronises object state from tab1 to tab2', () => {
      const id = `sync-obj-tabs-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const settings = ref({ fps: 60 });
        return { settings };
      });

      const pinia1 = createPinia();
      pinia1.use(PiniaSharedState({ enable: true, initialize: false }));
      createApp({}).use(pinia1);

      const pinia2 = createPinia();
      pinia2.use(PiniaSharedState({ enable: true, initialize: false }));
      createApp({}).use(pinia2);

      setActivePinia(pinia1);
      useStore();
      setActivePinia(pinia2);
      const store2 = useStore();

      const originalSettings = store2.settings;

      const channels = [...(channelRegistry.get(id) ?? [])];
      const ts = Date.now() + 10_000;
      channels[1].onmessage?.({ timestamp: ts, state: { settings: { fps: 30 } } });

      // Value updated AND reactive reference preserved
      expect(store2.settings.fps).toBe(30);
      expect(store2.settings).toBe(originalSettings);
    });
  });

  describe('custom serializer', () => {
    it('uses the provided serializer when broadcasting state', () => {
      const id = `serializer-${storeCounter}`;
      const useStore = defineStore(id, () => {
        const count = ref(0);
        return { count };
      });

      const serialize = vi.fn((v: unknown) => JSON.stringify(v));
      const deserialize = vi.fn((v: string) => JSON.parse(v));

      createTestPinia({
        enable: true,
        initialize: false,
        serializer: { serialize, deserialize },
      });
      useStore();

      const channel = getChannel(id);
      channel.onmessage?.(undefined); // trigger state broadcast via sync request

      expect(serialize).toHaveBeenCalled();
    });
  });
});
