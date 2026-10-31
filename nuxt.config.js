export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  modules: ['@nuxtjs/color-mode', '@unocss/nuxt'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },
  css: ['@/assets/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
    },
  },
  // 关闭 payload 抽离：_payload.json 会变成独立缓存条目并被 force-cache 读取，SPA 跳转长期命中旧内容
  experimental: {
    payloadExtraction: false,
  },
  routeRules: {
    // 所有页面 60 秒缓存
    '/**': { isr: 60 },
  },
})