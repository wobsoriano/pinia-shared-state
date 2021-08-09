# pinia-shared-state

A lightweight module to sync your pinia state across browser tabs using the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). Supports Vue 2 and 3.

## Install

```sh
yarn add pinia@next pinia-shared-state
```

## Usage

```ts
import { defineStore } from 'pinia'
import { share, isSupported } from 'pinia-shared-state'

const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({ count: 0 })
})

const counterStore = useCounterStore()

if (isSupported()) {
    // share the property "count" of the state with other tabs.
    share('count', counterStore)
}
```

## API

```ts
share('count', counterStore, {
    // If set to true this tab tries to immediately recover the shared state from another tab. Defaults to true.
    initialize: true,
    /*
        Each shared property is shared over a specific channel with a name that has to be unique.
        By default the name of the property is used. So if you want to share properties from different stores with the same name set this to something unique.
    */
    ref: "shared-store",
});
```

## Credits

- [pinia](https://pinia.esm.dev/) - 🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.

## License

[MIT License](http://opensource.org/licenses/MIT).