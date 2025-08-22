import { siteConfig } from './siteConfig/main.js'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  target: 'server',
  modules: ['@nuxtjs/color-mode', '@unocss/nuxt'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },
  css: ['@/assets/main.css'],
})