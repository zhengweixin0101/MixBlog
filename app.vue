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
    { name: 'theme-color', content: '#f8f8f8', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#0e1111', media: '(prefers-color-scheme: dark)' },
    { name: 'apple-mobile-web-app-title', content: 'ShinX' },
    { name: 'autmobile-web-app-capablehor', content: 'yes' },

    { property: 'og:title', content: siteConfig.title },
    { property: 'og:description', content: siteConfig.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: siteConfig.url },
    { name: 'twitter:title', content: siteConfig.title },
    { name: 'twitter:description', content: siteConfig.description },
    { name: 'twitter:card', content: 'summary' }
  ],
link: [
  { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'shortcut icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },

  { rel: 'alternate', type: 'application/rss+xml', title: "ShinX's Blog RSS", href: '/rss.xml' },
  { rel: 'stylesheet', href: siteConfig.thirdParty.iconfont },
]
})
</script>