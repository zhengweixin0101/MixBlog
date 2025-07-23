import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'uno.css'
import './assets/main.css'

import Home from './views/Home.vue'
import About from './views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about.html', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
