export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  hooks: {
    'nitro:build:before': async (nitro) => {
      const res = await fetch('https://raw.githubusercontent.com/zhengweixin0101/Blog-Posts/main/posts-list.json')
      const posts = await res.json()
      nitro.options.prerender.routes = posts.map(post => `/posts/${post.slug}`)
      console.log('Prerender routes:', nitro.options.prerender.routes)
    }
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
