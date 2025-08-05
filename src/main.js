import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'uno.css'
import './assets/main.css'

import fadeIn from './directives/fadeIn.js'
import { Buffer } from 'buffer'
window.Buffer = Buffer

const app = createApp(App)
app.directive('fade-in', fadeIn)
app.use(router)
app.mount('#app')