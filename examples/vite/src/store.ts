import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    foo: {
      count: 0,
    },
  }),

  actions: {
    increment() {
      this.foo.count++
    },
    decrement() {
      if (!this.foo.count)
        return
      this.foo.count--
    },
  },

  share: {
    enable: true,
  },
})
