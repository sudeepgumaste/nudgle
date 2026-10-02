import { currentObserver, type Observer } from './observer.js'

export type Node<V> = {
  get(): V
  set(value: V): void
}

export type Observable<T> = T extends object
  ? { [K in keyof T]: Node<T[K]> }
  : Node<T>

export function observable<T>(initialValue: T): Observable<T> {
  const isObject = initialValue !== null && typeof initialValue === 'object'
  const store: Record<string, unknown> = isObject
    ? { ...(initialValue as object) }
    : { value: initialValue }

  const subscribers = new Map<string, Set<Observer>>()

  const node = (key: string): Node<unknown> => ({
    get() {
      const observer = currentObserver()
      if (observer) {
        let subs = subscribers.get(key)
        if (!subs) subscribers.set(key, (subs = new Set()))
        subs.add(observer)
      }
      return store[key]
    },
    set(value) {
      store[key] = value
      const subs = subscribers.get(key)
      if (subs) for (const subscription of Array.from(subs)) subscription()
    },
  })

  const proxy = new Proxy(store, {
    get(_store, key: string) {
      if (!isObject) return node('value')[key as keyof Node<unknown>]
      return node(key)
    },
  })

  return proxy as Observable<T>
}
