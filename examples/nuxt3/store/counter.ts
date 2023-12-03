import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state() {
    return { count: 0 }
  },

  actions: {
    increment() {
      this.count++
    },
    decrement() {
      if (!this.count)
        return
      this.count--
    },
  },

  share: {
    enable: true,
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
