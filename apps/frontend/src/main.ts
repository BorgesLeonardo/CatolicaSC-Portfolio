import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import Quasar from './quasar'
import { clerkPlugin } from '@clerk/vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, { plugins: {} })

app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  // rotas amigáveis
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard'
})

app.mount('#app')
