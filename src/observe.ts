import { observerStack, type Observer } from './observer.js'

export function observe(fn: Observer): void {
  const subscription = () => {
    observerStack.push(subscription)
    try {
      fn()
    } finally {
      observerStack.pop()
    }
  }
  subscription()
}
