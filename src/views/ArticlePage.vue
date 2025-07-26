<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'

const route = useRoute()

const content = ref('')
const frontmatter = ref({})
const toc = ref([])

const posts = import.meta.glob('/src/posts/*.md', { import: 'default', query: '?raw' })

function extractToc(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
  return Array.from(headings).map(heading => ({
    id: heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-'),
    text: heading.textContent,
    tag: heading.tagName
  }))
}

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
    content.value = html
    frontmatter.value = data
    toc.value = extractToc(html)
  } catch (err) {
    content.value = `<h1>加载文章出错</h1><p>${err.message}</p>`
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
  <div class="article-container">
    <main class="prose max-w-screen-md mx-auto px-4 py-8 mt-40">
      <h1>{{ frontmatter.title || '无标题文章' }}</h1>
      <p class="text-sm text-gray-400 mb-4">{{ frontmatter.date || '' }}</p>
      <div class="toc-mobile backdrop-blur-sm bg-white/10 p-4 rounded-lg">
        <h2 class="text-xl font-bold mb-4">目录</h2>
        <h3 class="text-lg font-semibold mb-4">{{ frontmatter.title || '无标题文章' }}</h3>
        <ul>
          <li v-for="(item, index) in toc" :key="index" class="mb-2">
            <span 
              class="hover:text-primary transition-colors flex items-center"
              :class="{
                'pl-4': item.tag === 'H2',
                'pl-8': item.tag === 'H3',
                'pl-12': item.tag === 'H4',
                'pl-16': item.tag === 'H5',
                'pl-20': item.tag === 'H6'
              }"
            >
              <span v-if="item.text.includes(' ')" class="mr-2">•</span>
              {{ item.text }}
            </span>
          </li>
        </ul>
      </div>
      <article v-html="content" />
    </main>
    <aside class="toc-desktop backdrop-blur-sm bg-white/10 p-4 rounded-lg sticky top-20">
      <h2 class="text-xl font-bold mb-4">目录</h2>
        <h3 class="text-lg font-semibold mb-4">{{ frontmatter.title || '无标题文章' }}</h3>
      <ul>
        <li v-for="(item, index) in toc" :key="index" class="mb-2">
          <span 
            class="hover:text-primary transition-colors flex items-center"
            :class="{
              'pl-4': item.tag === 'H2',
              'pl-8': item.tag === 'H3',
              'pl-12': item.tag === 'H4',
              'pl-16': item.tag === 'H5',
              'pl-20': item.tag === 'H6'
            }"
          >
            <span v-if="item.text.includes(' ')" class="mr-2">•</span>
            {{ item.text }}
          </span>
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.article-container {
  display: flex;
  gap: 2rem;
}

.toc-desktop {
  width: 250px;
  position: sticky;
  top: 100px;
  align-self: flex-start;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  box-shadow: 0 0 9px rgba(255, 255, 255, 0.1);
}

.toc-desktop h2,
.toc-mobile h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
  background: linear-gradient(to right, #00e699, #00e2d8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.toc-desktop ul,
.toc-mobile ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-desktop li,
.toc-mobile li {
  margin-bottom: 0.5rem;
}

.toc-desktop a,
.toc-mobile a {
  color: var(--color-text);
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.toc-desktop a:hover,
.toc-mobile a:hover {
  color: var(--color-primary);
  transform: scale(1.05);
}

.toc-mobile {
  display: none;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 9px rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .article-container {
    flex-direction: column;
  }
  
  .toc-desktop {
    display: none;
  }
  
  .toc-mobile {
    display: block;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>