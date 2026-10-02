import { currentObserver, observerStack, type Observer } from './observer.js'

export type Computed<T> = {
  get(): T
}

export function computed<T>(fn: () => T): Computed<T> {
  let cached!: T
  let dirty = true
  const subscribers = new Set<Observer>()

  const invalidate: Observer = () => {
    if (dirty) return
    dirty = true
    for (const subscription of Array.from(subscribers)) subscription()
  }

  return {
    get() {
      const observer = currentObserver()
      if (observer) subscribers.add(observer)

      if (dirty) {
        observerStack.push(invalidate)
        try {
          cached = fn()
        } finally {
          observerStack.pop()
        }
        dirty = false
      }

      return cached
    },
  }
}
