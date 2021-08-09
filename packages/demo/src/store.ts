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
        if (!this.count) return;
        this.count--;
    }
  }
});

export const useCounterStore2 = defineStore({
  id: 'counter2',

  state() {
    return { count: 0 }
  },

  actions: {
    increment() {
        this.count++;
    },
    decrement() {
        if (!this.count) return;
        this.count--;
    }
  }
});