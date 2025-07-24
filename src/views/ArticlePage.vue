<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'

const posts = import.meta.glob('/src/posts/*.md', { query: '?raw', import: 'default' })

const content = ref('加载中...')
const route = useRoute()

onMounted(async () => {
  const slug = route.params.slug
  const path = `/src/posts/${slug}.md`

  const loader = posts[path]

  if (loader) {
    const rawContent = await loader()
    content.value = marked(rawContent)
  } else {
    content.value = '<h1>文章不存在</h1>'
  }
})
</script>

<template>
  <article v-html="content" class="article-container prose prose-invert max-w-3xl mx-auto mt-10" />
</template>

<style scoped>
.article-container {
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.8;
  font-size: 1.1rem;
  color: #ddd;
}

.article-container h1,
.article-container h2,
.article-container h3 {
  font-weight: bold;
  margin-top: 2em;
  margin-bottom: 1em;
}

.article-container p {
  margin-bottom: 1em;
}

.article-container pre {
  background: #1e1e1e;
  padding: 1em;
  overflow-x: auto;
  border-radius: 8px;
  color: #eee;
}

.article-container code {
  background: #2e2e2e;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: monospace;
}
</style>
