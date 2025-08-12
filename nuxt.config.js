import { resolve } from 'path'
import { mkdirSync, writeFileSync } from 'fs'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

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

  runtimeConfig: {
    public: {
      useRemoteApi: process.env.USE_REMOTE_API === 'true',
    }
  },
  hooks: {
    // 构建前拉取数据到 public/data
    'nitro:build:before': async () => {
      console.log('开始构建，拉取博客数据...')

      const listRes = await fetch('https://blog-backend.zhengweixin0101.workers.dev/posts-list')
      if (!listRes.ok) throw new Error('获取文章列表失败')
      const postsList = await listRes.json()

      // 写入文章列表
      const dataDir = resolve(process.cwd(), 'public/data')
      mkdirSync(dataDir, { recursive: true })
      writeFileSync(resolve(dataDir, 'posts-list.json'), JSON.stringify(postsList, null, 2))

      // 获取所有文章详情
      for (const post of postsList) {
        try {
          const detailRes = await fetch(`https://blog-backend.zhengweixin0101.workers.dev/posts/${post.slug}`)
          if (!detailRes.ok) {
            console.warn(`文章详情请求失败: ${post.slug}`)
            continue
          }
          const detail = await detailRes.json()
          writeFileSync(
            resolve(dataDir, `post/${post.slug}.json`),
            JSON.stringify(detail, null, 2)
          )
        } catch (e) {
          console.warn(`请求文章详情异常: ${post.slug}`, e)
        }
      }

      console.log('博客数据拉取并保存完毕！')
    }
  }
})
