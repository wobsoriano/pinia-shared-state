export interface Serializer {
  serialize: (value: any) => string
  deserialize: (value: string) => any
}

export interface Merger {
  <S>(
    key: string | number | symbol,
    localState: S,
    sharedState: S,
    storeId?: string,
  ): S
}

export function serialize(
  obj: Record<string, unknown>,
  serializer: Serializer = { serialize: JSON.stringify, deserialize: JSON.parse },
) {
  return serializer.deserialize(serializer.serialize(obj))
}
export function merge<S>(
  key: string | number | symbol,
  localState: S,
  sharedState: S,
  storeId?: string,
  merger: Merger = (_, __, shared) => shared,
): S {
  return merger(key, localState, sharedState, storeId)
}
