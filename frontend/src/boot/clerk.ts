import { boot } from 'quasar/wrappers'
import { Clerk } from '@clerk/vue'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
  console.log('Clerk boot file loaded')
})
