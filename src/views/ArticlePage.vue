<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'

const route = useRoute()

const content = ref('')
const frontmatter = ref({})

const posts = import.meta.glob('/src/posts/*.md', { import: 'default', query: '?raw' })

async function loadPost(slug) {
  const path = `/src/posts/${slug}.md`
  const loader = posts[path]
  if (!loader) {
    content.value = '<h1>文章未找到</h1>'
    frontmatter.value = {}
    return
  }
  try {
    const raw = await loader()
    const { content: mdContent, data } = matter(raw)
    content.value = marked.parse(mdContent)
    frontmatter.value = data
  } catch (err) {
    content.value = `<h1>加载文章出错</h1><p>${err.message}</p>`
    frontmatter.value = {}
  }
}

watchEffect(() => {
  const slug = route.params.slug
  if (slug) {
    loadPost(slug)
  }
})
</script>

<template>
  <main class="prose max-w-screen-md mx-auto px-4 py-8 mt-40">
    <h1>{{ frontmatter.title || '无标题文章' }}</h1>
    <p class="text-sm text-gray-400 mb-4">{{ frontmatter.date || '' }}</p>
    <article v-html="content" />
  </main>
</template>