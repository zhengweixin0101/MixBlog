<script setup>
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  keywords: { type: String, default: '' },
  image: { type: String, default: '' },
})

const route = useRoute()
const currentUrl = window.location.origin + route.fullPath

useHead({
  title: props.title || 'ShinX',
  meta: [
    { name: 'description', content: props.description || 'ShinX的个人博客。' },
    { name: 'keywords', content: props.keywords || 'ShinX,zhengweixin,blog,ShinX的个人主页' },
    { property: 'og:title', content: props.title || 'ShinX' },
    { property: 'og:description', content: props.description || 'ShinX的个人博客。' },
    { property: 'og:url', content: currentUrl },
    { name: 'twitter:title', content: props.title || 'ShinX' },
    { name: 'twitter:description', content: props.description || 'ShinX的个人博客。' },
    { name: 'twitter:card', content: 'summary' },
  ],
})
</script>