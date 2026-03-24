import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Node environment is sufficient: Vue/Pinia reactivity works without a
    // real browser DOM. Using 'node' keeps the tests fast and dependency-free.
    environment: 'node',
  },
})
