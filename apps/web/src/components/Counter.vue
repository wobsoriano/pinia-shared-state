<script lang="ts" setup>
defineProps<{
  count: number
  title: string
  testIdCount: string
  testIdDecrement: string
  testIdIncrement: string
}>()

const emit = defineEmits(['increment', 'decrement'])
</script>

<template>
  <h2>{{ title }}</h2>
  <div
    class="count"
    :data-test-id="testIdCount"
    v-text="count"
  />
  <div class="button__wrapper">
    <button
      :data-test-id="testIdDecrement"
      @click="emit('decrement')"
    >
      -
    </button>
    <button
      :data-test-id="testIdIncrement"
      @click="emit('increment')"
    >
      +
    </button>
  </div>
</template>

<style scoped>
.count {
  font-size: 6rem;
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
