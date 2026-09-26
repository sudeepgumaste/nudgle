import { observable } from './observable.js'

// --- Primitive observable ---
const count$ = observable(0)
console.log('--- primitive ---')
count$.get()    // read: value  → 0
count$.set(5)   // write: value
count$.get()    // read: value  → 5

console.log()

// --- Object observable ---
const job$ = observable({ status: 'queued', error_message: null as string | null })
console.log('--- object ---')
job$.status.get()         // read: status  → 'queued'
job$.status.set('running') // write: status
job$.error_message.get()  // read: error_message → null
