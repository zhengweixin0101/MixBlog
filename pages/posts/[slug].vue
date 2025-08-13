<script setup>
import { ref, computed, watch } from 'vue'
import { useHead, useRoute, useAsyncData } from '#imports'
import { marked } from 'marked'
import dayjs from 'dayjs'
import hljs from 'highlight.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'

import { Fancybox } from '@fancyapps/ui/dist/fancybox/'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

import Sidebar from '@/components/Sidebar.vue'
import '@/assets/article-content.css'

const route = useRoute()

// HTML 实体解析
function decodeHTMLEntities(str) {
  if (typeof document === 'undefined') return str
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

// 代码高亮处理
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

// KaTeX 渲染
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

// 图片包裹 fancybox 链接
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

// 高亮标题元素（hash）
const HIGHLIGHT_DURATION = 3000
function highlightHeading(rawId) {
  if (typeof document === 'undefined' || !rawId) return
  const id = decodeURIComponent(rawId)
  const el = document.getElementById(id)
  if (!el) return
  el.classList.add('highlighted')
  setTimeout(() => {
    el.classList.remove('highlighted')
  }, HIGHLIGHT_DURATION)
}

// 代码高亮样式动态加载
const isDark = ref(false)
function loadHighlightStyle(darkMode) {
  if (typeof document === 'undefined') return
  const prevLink = document.getElementById('hljs-theme')
  if (prevLink) prevLink.remove()
  const link = document.createElement('link')
  link.id = 'hljs-theme'
  link.rel = 'stylesheet'
  link.href = darkMode
    ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/styles/vs2015.min.css'
    : 'https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/styles/github.min.css'
  document.head.appendChild(link)
}

// 复制按钮事件
function onCopyBtnClick(e) {
  const btn = e.target.closest('.copy-btn')
  if (!btn) return
  const encodedCode = btn.getAttribute('data-code')
  if (!encodedCode) return
  const code = decodeHTMLEntities(encodedCode)
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerText
    btn.innerText = '已复制'
    setTimeout(() => {
      btn.innerText = originalText
    }, 1000)
  }).catch(() => {
    const originalText = btn.innerText
    btn.innerText = '复制失败'
    setTimeout(() => {
      btn.innerText = originalText
    }, 1000)
  })
}

//读取文章内容
const { data: rawPostData, error } = await useAsyncData(
  `post-${route.params.slug}`,
  () => $fetch(`https://blog-zwx.netlify.app/data/posts/${route.params.slug}.json`),
)

const post = computed(() => {
  if (error.value || !rawPostData.value) {
    return { content: '<h1>文章未找到</h1>', frontmatter: {}, toc: [] }
  }
  // 解析 markdown
  let html = marked.parse(rawPostData.value.content)
  html = wrapImagesWithLinks(html)
  html = addFancyboxAttributesToAnchors(html)

  const tocItems = []
  html = html.replace(/<(h[1-6])>(.*?)<\/\1>/g, (m, tag, text) => {
    const id = text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\- \u4e00-\u9fa5]/g, '')
    if (tag !== 'h1') tocItems.push({ id, text, tag: tag.toUpperCase() })
    return `<${tag} id="${id}" class="scroll-mt-40">${text}</${tag}>`
  })

  html = renderKatex(html)
  html = highlightCodeBlocks(html)

  return { content: html, frontmatter: rawPostData.value.frontmatter, toc: tocItems }
})

// 页面高亮和灯箱初始化
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  loadHighlightStyle(isDark.value)

  const observer = new MutationObserver(() => {
    const darkNow = document.documentElement.classList.contains('dark')
    if (darkNow !== isDark.value) {
      isDark.value = darkNow
      loadHighlightStyle(darkNow)
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  Fancybox.bind('[data-fancybox="gallery"]')

  window.addEventListener('hashchange', () => {
    highlightHeading(window.location.hash.slice(1))
  })

  document.addEventListener('click', onCopyBtnClick)

  onBeforeUnmount(() => {
    observer.disconnect()
    window.removeEventListener('hashchange', () => {
      highlightHeading(window.location.hash.slice(1))
    })
    document.removeEventListener('click', onCopyBtnClick)
  })
})

// 路由 hash 对应标题高亮
watch(() => route.hash, (hash) => {
  highlightHeading(hash.slice(1))
}, { immediate: true })

const formattedDate = computed(() => {
  if (!post.value.frontmatter.date) return ''
  return `ShinX 发布于 ${dayjs(post.value.frontmatter.date).format('YYYY-MM-DD')}`
})

//head
useHead(() => {
  const title = post.value.frontmatter.title || '无标题文章'
  const description = post.value.frontmatter.description || 'ShinX 的文章'
  const Keywords = computed(() => {
    const baseKeywords = ['文章', 'Posts', 'Article', 'ShinX', 'zhengweixin', 'blog', 'ShinX的个人主页']
    const tags = post.value.frontmatter.tags

    if (Array.isArray(tags) && tags.length) {
      return [...tags, ...baseKeywords].join(', ')
    } else if (typeof tags === 'string' && tags.trim() !== '') {
      return [tags, ...baseKeywords].join(', ')
    } else {
      return baseKeywords.join(', ')
    }
  })

  return {
    title: `${title} | ShinX' Blog`,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: Keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `https://zhengweixin.top/posts/${route.params.slug}` },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ]
  }
})
</script>


<template>
  <main v-if="post?.frontmatter?.title"  v-fade-in>
    <div class="py-6">
      <h1 data-fade class="text-3xl mt-40">
        <span
          class="relative inline-block transition-colors duration-300
                text-#2f3f5b
                dark:text-transparent
                dark:bg-gradient-to-r dark:from-[#00e699] dark:to-[#00e2d8]
                dark:bg-clip-text dark:-webkit-bg-clip-text
                dark:-webkit-text-fill-color-transparent"
        >
          {{ post.frontmatter.title || '无标题文章' }}
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-[#00e69980] to-[#00e2d850]
                  dark:hidden"
          />
        </span>
      </h1>
      <div data-fade class="text-sm text-#2f3f5b dark:text-gray-400 mt-2 pb-4 flex flex-col gap-2 transition-colors duration-300" style="border-bottom: 2px solid rgba(153, 153, 153, 0.4);">
        <span>{{ formattedDate }}</span>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in post.frontmatter.tags || []" :key="tag" class="px-2 py-1 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">{{ tag }}</span>
        </div>
      </div>
    </div>
    <div class="flex gap-8 px-2 flex-col md:flex-row max-w-full">
      <section data-fade class=" flex-1 min-w-0 max-w-full">
        <article v-html="post.content" class="article-content whitespace-normal break-words" />
      </section>
      <div data-fade class="sticky top-30 flex-shrink-0 hidden md:block self-start">
        <Sidebar :toc="post.toc" :title="post.frontmatter.title" />
      </div>
    </div>
  </main>
</template>