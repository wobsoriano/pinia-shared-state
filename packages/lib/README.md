# pinia-state-sync

A lightweight plugin to sync your pinia state across browser tabs. Supports Vue 2 and 3.

## Install

```sh
yarn add pinia@next pinia-state-sync
```

## Usage

Add to the pinia instance with `pinia.use()`.

```ts
import { createPinia } from 'pinia'
import PiniaStateSync from 'pinia-state-sync'

const pinia = createPinia()
// give the plugin to pinia
pinia.use(PiniaStateSync)

app.use(pinia)
```

### Credits

- [pinia](https://pinia.esm.dev/) - 🍍 Intuitive, type safe, light and flexible Store for Vue using the composition api with DevTools support.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.

### License

[MIT License](http://opensource.org/licenses/MIT).