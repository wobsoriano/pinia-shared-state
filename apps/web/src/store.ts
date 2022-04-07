import { defineStore } from 'pinia'

export const useCounterStore = defineStore({
  id: 'counter',

  state() {
    return {
      count: 0,
      ignoreCount: 0,
    }
  },

  actions: {
    // count
    increment() {
      this.count++
    },
    decrement() {
      if (!this.count) return
      this.count--
    },
    // ignore count
    ignoreIncrement() {
      this.ignoreCount++
    },
    ignoreDecrement() {
      if (!this.ignoreCount) return
      this.ignoreCount--
    },
    setPayload(payload) {
      this.payload = payload
    },
  },

  share: {
    omit: ['ignoreCount'],
    enable: true,
  },
})

export const usePayloadStore = defineStore({
  id: 'payload',

  state() {
    return {
      payload: null,
    }
  },

  actions: {
    setPayload(payload) {
      this.payload = payload
    },
  },

  share: {
    enable: true,
  },
})
