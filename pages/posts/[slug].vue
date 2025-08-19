<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useHead, useRoute } from '#imports'
import { marked } from 'marked'
import dayjs from 'dayjs'
import hljs from 'highlight.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'

import { Fancybox } from '@fancyapps/ui/dist/fancybox/'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

import Comment from '@/components/Comment.vue'
import Sidebar from '@/components/Sidebar.vue'
import '@/assets/article-content.css'

import { siteConfig } from '@/siteConfig/main.js'

const route = useRoute()

// HTML实体解析
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
      return `
        <div class="code-block-wrapper group relative">
          <button
            class="copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded-lg border border-black/20 dark:border-white/20 bg-black/50 text-white dark:bg-white/10 dark:text-white opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
            data-code="${encodeHTMLEntities(decoded)}"
          >复制</button>
          <pre><code class="hljs ${lang ? 'language-' + lang : ''}">${decoded}</code></pre>
        </div>
      `
    }
  )
}

// KaTeX 渲染
function renderKatex(html) {
  const codeBlocks = []
  html = html.replace(/<pre><code[\s\S]*?<\/code><\/pre>/g, (match) => {
    codeBlocks.push(match)
    return `___CODE_BLOCK_${codeBlocks.length - 1}___`
  })
  html = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    try { return katex.renderToString(expr, { displayMode: true, throwOnError: false }) } 
    catch { return `<span class="katex-error">$$${expr}$$</span>` }
  })
  html = html.replace(/\$(.+?)\$/g, (_, expr) => {
    try { return katex.renderToString(expr, { displayMode: false, throwOnError: false }) } 
    catch { return `<span class="katex-error">$${expr}$</span>` }
  })
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, index) => codeBlocks[index])
  return html
}

// 图片包裹 fancybox 链接
function wrapImagesWithLinks(html) {
  return html.replace(/<p>(\s*<img[^>]+?>\s*)<\/p>/g, (match, imgTag) => {
    if (/^<a[^>]+>.*<\/a>$/.test(imgTag)) return match
    const srcMatch = imgTag.match(/src="([^"]+)"/)
    if (!srcMatch) return match
    const src = srcMatch[1]
    const lazyImgTag = imgTag.replace('<img', '<img loading="lazy"')
    return `<p><a href="${src}" data-fancybox="gallery">${lazyImgTag}</a></p>`
  })
}
function addFancyboxAttributesToAnchors(html) {
  return html.replace(/<a([^>]+?)>(\s*<img[^>]+?>\s*)<\/a>/g, (match, aAttrs, imgTag) => {
    if (/data-fancybox=/.test(aAttrs)) return match
    const lazyImgTag = imgTag.replace('<img', '<img loading="lazy"')
    return `<a${aAttrs} data-fancybox="gallery">${lazyImgTag}</a>`
  })
}

// 代码高亮样式
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

// 复制按钮
function onCopyBtnClick(e) {
  const btn = e.target.closest('.copy-btn')
  if (!btn) return
  const encodedCode = btn.getAttribute('data-code')
  if (!encodedCode) return
  const code = decodeHTMLEntities(encodedCode)
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerText
    btn.innerText = '已复制'
    setTimeout(() => { btn.innerText = originalText }, 1000)
  }).catch(() => {
    const originalText = btn.innerText
    btn.innerText = '复制失败'
    setTimeout(() => { btn.innerText = originalText }, 1000)
  })
}

// 获取文章
const { data: rawPostData, error } = await useAsyncData(
  `post-${route.params.slug}`,
  () => $fetch(`${siteConfig.postsData.postContent}/${route.params.slug}.json`)
)

const post = ref({
  content: '',
  frontmatter: {},
  toc: []
})

const notFound = computed(() => error.value || !rawPostData.value)

// 解析文章
watch([rawPostData, error], () => {
  if (notFound.value) {
    post.value = {
      content: '',
      frontmatter: {
        title: '文章未找到',
        description: '该文章不存在或已被删除。',
        tags: ['不存在', 'Not Found', '404']
      },
      toc: []
    }
  } else {
    let html = marked(rawPostData.value.content)
    html = wrapImagesWithLinks(html)
    html = addFancyboxAttributesToAnchors(html)
    html = renderKatex(html)
    html = highlightCodeBlocks(html)

    // 为外部链接添加 target="_blank" 和 rel="nofollow"
    const siteDomain = new URL(siteConfig.url).hostname
    html = html.replace(/<a href="([^"]+)"/g, (match, href) => {
      try {
        const link = new URL(href, siteConfig.url)
        if (link.hostname !== siteDomain) {
          let attrs = ''
          if (!/target=/.test(match)) attrs += ' target="_blank"'
          if (!/rel=/.test(match)) attrs += ' rel="nofollow noopener noreferrer"'
          return match.replace('<a', `<a${attrs}`)
        }
      } catch (e) {
        return match
      }
      return match
    })

    const tocItems = []
    html = html.replace(/<(h[1-6])>(.*?)<\/\1>/g, (m, tag, text) => {
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\- \u4e00-\u9fa5]/g, '')
      if (tag !== 'h1') tocItems.push({ id, text, tag: tag.toUpperCase() })
      return `<${tag} id="${id}" class="scroll-mt-18">${text}</${tag}>`
    })

    post.value = {
      content: html,
      frontmatter: rawPostData.value.frontmatter,
      toc: tocItems
    }
  }
}, { immediate: true })

// head
useHead(() => {
  const title = post.value.frontmatter.title || '无标题文章'
  const description = post.value.frontmatter.description || `${siteConfig.author.name} 的文章`
  const keywords = Array.isArray(post.value.frontmatter.tags) ? post.value.frontmatter.tags.join(',') : post.value.frontmatter.tags || ''
  return {
    titleTemplate: `${title} | ${siteConfig.title}`,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: `${keywords},${siteConfig.keywords}` },
      { property: 'og:title', content: `${title} | ${siteConfig.title}` },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `${siteConfig.url}/${route.params.slug}` },
      { name: 'twitter:title', content: `${title} | ${siteConfig.title}` },
      { name: 'twitter:description', content: description },
    ]
  }
})

// 页面挂载
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
  document.addEventListener('click', onCopyBtnClick)

  // 客户端高亮代码块
  document.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block)
  })

  onBeforeUnmount(() => {
    observer.disconnect()
    document.removeEventListener('click', onCopyBtnClick)
  })
})

// 格式化日期
const formattedDate = computed(() => {
  if (!post.value.frontmatter.date) return ''
  return `${siteConfig.author.name} 发布于 ${dayjs(post.value.frontmatter.date).format('YYYY-MM-DD')}`
})
</script>

<template>
  <main v-fade-in>
    <div v-if="notFound" class="min-h-screen flex flex-col items-center justify-center text-center text-white px-6">
      <div data-fade>
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 24 24"
          class="drop-shadow-glow animate-flicker text-yellow-500"
          height="60"
          width="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path
              d="M4 20v-6a8 8 0 1 1 16 0v6h1v2H3v-2h1zm2-6h2a4 4 0 0 1 4-4V8a6 6 0 0 0-6 6zm5-12h2v3h-2V2zm8.778 2.808l1.414 1.414-2.12 2.121-1.415-1.414 2.121-2.121zM2.808 6.222l1.414-1.414 2.121 2.12L4.93 8.344 2.808 6.222z"
            ></path>
          </g>
        </svg>
      </div>
      <h1 data-fade class="mt-8 text-3xl sm:text-5xl font-bold text-#2f3f5b dark:text-#CCC">Post not found.</h1>
      <div data-fade class="mt-10 flex flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/posts"
          class="custom-gradient-link inline-flex relative font-medium text-#2f3f5b no-underline"
          data-fade
        >
          <span class="dark:text-gradient"
            >← Back to List</span
          >
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-#00e699/30 to-#00e2d8/30
                  dark:hidden transition-colors duration-300"
          ></span>
        </NuxtLink>
      </div>
    </div>

    <div v-else>
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
            ></span>
          </span>
        </h1>
        <div data-fade class="text-sm text-#2f3f5b dark:text-gray-400 mt-2 pb-4 flex flex-col gap-2 transition-colors duration-300" style="border-bottom: 2px solid rgba(153, 153, 153, 0.4);">
          <span>{{ formattedDate }}</span>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in post.frontmatter.tags || []" :key="tag" class="px-2 py-1 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">{{ tag }}</span>
          </div>
        </div>
      </div>
      <div class="flex lg:gap-8 px-2 flex-col md:flex-row max-w-full">
        <section data-fade class=" flex-1 min-w-0 max-w-full">
          <article v-html="post.content" class="article-content whitespace-normal break-words"></article>
        </section>
        <div data-fade class="sticky top-30 flex-shrink-0 hidden md:block self-start">
          <Sidebar :toc="post.toc" :title="post.frontmatter.title" />
          <div class="flex items-center justify-center py-20"></div>
        </div>
      </div>
      <Comment data-fade />
    </div>
  </main>
</template>

<style>
/* 闪烁动画 */
@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 22%, 24%, 55% { opacity: 0.4; }
}
.animate-flicker {
  animation: flicker 1.5s infinite;
}

/* 阴影光晕 */
.drop-shadow-glow {
  filter: drop-shadow(0 0 10px #facc15);
}
</style>