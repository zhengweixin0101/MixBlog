<script setup>
import { ref, watchEffect, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import matter from 'gray-matter'
import { marked } from 'marked'
import dayjs from 'dayjs'

import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

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

// 渲染 KaTeX 公式
function renderKatex(html) {
  // $$...$$ 块级公式
  html = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr, { displayMode: true, throwOnError: false })
    } catch {
      return `<span class="katex-error">$$${expr}$$</span>`
    }
  })
  // $...$ 行内公式
  html = html.replace(/\$(.+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr, { displayMode: false, throwOnError: false })
    } catch {
      return `<span class="katex-error">$${expr}$</span>`
    }
  })
  return html
}

// 给所有单独的 <img> 包裹 <a href="图片地址" data-fancybox="gallery">
function wrapImagesWithLinks(html) {
  return html.replace(
    /<p>(\s*<img[^>]+?>\s*)<\/p>/g,
    (match, imgTag) => {
      if (/^<a[^>]+>.*<\/a>$/.test(imgTag)) return match; // 已包裹的跳过

      const srcMatch = imgTag.match(/src="([^"]+)"/)
      if (!srcMatch) return match

      const src = srcMatch[1]
      return `<p><a href="${src}" data-fancybox="gallery">${imgTag}</a></p>`
    }
  )
}

// 给所有已经被 <a> 包裹的图片加 data-fancybox="gallery"
function addFancyboxAttributesToAnchors(html) {
  return html.replace(
    /<a([^>]+?)>(\s*<img[^>]+?>\s*)<\/a>/g,
    (match, aAttrs, imgTag) => {
      if (/data-fancybox=/.test(aAttrs)) return match
      return `<a${aAttrs} data-fancybox="gallery">${imgTag}</a>`
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

    // 先给单独图片包裹 <a>
    html = wrapImagesWithLinks(html)

    // 给已有包裹图片的 <a> 加上 data-fancybox
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

    // 文章内容更新后，重新绑定 Fancybox
    // 用下一事件循环保证 DOM 已渲染
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

onMounted(() => {
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
        <div data-fade class="sticky top-30 w-72 flex-shrink-0 mr-3 hidden md:block self-start">
          <Sidebar :toc="toc" :title="frontmatter.title" />
        </div>
      </div>
    </div>
  </main>
</template>
