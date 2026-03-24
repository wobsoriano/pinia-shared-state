import { createPinia, defineStore, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { share } from '../vanilla'

// Registry of all mock BroadcastChannel instances, keyed by channel name.
const channelRegistry = vi.hoisted(() => new Map<string, Set<MockBroadcastChannelInstance>>())

interface MockBroadcastChannelInstance {
  name: string
  onmessage: ((msg: unknown) => void) | null
  postedMessages: unknown[]
  close: () => Promise<void>
}

vi.mock('broadcast-channel', () => {
  class MockBroadcastChannel implements MockBroadcastChannelInstance {
    name: string
    onmessage: ((msg: unknown) => void) | null = null
    postedMessages: unknown[] = []

    constructor(name: string, _options?: unknown) {
      this.name = name
      if (!channelRegistry.has(name)) {
        channelRegistry.set(name, new Set())
      }
      channelRegistry.get(name)!.add(this)
    }

    postMessage(msg: unknown) {
      this.postedMessages.push(msg)
      channelRegistry.get(this.name)?.forEach((ch) => {
        if (ch !== this && ch.onmessage) {
          ch.onmessage(msg)
        }
      })
    }

    close() {
      channelRegistry.get(this.name)?.delete(this)
      return Promise.resolve()
    }
  }

  return { BroadcastChannel: MockBroadcastChannel }
})

// Helper: get the single channel for a given name, throwing if absent.
function getChannel(channelName: string): MockBroadcastChannelInstance {
  const instances = channelRegistry.get(channelName)
  if (!instances || instances.size === 0) {
    throw new Error(`No channel registered for "${channelName}"`)
  }
  return [...instances][0]
}

let storeCounter = 0

beforeEach(() => {
  channelRegistry.clear()
  storeCounter++
  setActivePinia(undefined)
})

describe('share()', () => {
  describe('primitive key sharing', () => {
    it('applies an incoming message to the store state', () => {
      const id = `prim-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(0)
        return { count }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('count', store, { initialize: false })

      const channel = getChannel(`${id}-count`)
      const ts = Date.now() + 10_000
      channel.onmessage?.({ timestamp: ts, newValue: 42 })

      expect(store.count).toBe(42)
    })

    it('ignores messages with an outdated timestamp', () => {
      const id = `ts-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(0)
        return { count }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('count', store, { initialize: false })

      const channel = getChannel(`${id}-count`)

      // Advance the internal clock with a future timestamp
      channel.onmessage?.({ timestamp: Date.now() + 10_000, newValue: 99 })
      expect(store.count).toBe(99)

      // An older message must be ignored
      channel.onmessage?.({ timestamp: Date.now() - 1, newValue: 1 })
      expect(store.count).toBe(99)
    })
  })

  describe('object key sharing (bug fix)', () => {
    it('applies an incoming object message to the store state', () => {
      const id = `obj-${storeCounter}`
      const useStore = defineStore(id, () => {
        const settings = ref({ fps: 60 })
        return { settings }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('settings', store, { initialize: false })

      const channel = getChannel(`${id}-settings`)
      channel.onmessage?.({ timestamp: Date.now() + 10_000, newValue: { fps: 30 } })

      expect(store.settings.fps).toBe(30)
    })

    it('preserves the reactive object reference when merging an incoming update', () => {
      const id = `ref-${storeCounter}`
      const useStore = defineStore(id, () => {
        const settings = ref({ fps: 60 })
        return { settings }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('settings', store, { initialize: false })

      const originalSettings = store.settings

      const channel = getChannel(`${id}-settings`)
      channel.onmessage?.({ timestamp: Date.now() + 10_000, newValue: { fps: 30 } })

      // Merged in-place: same reference, updated value
      expect(store.settings).toBe(originalSettings)
      expect(store.settings.fps).toBe(30)
    })
  })

  describe('sync()', () => {
    it('posts an undefined message to request state from other tabs', () => {
      const id = `sync-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(0)
        return { count }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      const { sync } = share('count', store, { initialize: false })
      sync()

      const channel = getChannel(`${id}-count`)
      expect(channel.postedMessages).toContain(undefined)
    })

    it('replies with current state when receiving a sync request', () => {
      const id = `sync-reply-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(7)
        return { count }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('count', store, { initialize: false })

      const channel = getChannel(`${id}-count`)
      channel.onmessage?.(undefined) // sync request from another tab

      expect(channel.postedMessages).toHaveLength(1)
      const reply = channel.postedMessages[0] as { newValue: unknown }
      expect(reply.newValue).toBe(7)
    })

    it('sends an initial sync request when initialize is true', () => {
      const id = `init-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(0)
        return { count }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('count', store, { initialize: true })

      const channel = getChannel(`${id}-count`)
      expect(channel.postedMessages).toContain(undefined)
    })
  })

  describe('unshare()', () => {
    it('closes the channel and removes it from the registry', async () => {
      const id = `unshare-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(0)
        return { count }
      })

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      const { unshare } = share('count', store, { initialize: false })
      expect(channelRegistry.get(`${id}-count`)?.size).toBe(1)

      await unshare()
      expect(channelRegistry.get(`${id}-count`)?.size).toBe(0)
    })
  })

  describe('custom serializer', () => {
    it('uses the provided serializer when broadcasting state', () => {
      const id = `ser-${storeCounter}`
      const useStore = defineStore(id, () => {
        const count = ref(0)
        return { count }
      })

      const serialize = vi.fn((v: unknown) => JSON.stringify(v))
      const deserialize = vi.fn((v: string) => JSON.parse(v))

      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useStore()

      share('count', store, {
        initialize: false,
        serializer: { serialize, deserialize },
      })

      const channel = getChannel(`${id}-count`)
      channel.onmessage?.(undefined) // trigger a broadcast via sync request

      expect(serialize).toHaveBeenCalled()
    })
  })
})
