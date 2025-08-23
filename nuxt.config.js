import { siteConfig } from './siteConfig/main.js'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  nitro: {
    prerender: {
      routes: async () => {
        const baseRoutes = ['/', '/apps', '/talks', '/about',]
        if (process.argv.includes('generate')) {
          const res = await fetch(siteConfig.postsData.postsList)
          const posts = await res.json()
          const postRoutes = posts.map(post => `/posts/${post.slug}`)
          return [...baseRoutes, ...postRoutes]
        }
        return baseRoutes
      }
    }
  },
  modules: ['@nuxtjs/color-mode', '@unocss/nuxt'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },
  css: ['@/assets/main.css'],
})