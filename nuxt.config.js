import { siteConfig } from './siteConfig/main.js'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  nitro: {
    prerender: {
      routes: ['/', '/about', '/apps']
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