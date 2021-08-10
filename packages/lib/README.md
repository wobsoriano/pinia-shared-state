# pinia-shared-state

A lightweight module to sync your pinia state across browser tabs using the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). Supports Vue 2 and 3.

## Requirements

- pinia@beta
- vue ^2.6.14 || ^3.2.0

## Install

```sh
yarn add pinia@beta pinia-shared-state
```

## Usage

```js
import { PiniaSharedState } from 'pinia-shared-state'

// Pass the plugin to your application's pinia plugin
pinia.use(PiniaSharedState({
    // If set to true this tab tries to immediately recover the shared state from another tab. Defaults to true.
    initialize: false
}))
```

```js
const useStore = defineStore({
  id: 'counter',
  state: () => ({
      count: 0,
      foo: 'bar'
  }),
  share: {
      // An array of fields that the plugin will ignore.
      omit: ['foo'],
      // Override global config for this store.
      initialize: false
  }
});
```

## Credits

- [pinia](https://pinia.esm.dev/) - 🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.

## License

[MIT License](http://opensource.org/licenses/MIT).