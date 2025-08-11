<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useHead } from '#imports'

useHead({
  titleTemplate: "ShinX' Blog",
  meta: [
    { charset: 'utf-8' },
    { name: 'robots', content: 'follow, index' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: "This is ShinX’s blog, created by a student and a gamer." },
    { name: 'author', content: 'ShinX' },
    { name: 'keywords', content: 'ShinX,zhengweixin,blog,ShinX的个人主页' },

    { name: 'color-scheme', content: 'only light' },
    { name: 'theme-color', content: '#f8f8f8', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#0e1111', media: '(prefers-color-scheme: dark)' },
    { name: 'apple-mobile-web-app-title', content: 'ShinX' },
    { name: 'autmobile-web-app-capablehor', content: 'yes' },

    { property: 'og:title', content: "ShinX' Blog" },
    { property: 'og:description', content: "This is ShinX’s blog, created by a student and a gamer." },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://zhengweixin.top' },
    { name: 'twitter:title', content: "ShinX' Blog" },
    { name: 'twitter:description', content: 'This is ShinX’s blog, created by a student and a gamer.' },
    { name: 'twitter:card', content: 'summary' }
  ],
link: [
  { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
  { rel: 'shortcut icon', href: '/favicon.ico' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },

  { rel: 'alternate', type: 'application/rss+xml', title: "ShinX's Blog RSS", href: '/rss.xml' },
  { rel: 'stylesheet', href: '//at.alicdn.com/t/c/font_4401174_c72513gwuso.css' }
]
})
</script>