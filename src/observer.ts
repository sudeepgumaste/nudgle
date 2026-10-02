export type Observer = () => void

export const observerStack: Observer[] = []

export function currentObserver(): Observer | null {
  return observerStack[observerStack.length - 1] ?? null
}
