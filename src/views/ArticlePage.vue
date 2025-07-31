<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'

import Sidebar from '@/components/Sidebar.vue'
import Title from '@/components/PageTitle.vue'

const route = useRoute()

const content = ref('')
const frontmatter = ref({})
const toc = ref([])

const postsRaw = import.meta.glob('/src/posts/*.md', { import: 'default', query: '?raw' })

const slugMap = ref({})

async function preloadSlugs() {
  const entries = Object.entries(postsRaw)
  const map = {}

  for (const [path, loader] of entries) {
    const raw = await loader()
    const { data } = matter(raw)
    if (data.slug) {
      map[data.slug] = path
    }
  }

  slugMap.value = map
}

async function loadPost(slug) {
  const path = slugMap.value[slug]
  if (!path) {
    content.value = '<h1>文章未找到</h1>'
    frontmatter.value = {}
    toc.value = []
    return
  }

  try {
    const raw = await postsRaw[path]()
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

watchEffect(async () => {
  const slug = route.params.slug
  if (!slug) return

  if (Object.keys(slugMap.value).length === 0) {
    await preloadSlugs()
  }

  loadPost(slug)
})
</script>

<template>
  <main v-fade-in>
    <div class="max-w-full sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[75vw] 2xl:max-w-[60vw] mx-auto" style="position: relative;">
      <div class="px-4 py-4">
        <Title :text="frontmatter.title || '无标题文章'" />
        <p data-fade class="text-sm text-gray-400 mt-1 pb-3" style="border-bottom: 2px solid rgba(153, 153, 153, 0.4);">
          {{ frontmatter.date || '' }}
        </p>
      </div>
      <div class="flex gap-8 flex-col md:flex-row">
        <section class="max-w-none flex-1 px-4">
          <article data-fade v-html="content" />
        </section>
        <Sidebar data-fade class="w-72 flex-shrink-0 sticky top-30" :toc="toc" :title="frontmatter.title" />
      </div>
    </div>
  </main>
</template>
