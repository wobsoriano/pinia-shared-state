import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaSharedState } from 'pinia-shared-state'
import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
pinia.use(PiniaSharedState({
  enable: false,
  type: 'native',
}))

app.use(pinia)

app.mount('#app')
