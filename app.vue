<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useHead } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'

useHead({
  titleTemplate: siteConfig.title,
  meta: [
    { charset: 'utf-8' },
    { name: 'robots', content: 'follow, index' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },

    { name: 'description', content: siteConfig.description },
    { name: 'author', content: siteConfig.author.name },
    { name: 'keywords', content: siteConfig.keywords },

    { name: 'color-scheme', content: 'only light' },
    { name: 'theme-color', content: '#f7f5f0', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#1c1b19', media: '(prefers-color-scheme: dark)' },
    { name: 'apple-mobile-web-app-title', content: 'ShinX' },
    { name: 'mobile-web-app-capable', content: 'yes' },

    { property: 'og:title', content: siteConfig.title },
    { property: 'og:description', content: siteConfig.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: siteConfig.url },
    { name: 'twitter:title', content: siteConfig.title },
    { name: 'twitter:description', content: siteConfig.description },
    { name: 'twitter:card', content: 'summary' },

    // 开发环境不发 Referer
    ...(import.meta.dev ? [{ name: 'referrer', content: 'no-referrer' }] : []),
  ],

  link: [
      ...siteConfig.icons,
    { rel: 'alternate', type: 'application/rss+xml', title: `${siteConfig.title} RSS`, href: '/rss.xml' },

    // 标题字体只取拉丁子集（Fraunces 不含汉字），中文回落系统宋体
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:SOFT,opsz,wght@0..50,9..144,500..700&display=swap',
    },
  ],

  script: [
    {
      src: siteConfig.thirdParty.umami.script,
      defer: true,
      'data-website-id': siteConfig.thirdParty.umami.siteId,
      // 只上报正式域名，本地开发环境跳过，避免把统计量刷高
      'data-domains': new URL(siteConfig.url).hostname,
    },
  ],
})
</script>