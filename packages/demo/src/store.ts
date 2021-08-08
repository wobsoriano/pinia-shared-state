import { defineStore } from 'pinia';

export const useCounterStore = defineStore({
  id: 'counter',

  state() {
    return { count: 0 }
  },

  actions: {
    increment() {
        this.count++;
    },
    decrement() {
        this.count--;
    }
  }
});