# pinia-shared-state

[![npm (tag)](https://img.shields.io/npm/v/pinia-shared-state?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/pinia-shared-state) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/pinia-shared-state?style=flat&colorA=000000&colorB=000000) ![NPM](https://img.shields.io/npm/l/pinia-shared-state?style=flat&colorA=000000&colorB=000000)

Sync your Pinia state across browser tabs. Supports Vue 2 and 3.

## Requirements

- vue ^2.6.14 || ^3.2.0

## Install

```sh
pnpm add pinia pinia-shared-state
```

## Usage

```js
import { PiniaSharedState } from 'pinia-shared-state'

// Pass the plugin to your application's pinia plugin
pinia.use(
  PiniaSharedState({
    // Enables the plugin for all stores. Defaults to true.
    enable: true,
    // If set to true this tab tries to immediately recover the shared state from another tab. Defaults to true.
    initialize: false,
    // Enforce a type. One of native, idb, localstorage or node. Defaults to native.
    type: 'localstorage',
  }),
)
```

```js
const useStore = defineStore({
  id: 'counter',
  state: () => ({
    count: 0,
    foo: 'bar',
  }),
  share: {
    // An array of fields that the plugin will ignore.
    omit: ['foo'],
    // Override global config for this store.
    enable: true,
    initialize: true,
  },
})
```

Vanilla usage:

```ts
import { onMounted, onUnmounted } from 'vue'
import { share } from 'pinia-shared-state'
import useStore from './store'

const counterStore = useStore()

onMounted(() => {
  const { unshare } = share('counter', counterStore, { initialize: true })

  return () => {
    // Call `unshare` method to close the channel
    unshare()
  }
})
```

## Credits

- [pinia](https://pinia.esm.dev/) - 🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.
- [broadcast-channel](https://github.com/pubkey/broadcast-channel) - BroadcastChannel to send data between different browser-tabs or nodejs-processes.

## License

[MIT License](http://opensource.org/licenses/MIT).
