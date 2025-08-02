import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import ArticlePage from '../views/ArticlePage.vue'
import ArticleList from '../views/ArticleList.vue'
import About from '../views/About.vue'

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

export default router
