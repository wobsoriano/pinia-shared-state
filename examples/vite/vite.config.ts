import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // eslint-disable-next-line node/prefer-global/process
  base: process.env.NODE_ENV === 'production' ? '/pinia-shared-state/' : './',
})
