# pinia-shared-state

[![npm version](https://badge.fury.io/js/pinia-shared-state.svg)](https://badge.fury.io/js/pinia-shared-state)
[![bundle size](https://badgen.net/bundlephobia/minzip/pinia-shared-state)](https://bundlephobia.com/result?p=pinia-shared-state)

A lightweight module to sync your pinia state across browser tabs. Supports Vue 2 and 3.

## Requirements

- vue ^2.6.14 || ^3.2.0

## Install

```sh
pnpm add pinia@beta pinia-shared-state
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

Don't want to use it as a plugin? You can share state on your own:

```js
import { defineComponent } from 'vue'
import { share, unshare } from 'pinia-shared-state'
import useStore from './store'

export default defineComponent({
  setup() {
    const counterStore = useStore()

    // Call `unshare` method to close the channel
    unshare()
  },
})
```

## Credits

- [pinia](https://pinia.esm.dev/) - 🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.
- [broadcast-channel](https://github.com/pubkey/broadcast-channel) - BroadcastChannel to send data between different browser-tabs or nodejs-processes.

## License

[MIT License](http://opensource.org/licenses/MIT).
