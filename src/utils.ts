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
