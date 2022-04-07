<template>
  <div class="counter">
    <div class="card">
      <Counter
        title="Shared count"
        :count="counterStore.count"
        test-id-count="counterStoreCount"
        test-id-decrement="counterStoreDecrement"
        test-id-increment="counterStoreIncrement"
        @decrement="counterStore.decrement()"
        @increment="counterStore.increment()"
      />
    </div>
    <div class="card">
      <Counter
        title="Local count"
        :count="counterStore.ignoreCount"
        test-id-count="counterStoreIgnoreCount"
        test-id-decrement="counterStoreIgnoreDecrement"
        test-id-increment="counterStoreIgnoreIncrement"
        @decrement="counterStore.ignoreDecrement()"
        @increment="counterStore.ignoreIncrement()"
      />
    </div>

    <div class="card">
      <h2>Shared paylaod</h2>
      <pre
        class="payload"
        data-test-id="payloadStoreResult"
      >{{ payloadStore.payload }}</pre>
      <div class="button__wrapper">
        <button
          data-test-id="payloadStoreButtonString"
          @click="payloadStore.setPayload('String payload')"
        >
          String
        </button>
        <button
          data-test-id="payloadStoreButtonNumber"
          @click="payloadStore.setPayload(42)"
        >
          Number
        </button>
        <button
          data-test-id="payloadStoreButtonObject"
          @click="payloadStore.setPayload({test: 3})"
        >
          Object
        </button>
        <button
          data-test-id="payloadStoreButtonArray"
          @click="payloadStore.setPayload([1,2,3])"
        >
          Array
        </button>
        <button
          data-test-id="payloadStoreButtonNull"
          @click="payloadStore.setPayload(null)"
        >
          Null
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore, usePayloadStore } from './store'
import Counter from './components/Counter.vue'

const counterStore = useCounterStore()
const payloadStore = usePayloadStore()
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.counter {
  display: grid;
  font-family: Montserrat, sans-serif;
  min-height: 100vh;
  background-color: #f0f7f8;
  color: #425a65;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.button__wrapper {
  display: flex;
  gap: 1rem;
}

.button__wrapper > * {
  border: none;
  background-color: white;
  box-shadow: 0px 0px 10px #cfd8dc;
  font-weight: bold;
  font-size: 2rem;
  color: inherit;
  border-radius: 2rem;
  padding: 0.8rem;
  outline: none;
  height: 4rem;
  min-width: 4rem;
  cursor: pointer;
  transition: background-color 250ms ease-in-out, transform 50ms ease-in-out;
}

.button__wrapper > *:hover {
  background-color: #cfd8dc;
}

.button__wrapper > *:active {
  transform: scale(0.9);
}

.button__wrapper > *:focus {
  box-shadow: 0 0 0 3px #425a65;
}

.payload {
  min-height: 5rem;
}
</style>
