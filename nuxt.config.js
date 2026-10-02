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
  // 关闭 payload 抽离，否则 _payload.json 会成为独立缓存条目，且客户端以 force-cache 读取，导致 SPA 跳转长期命中旧内容
  experimental: {
    payloadExtraction: false,
  },
  routeRules: {
    // 所有页面 60 秒缓存
    '/**': { isr: 60 },
  },
})