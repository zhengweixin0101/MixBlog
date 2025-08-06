<!-- src/components/Head.vue -->
<script setup>
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  keywords: { type: [String, Array], default: '' },
  image: { type: String, default: '/og-image.png' },
})

const route = useRoute()

const currentUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.origin + route.fullPath
})

const resolvedKeywords = computed(() => {
  const baseKeywords = ['ShinX', 'zhengweixin', 'blog', 'ShinX的个人主页']
  if (Array.isArray(props.keywords)) {
    return [...baseKeywords, ...props.keywords].join(',')
  } else if (typeof props.keywords === 'string' && props.keywords.trim() !== '') {
    return [props.keywords, ...baseKeywords].join(',')
  } else {
    return baseKeywords.join(',')
  }
})

useHead({
  title: props.title || 'ShinX',
  meta: [
    { name: 'description', content: props.description || 'ShinX的个人博客。' },
    { name: 'keywords', content: resolvedKeywords.value },
    { property: 'og:title', content: props.title || 'ShinX' },
    { property: 'og:description', content: props.description || 'ShinX的个人博客。' },
    { property: 'og:url', content: currentUrl.value },
    { name: 'twitter:title', content: props.title || 'ShinX' },
    { name: 'twitter:description', content: props.description || 'ShinX的个人博客。' },
    { name: 'twitter:card', content: 'summary' },
  ],
})
</script>

<template>
  <noscript />
</template>