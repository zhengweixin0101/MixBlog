import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'uno.css'
import './assets/main.css'

import Home from './views/Home.vue'
import ArticlePage from './views/ArticlePage.vue'
import ArticleList from './views/ArticleList.vue'
import About from './views/About.vue'

import fadeIn from './directives/fadeIn.js'

const routes = [
  { path: '/', component: Home },
  { path: '/posts/:slug.html', component: ArticlePage },
  { path: '/posts.html', component: ArticleList },
  { path: '/about.html', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

import { Buffer } from 'buffer'
window.Buffer = Buffer

const app = createApp(App)

app.directive('fade-in', fadeIn)

app.use(router).mount('#app')