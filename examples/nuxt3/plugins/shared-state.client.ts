import { PiniaSharedState } from 'pinia-shared-state';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(PiniaSharedState({
    enable: true,
  }));
});
