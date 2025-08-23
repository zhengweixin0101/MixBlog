import { siteConfig } from './siteConfig/main.js'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  hooks: {
    'nitro:build:before': async (nitro) => {
      if (nitro.options.prerender.generate) {
        const res = await fetch(siteConfig.postsData.postsList)
        const posts = await res.json()
        nitro.options.prerender.routes = posts.map(post => `/posts/${post.slug}`)
        console.log('Prerender routes:', nitro.options.prerender.routes)
      }
    },
  },
  nitro: {
    prerender: {
      routes: ['/', '/about', '/apps', '/talks'],
    },
  },
  modules: ['@nuxtjs/color-mode', '@unocss/nuxt'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },
  css: ['@/assets/main.css'],
})