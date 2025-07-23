import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'uno.css'
import './assets/main.css'

import Home from './views/Home.vue'
import About from './views/About.vue'

import fadeIn from './directives/fadeIn.js'

const routes = [
  { path: '/', component: Home },
  { path: '/about.html', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.directive('fade-in', fadeIn)

app.use(router).mount('#app')
