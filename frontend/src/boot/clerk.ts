import { clerkPlugin } from '@clerk/vue'
import { boot } from 'quasar/wrappers'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is missing')
}

export default boot(({ app, router }) => {
  app.use(clerkPlugin, {
    publishableKey: PUBLISHABLE_KEY,
    // Let Clerk use the SPA router for redirects to avoid full page reloads
    routerPush: (to) => router.push(to as never),
    routerReplace: (to) => router.replace(to as never),
  })
})
