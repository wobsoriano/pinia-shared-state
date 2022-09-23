import type { MethodType } from 'broadcast-channel';

const makeCircularReplacer = () => {
  const seen = new WeakMap();

  return (key: any, value: any) => {
    if (value !== null && typeof value === 'object') {
      if (seen.has(value) && seen.get(value) !== key) {
        return '[Circular]';
      }

      seen.set(value, key);
    }

    return value;
  };
};

interface Options {
  readonly indentation?: string | number
}

// Code taken from here https://github.com/sindresorhus/safe-stringify/blob/main/index.js
export function safeStringify(object: unknown, { indentation }: Options = {}) {
  return JSON.stringify(object, makeCircularReplacer(), indentation);
}

export function defaultMethodType(): MethodType {
  if (typeof window === 'undefined') {
    return 'node';
  }

  if (typeof window.BroadcastChannel !== 'undefined') {
    return 'native';
  }

  // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
  if (typeof localStorage !== 'undefined') {
    const mod = 'localstorage-is-available';
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return 'localstorage';
    } catch (e) {}
  }

  if (typeof !window.indexedDB !== 'undefined') {
    return 'idb';
  }

  console.warn(new Error('pinia-shared-state is turned off'));
  return 'simulate';
}
