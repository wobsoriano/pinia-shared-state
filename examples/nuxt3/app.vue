<script setup lang="ts">
import { useCounterStore } from '~/store/counter'

const counterStore = useCounterStore()
</script>

<template>
  <div class="counter">
    <h1 class="count" v-text="counterStore.count" />
    <div class="button__wrapper">
      <button @click="counterStore.decrement">
        -
      </button>
      <button @click="counterStore.increment">
        +
      </button>
    </div>
  </div>
</template>

<style>
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.counter {
    font-family: Montserrat, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    height: 100vh;
    background-color: #f0f7f8;
    color: #425a65;
}

h1 {
    font-size: 6rem;
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
    border-radius: 50%;
    outline: none;
    height: 4rem;
    width: 4rem;
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

.count {
    color: #2abf77;
    animation: pulse 500ms ease-in-out;
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
}
</style>
