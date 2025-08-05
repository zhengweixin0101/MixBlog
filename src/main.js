const userTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

if (userTheme === 'dark' || (!userTheme && prefersDark)) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

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