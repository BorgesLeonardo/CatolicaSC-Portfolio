import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import app css
import './css/app.scss'

// Import routes
import routes from './router/routes'

// Import Clerk plugin
import { clerkPlugin } from './boot/clerk'

const app = createApp({})

// Configure Quasar
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
  lang: {
    isoName: 'pt-BR',
    nativeName: 'Português (Brasil)',
  },
})

// Configure Pinia
app.use(createPinia())

// Configure Router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(router)

// Configure Clerk
app.use(clerkPlugin)

app.mount('#q-app')
