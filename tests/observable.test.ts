import { describe, it, expect, vi } from 'vitest'
import { observable } from '../src/observable.js'
import { observe } from '../src/observe.js'

describe('observable (primitives)', () => {
  it('get() returns the initial value', () => {
    const count$ = observable(0)
    expect(count$.get()).toBe(0)
  })

  it('set() updates the value returned by get()', () => {
    const count$ = observable(0)
    count$.set(5)
    expect(count$.get()).toBe(5)
  })

  it('works with strings', () => {
    const name$ = observable('hello')
    expect(name$.get()).toBe('hello')
    name$.set('world')
    expect(name$.get()).toBe('world')
  })

  it('works with booleans', () => {
    const flag$ = observable(false)
    expect(flag$.get()).toBe(false)
    flag$.set(true)
    expect(flag$.get()).toBe(true)
  })

  it('works with null', () => {
    const val$ = observable(null)
    expect(val$.get()).toBe(null)
  })
})

describe('observable (objects)', () => {
  it('each field exposes get() returning its initial value', () => {
    const job$ = observable({ status: 'queued', retries: 0 })
    expect(job$.status.get()).toBe('queued')
    expect(job$.retries.get()).toBe(0)
  })

  it('set() on a field updates only that field', () => {
    const job$ = observable({ status: 'queued', retries: 0 })
    job$.status.set('running')
    expect(job$.status.get()).toBe('running')
    expect(job$.retries.get()).toBe(0)
  })

  it('multiple sets accumulate correctly', () => {
    const counter$ = observable({ count: 0 })
    counter$.count.set(1)
    counter$.count.set(2)
    counter$.count.set(3)
    expect(counter$.count.get()).toBe(3)
  })

  it('fields are independent nodes', () => {
    const state$ = observable({ a: 1, b: 2 })
    state$.a.set(10)
    expect(state$.a.get()).toBe(10)
    expect(state$.b.get()).toBe(2)

    state$.b.set(20)
    expect(state$.a.get()).toBe(10)
    expect(state$.b.get()).toBe(20)
  })
})

describe('observable subscriber notifications', () => {
  it('notifies observer on primitive update', () => {
    const count$ = observable(10)
    const spy = vi.fn()
    observe(() => {
      spy(count$.get())
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(10)

    count$.set(20)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith(20)
  })

  it('notifies observer only on updated object field', () => {
    const job$ = observable({ status: 'queued', error: null as string | null })
    const statusSpy = vi.fn()
    observe(() => {
      statusSpy(job$.status.get())
    })

    expect(statusSpy).toHaveBeenCalledTimes(1)
    expect(statusSpy).toHaveBeenCalledWith('queued')

    job$.error.set('timeout')
    expect(statusSpy).toHaveBeenCalledTimes(1)

    job$.status.set('running')
    expect(statusSpy).toHaveBeenCalledTimes(2)
    expect(statusSpy).toHaveBeenCalledWith('running')
  })
})
