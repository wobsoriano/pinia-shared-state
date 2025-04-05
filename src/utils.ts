import { isRef, unref } from 'vue'

export function isObject(value: any) {
  const val = isRef(value) ? unref(value) : value
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
 * Deep merge two objects recursively
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 */
export function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const key in source) {
    if (isObject(source[key]) && isObject(target[key])) {
      deepMerge(target[key], source[key])
    }
    else {
      target[key] = source[key]
    }
  }
  return target
}

export interface Serializer {
  serialize: (value: any) => string
  deserialize: (value: string) => any
}

export function serialize(
  obj: Record<string, unknown>,
  serializer: Serializer = { serialize: JSON.stringify, deserialize: JSON.parse },
) {
  return serializer.deserialize(serializer.serialize(obj))
}
