<script setup>
import { ref, watchEffect, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'
import dayjs from 'dayjs'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import Sidebar from '@/components/Sidebar.vue'
import Title from '@/components/PageTitle.vue'
import '@/assets/article-content.css'

const route = useRoute()

const content = ref('')
const frontmatter = ref({})
const toc = ref([])

const postsRaw = import.meta.glob('/src/posts/*.md', { import: 'default', query: '?raw' })

const slugMap = ref({})

function decodeHTMLEntities(str) {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

function encodeHTMLEntities(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
}

function highlightCodeBlocks(html) {
  return html.replace(
    /<pre><code(?: class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) => {
      const decoded = decodeHTMLEntities(code)
      const highlighted = lang && hljs.getLanguage(lang)
        ? hljs.highlight(decoded, { language: lang }).value
        : hljs.highlightAuto(decoded).value

      return `
        <div class="code-block-wrapper group relative">
          <button
            class="copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded-lg bg-white/10 text-white opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
            style="outline:none; border:none; box-shadow:none; -webkit-appearance:none; -moz-appearance:none; appearance:none; background-clip: padding-box;"
            data-code="${encodeHTMLEntities(decoded)}"
          >
            复制
          </button>
          <pre><code class="hljs">${highlighted}</code></pre>
        </div>
      `
    }
  )
}

async function preloadSlugs() {
  const entries = Object.entries(postsRaw)
  const map = {}

  for (const [path, loader] of entries) {
    const raw = await loader()
    const { data } = matter(raw)
    const fileName = path.split('/').pop().replace(/\.md$/, '')
    const slug = data.slug || fileName
    map[slug] = path
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

    let html = marked.parse(mdContent)

    const tocItems = []
    html = html.replace(/<(h[1-6])>(.*?)<\/\1>/g, (match, tag, text) => {
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
      if (tag !== 'h1') tocItems.push({ id, text, tag: tag.toUpperCase() })
      return `<${tag} id="${id}" class="scroll-mt-40">${text}</${tag}>`
    })

    html = highlightCodeBlocks(html)

    content.value = html
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

// 添加复制按钮功能
onMounted(() => {
  // Map 存储每个按钮的定时器 ID，防止多次点击冲突
  const timers = new WeakMap()

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn')
    if (!btn) return

    const encodedCode = btn.getAttribute('data-code')
    if (!encodedCode) return

    const code = decodeHTMLEntities(encodedCode)

    // 清除之前的定时器，防止文字还没恢复就重复点击
    if (timers.has(btn)) {
      clearTimeout(timers.get(btn))
    }

    const originalText = btn.innerText

    navigator.clipboard.writeText(code).then(() => {
      btn.innerText = '已复制'
      const timerId = setTimeout(() => {
        // 先判断按钮还存在
        if (document.body.contains(btn)) {
          btn.innerText = originalText
        }
        timers.delete(btn)
      }, 1000)
      timers.set(btn, timerId)
    }).catch(() => {
      btn.innerText = '复制失败'
      const timerId = setTimeout(() => {
        if (document.body.contains(btn)) {
          btn.innerText = originalText
        }
        timers.delete(btn)
      }, 1000)
      timers.set(btn, timerId)
    })
  })
})

const formattedDate = computed(() => {
  if (!frontmatter.value.date) return ''
  return `ShinX 发布于 ${dayjs(frontmatter.value.date).format('YYYY-MM-DD')}`
})
</script>

<template>
  <main v-fade-in>
    <div class="max-w-full sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[75vw] 2xl:max-w-[60vw] mx-auto" style="position: relative;">
      <div class="px-4 py-4">
        <Title data-fade :text="frontmatter.title || '无标题文章'" />
        <div data-fade class="text-sm text-gray-400 mt-2 pb-4 flex flex-col gap-2" style="border-bottom: 2px solid rgba(153, 153, 153, 0.4);">
          <span>{{ formattedDate }}</span>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in frontmatter.tags || []" :key="tag" class="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80">{{ tag }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-8 flex-col md:flex-row max-w-full">
        <section class="px-4 flex-1 min-w-0 max-w-full md:max-w-[calc(75vw-288px-32px)]">
          <article data-fade v-html="content" class="article-content whitespace-normal break-words" />
        </section>
        <Sidebar data-fade class="w-72 flex-shrink-0 sticky top-30 hidden md:block" :toc="toc" :title="frontmatter.title" />
      </div>
    </div>
  </main>
</template>
