# pinia-shared-state

Sync your Pinia state across browser tabs.

## Requirements

- pinia ^3.0.0

## Install

```sh
npm install pinia-shared-state
```

## Usage

```js
import { PiniaSharedState } from 'pinia-shared-state';

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
);
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
});
```

Vanilla usage:

```ts
import { share } from 'pinia-shared-state';
import { onMounted, onUnmounted } from 'vue';
import useStore from './store';

const counterStore = useStore();

onMounted(() => {
  const { unshare } = share('counter', counterStore, { initialize: true });

  onUnmounted(() => {
    // Call `unshare` method to close the channel
    unshare();
  });
});
```

## License

MIT
