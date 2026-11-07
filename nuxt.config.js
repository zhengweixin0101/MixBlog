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
  // tegaki/vue 的入口是 TS 源码（.vue SFC），必须交给 Vite 编译
  build: {
    transpile: ['tegaki'],
  },
  vite: {
    // 字体 ttf 由 bundle.js 以 `?url` 相对路径引用，预打包会把它搬进 deps 缓存并 404
    optimizeDeps: {
      exclude: ['tegaki'],
    },
  },
  routeRules: {
    // 所有页面 60 秒缓存
    '/**': { isr: 60 },
  },
})