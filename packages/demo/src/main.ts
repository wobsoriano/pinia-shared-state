import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { PiniaSharedState } from 'pinia-shared-state'

const app = createApp(App);

const pinia = createPinia();
pinia.use(PiniaSharedState())

app.use(pinia);

app.mount('#app');
