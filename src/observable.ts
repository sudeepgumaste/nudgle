export type Node<V> = {
  get(): V
  set(value: V): void
}

// An observable of an object exposes a node per field;
// an observable of a primitive IS a node.
export type Observable<T> = T extends object
  ? { [K in keyof T]: Node<T[K]> }
  : Node<T>

export function observable<T>(initialValue: T): Observable<T> {
  const isObject = initialValue !== null && typeof initialValue === 'object'

  const store: Record<string, unknown> = isObject
    ? { ...(initialValue as object) }
    : { value: initialValue } // box the primitive

  // Each key gets its own get/set pair.
  const node = (key: string): Node<unknown> => ({
    get() {
      console.log(`read: ${key}`)
      return store[key]
    },
    set(value) {
      store[key] = value
      console.log(`write: ${key}`)
    },
  })

  const proxy = new Proxy(store, {
    get(_store, key: string) {
      // Primitive: the observable itself IS the value's node.
      if (!isObject) return node('value')[key as keyof Node<unknown>]
      // Object: every field is its own node.
      return node(key)
    },
  })

  return proxy as Observable<T>
}
