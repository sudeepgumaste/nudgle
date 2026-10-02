import { observable, observe, computed } from './index.js'

const count$ = observable(0)
observe(() => {
  console.log('count is:', count$.get())
})
count$.set(5)

type Job = {
  status: string
  error_message: string | null
}

const job$ = observable<Job>({ status: 'queued', error_message: null })
const summary$ = computed(() =>
  job$.error_message.get()
    ? `failed: ${job$.error_message.get()}`
    : job$.status.get(),
)

observe(() => {
  console.log('summary:', summary$.get())
})

job$.status.set('running')
job$.error_message.set('timeout')
