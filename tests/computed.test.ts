import { describe, it, expect, vi } from 'vitest'
import { observable, observe, computed } from '../src/index.js'

describe('computed', () => {
  it('derives a value from observables', () => {
    const a$ = observable({ v: 2 })
    const b$ = observable({ v: 3 })
    const sum$ = computed(() => a$.v.get() + b$.v.get())

    expect(sum$.get()).toBe(5)

    a$.v.set(10)
    expect(sum$.get()).toBe(13)

    b$.v.set(20)
    expect(sum$.get()).toBe(30)
  })

  it('computes lazily and caches the result', () => {
    const count$ = observable(1)
    const computeFn = vi.fn(() => count$.get() * 2)
    const double$ = computed(computeFn)

    expect(computeFn).toHaveBeenCalledTimes(0)

    expect(double$.get()).toBe(2)
    expect(computeFn).toHaveBeenCalledTimes(1)

    expect(double$.get()).toBe(2)
    expect(double$.get()).toBe(2)
    expect(computeFn).toHaveBeenCalledTimes(1)

    count$.set(5)
    expect(computeFn).toHaveBeenCalledTimes(1)

    expect(double$.get()).toBe(10)
    expect(computeFn).toHaveBeenCalledTimes(2)
  })

  it('notifies subscribers only on clean-to-dirty transitions', () => {
    const a$ = observable({ v: 1 })
    const b$ = observable({ v: 2 })
    const sum$ = computed(() => a$.v.get() + b$.v.get())
    const observerSpy = vi.fn()

    observe(() => {
      observerSpy(sum$.get())
    })

    expect(observerSpy).toHaveBeenCalledTimes(1)
    expect(observerSpy).toHaveBeenCalledWith(3)

    a$.v.set(10)
    expect(observerSpy).toHaveBeenCalledTimes(2)
    expect(observerSpy).toHaveBeenCalledWith(12)

    b$.v.set(20)
    expect(observerSpy).toHaveBeenCalledTimes(3)
    expect(observerSpy).toHaveBeenCalledWith(30)
  })

  it('tracks dependencies after reading a computed inside observe', () => {
    const job$ = observable({
      status: 'queued',
      error_message: null as string | null,
    })
    const summary$ = computed(() => job$.status.get())
    const recorded: Array<{ summary: string; error: string | null }> = []

    observe(() => {
      recorded.push({
        summary: summary$.get(),
        error: job$.error_message.get(),
      })
    })

    expect(recorded).toEqual([{ summary: 'queued', error: null }])

    job$.status.set('running')
    expect(recorded).toEqual([
      { summary: 'queued', error: null },
      { summary: 'running', error: null },
    ])

    job$.error_message.set('timeout')
    expect(recorded).toEqual([
      { summary: 'queued', error: null },
      { summary: 'running', error: null },
      { summary: 'running', error: 'timeout' },
    ])
  })

  it('chains computeds together lazily and reactively', () => {
    const count$ = observable(2)
    const double$ = computed(() => count$.get() * 2)
    const quad$ = computed(() => double$.get() * 2)

    expect(quad$.get()).toBe(8)

    count$.set(3)
    expect(quad$.get()).toBe(12)
  })

  it('works with primitive observables', () => {
    const num$ = observable(5)
    const sq$ = computed(() => num$.get() * num$.get())

    expect(sq$.get()).toBe(25)

    num$.set(6)
    expect(sq$.get()).toBe(36)
  })
})
