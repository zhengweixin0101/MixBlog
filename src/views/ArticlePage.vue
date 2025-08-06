<script setup>
import Head from '@/components/Head.vue'

import { ref, watchEffect, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'
import dayjs from 'dayjs'

import hljs from 'highlight.js'

import katex from 'katex'
import 'katex/dist/katex.min.css'

import Sidebar from '@/components/Sidebar.vue'
import Title from '@/components/PageTitle.vue'
import '@/assets/article-content.css'

import { Fancybox } from '@fancyapps/ui/dist/fancybox/'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

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
            class="copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded-lg bg-black/50 text-white dark:bg-white/10 dark:text-white opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
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

// 渲染 KaTeX 公式
function renderKatex(html) {
  html = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr, { displayMode: true, throwOnError: false })
    } catch {
      return `<span class="katex-error">$$${expr}$$</span>`
    }
  })
  html = html.replace(/\$(.+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr, { displayMode: false, throwOnError: false })
    } catch {
      return `<span class="katex-error">$${expr}$</span>`
    }
  })
  return html
}

function wrapImagesWithLinks(html) {
  return html.replace(
    /<p>(\s*<img[^>]+?>\s*)<\/p>/g,
    (match, imgTag) => {
      if (/^<a[^>]+>.*<\/a>$/.test(imgTag)) return match

      const srcMatch = imgTag.match(/src="([^"]+)"/)
      if (!srcMatch) return match

      const src = srcMatch[1]
      const lazyImgTag = imgTag.replace('<img', '<img loading="lazy"')
      return `<p><a href="${src}" data-fancybox="gallery">${lazyImgTag}</a></p>`
    }
  )
}

function addFancyboxAttributesToAnchors(html) {
  return html.replace(
    /<a([^>]+?)>(\s*<img[^>]+?>\s*)<\/a>/g,
    (match, aAttrs, imgTag) => {
      if (/data-fancybox=/.test(aAttrs)) return match
      const lazyImgTag = imgTag.replace('<img', '<img loading="lazy"')
      return `<a${aAttrs} data-fancybox="gallery">${lazyImgTag}</a>`
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

    html = wrapImagesWithLinks(html)
    html = addFancyboxAttributesToAnchors(html)

    // 生成目录
    const tocItems = []
    html = html.replace(/<(h[1-6])>(.*?)<\/\1>/g, (match, tag, text) => {
      const id = text.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\- \u4e00-\u9fa5]/g, '')
      if (tag !== 'h1') tocItems.push({ id, text, tag: tag.toUpperCase() })
      return `<${tag} id="${id}" class="scroll-mt-40">${text}</${tag}>`
    })

    html = renderKatex(html)
    html = highlightCodeBlocks(html)

    content.value = html
    frontmatter.value = data
    toc.value = tocItems

    setTimeout(() => {
      Fancybox.bind('[data-fancybox="gallery"]')
    }, 0)
  } catch (error) {
    content.value = `<h1>加载文章出错</h1><p>${error.message}</p>`
    frontmatter.value = {}
    toc.value = []
  }
}

// 高亮函数
const HIGHLIGHT_DURATION = 3000
function highlightHeading(rawId) {
  if (!rawId) return
  const id = decodeURIComponent(rawId)
  const el = document.getElementById(id)
  if (!el) return
  el.classList.add('highlighted')
  setTimeout(() => {
    el.classList.remove('highlighted')
  }, HIGHLIGHT_DURATION)
}

// 记录当前是否暗色模式
const isDark = ref(document.documentElement.classList.contains('dark'))

function loadHighlightStyle(darkMode) {
  const prevLink = document.getElementById('hljs-theme')
  if (prevLink) prevLink.remove()

  const link = document.createElement('link')
  link.id = 'hljs-theme'
  link.rel = 'stylesheet'
  link.href = darkMode
    ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/styles/vs2015.min.css' // 代码高亮 暗色主题
    : 'https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/styles/github.min.css' // 代码高亮 亮色主题

  document.head.appendChild(link)
}

// 监听 html class 切换
let observer = null

onMounted(() => {
  loadHighlightStyle(isDark.value)

  observer = new MutationObserver(() => {
    const darkNow = document.documentElement.classList.contains('dark')
    if (darkNow !== isDark.value) {
      isDark.value = darkNow
      loadHighlightStyle(darkNow)
    }
  })

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  highlightHeading(window.location.hash.slice(1))

  window.addEventListener('hashchange', () => {
    highlightHeading(window.location.hash.slice(1))
  })

  // 绑定复制按钮功能
  const timers = new WeakMap()
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn')
    if (!btn) return

    const encodedCode = btn.getAttribute('data-code')
    if (!encodedCode) return

    const code = decodeHTMLEntities(encodedCode)

    if (timers.has(btn)) {
      clearTimeout(timers.get(btn))
    }

    const originalText = btn.innerText

    navigator.clipboard.writeText(code).then(() => {
      btn.innerText = '已复制'
      const timerId = setTimeout(() => {
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

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

watchEffect(async () => {
  const slug = route.params.slug
  if (!slug) return

  if (Object.keys(slugMap.value).length === 0) {
    await preloadSlugs()
  }

  await loadPost(slug)

  setTimeout(() => {
    highlightHeading(window.location.hash.slice(1))
  }, 300)
})

const formattedDate = computed(() => {
  if (!frontmatter.value.date) return ''
  return `ShinX 发布于 ${dayjs(frontmatter.value.date).format('YYYY-MM-DD')}`
})
</script>

<template>
  <Head v-if="frontmatter.title"
    :title="`${frontmatter.title} | ShinX’s Blog`"
    :description="frontmatter.description"
    :keywords="(frontmatter.tags || []).join(',')"
  />

  <main v-fade-in>
    <div v-if="frontmatter.title" class="py-6">
      <Title data-fade :text="frontmatter.title || '无标题文章'" />
      <div data-fade class="text-sm text-#2f3f5b dark:text-gray-400 mt-2 pb-4 flex flex-col gap-2 transition-colors duration-300" style="border-bottom: 2px solid rgba(153, 153, 153, 0.4);">
        <span>{{ formattedDate }}</span>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in frontmatter.tags || []" :key="tag" class="px-2 py-1 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">{{ tag }}</span>
        </div>
      </div>
    </div>
    <div class="flex gap-8 px-2 flex-col md:flex-row max-w-full">
      <section class=" flex-1 min-w-0 max-w-full">
        <article data-fade v-html="content" class="article-content whitespace-normal break-words" />
      </section>
      <div data-fade class="sticky top-30 flex-shrink-0 hidden md:block self-start">
        <Sidebar :toc="toc" :title="frontmatter.title" />
      </div>
    </div>
  </main>
</template>
