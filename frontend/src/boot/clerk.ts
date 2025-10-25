import { clerkPlugin } from '@clerk/vue'
import { boot } from 'quasar/wrappers'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is missing')
}

export default boot(({ app }) => {
  app.use(clerkPlugin, {
    publishableKey: PUBLISHABLE_KEY,
  })
})
