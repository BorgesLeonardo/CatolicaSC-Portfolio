import { createApp } from 'vue'
import { Quasar } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import app css
import './css/app.scss'

const app = createApp({})

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

app.mount('#q-app')
