import { describe, it, expect, vi } from 'vitest'
import { observable, observe } from '../src/index.js'

describe('observe', () => {
  it('runs immediately when registered', () => {
    const spy = vi.fn()
    observe(spy)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('re-runs when an observed primitive changes', () => {
    const count$ = observable(0)
    const values: number[] = []

    observe(() => {
      values.push(count$.get())
    })

    expect(values).toEqual([0])

    count$.set(1)
    count$.set(2)

    expect(values).toEqual([0, 1, 2])
  })

  it('re-runs when an observed object field changes', () => {
    const state$ = observable({ count: 10 })
    const values: number[] = []

    observe(() => {
      values.push(state$.count.get())
    })

    expect(values).toEqual([10])

    state$.count.set(20)
    expect(values).toEqual([10, 20])
  })

  it('does not re-run when an unread field changes', () => {
    const job$ = observable({
      status: 'queued',
      error_message: null as string | null,
    })
    const spy = vi.fn()

    observe(() => {
      spy(job$.status.get())
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('queued')

    job$.error_message.set('timeout')
    expect(spy).toHaveBeenCalledTimes(1)

    job$.status.set('running')
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenCalledWith('running')
  })

  it('supports multiple observers on the same observable', () => {
    const value$ = observable('start')
    const spy1 = vi.fn()
    const spy2 = vi.fn()

    observe(() => {
      spy1(value$.get())
    })

    observe(() => {
      spy2(value$.get())
    })

    expect(spy1).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledTimes(1)

    value$.set('next')

    expect(spy1).toHaveBeenCalledTimes(2)
    expect(spy2).toHaveBeenCalledTimes(2)
    expect(spy1).toHaveBeenLastCalledWith('next')
    expect(spy2).toHaveBeenLastCalledWith('next')
  })

  it('re-runs when any of multiple observed sources change', () => {
    const a$ = observable({ v: 1 })
    const b$ = observable({ v: 2 })
    const results: number[] = []

    observe(() => {
      results.push(a$.v.get() + b$.v.get())
    })

    expect(results).toEqual([3])

    a$.v.set(10)
    expect(results).toEqual([3, 12])

    b$.v.set(20)
    expect(results).toEqual([3, 12, 30])
  })

  it('dynamically tracks newly accessed dependencies', () => {
    const condition$ = observable(true)
    const left$ = observable('left')
    const right$ = observable('right')
    const recorded: string[] = []

    observe(() => {
      if (condition$.get()) {
        recorded.push(left$.get())
      } else {
        recorded.push(right$.get())
      }
    })

    expect(recorded).toEqual(['left'])

    right$.set('right-updated')
    expect(recorded).toEqual(['left'])

    left$.set('left-updated')
    expect(recorded).toEqual(['left', 'left-updated'])

    condition$.set(false)
    expect(recorded).toEqual(['left', 'left-updated', 'right-updated'])

    right$.set('right-next')
    expect(recorded).toEqual(['left', 'left-updated', 'right-updated', 'right-next'])
  })
})
