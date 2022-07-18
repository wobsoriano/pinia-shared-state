// Code taken from here https://github.com/sindresorhus/safe-stringify/blob/main/index.js

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

export function safeStringify(object: unknown, { indentation }: Options = {}) {
  return JSON.stringify(object, makeCircularReplacer(), indentation);
}
