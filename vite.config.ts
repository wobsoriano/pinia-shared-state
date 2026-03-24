import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  pack: {
    entry: ['src/index.ts'],
    sourcemap: true,
    clean: true,
    dts: true,
    platform: 'neutral',
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    // Node environment is sufficient: Vue/Pinia reactivity works without a
    // real browser DOM. Using 'node' keeps the tests fast and dependency-free.
    environment: 'node',
  },
  fmt: {
    singleQuote: true,
    semi: true,
  },
});
