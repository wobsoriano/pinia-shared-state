import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import PiniaStateSync from 'pinia-state-sync';

const app = createApp(App);
const pinia = createPinia();
pinia.use(PiniaStateSync);

app.use(pinia);

app.mount('#app');
