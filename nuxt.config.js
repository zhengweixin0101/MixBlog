// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  nitro: {
    publicAssets: [
      { base: '/posts', dir: 'posts' }
    ],
  },
  modules: [
    '@nuxtjs/color-mode',
    '@unocss/nuxt',
  ],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },
  css: ['@/assets/main.css'],
  plugins: ['@/plugins/directives.js'],
})
