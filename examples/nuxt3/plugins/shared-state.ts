import { PiniaSharedState } from 'pinia-shared-state'

export default defineNuxtPlugin((nuxtApp) => {
  // @ts-expect-error: Missing types?
  nuxtApp.$pinia.use(PiniaSharedState({
    enable: true,
  }))
})
