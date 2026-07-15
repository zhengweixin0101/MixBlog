export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  modules: ['@nuxtjs/color-mode', '@unocss/nuxt'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: '',
  },
  css: ['@/assets/main.css'],
  app: {
    head: {
      script: [
        { src: '//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js', defer: true }
      ]
    }
  },
  routeRules: {
    // 所有页面 60 秒缓存
    '/**': { isr: 60 },
  },
})