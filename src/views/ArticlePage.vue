<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'

import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()

const content = ref('')
const frontmatter = ref({})
const toc = ref([])

const posts = import.meta.glob('/src/posts/*.md', { import: 'default', query: '?raw' })

async function loadPost(slug) {
  const path = `/src/posts/${slug}.md`
  const loader = posts[path]
  if (!loader) {
    content.value = '<h1>文章未找到</h1>'
    frontmatter.value = {}
    toc.value = []
    return
  }

  try {
    const raw = await loader()
    const { content: mdContent, data } = matter(raw)
    const html = marked.parse(mdContent)

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const tocItems = []

    headings.forEach((heading) => {
      const text = heading.textContent || ''
      const id = heading.id || text.toLowerCase().replace(/\s+/g, '-')
      heading.id = id

      if (heading.tagName !== 'H1') {
        heading.classList.add('scroll-mt-40')
        tocItems.push({ id, text, tag: heading.tagName })
      }
    })

    content.value = doc.body.innerHTML
    frontmatter.value = data
    toc.value = tocItems
  } catch (error) {
    content.value = `<h1>加载文章出错</h1><p>${error.message}</p>`
    frontmatter.value = {}
    toc.value = []
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
  <div
    class="flex gap-8 flex-col md:flex-row
           md:left-1/2 md:-translate-x-1/2
           max-w-full sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[75vw] 2xl:max-w-[60vw]"
    style="position: relative;"
  >
    <main class="prose max-w-none flex-1 px-4 py-8 mt-40">
      <h1>{{ frontmatter.title || '无标题文章' }}</h1>
      <p class="text-sm text-gray-400 mb-4">{{ frontmatter.date || '' }}</p>

      <article v-html="content" />
    </main>

    <Sidebar class="top-50 w-72 flex-shrink-0" :toc="toc" :title="frontmatter.title" />
  </div>
</template>
