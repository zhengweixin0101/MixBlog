<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useHead, useRoute } from '#imports'
import { useNotification } from '~/composables/useNotification'
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
const notification = useNotification()

// 二维码浮层控制
const showDonateQR = ref(false)
const showMobileQR = ref(false)

// 获取文章
const { data: rawPostData, error } = await useAsyncData(
  `post-${route.params.slug}`,
  () => $fetch(`${siteConfig.apiUrl}/api/article/get?slug=${route.params.slug}`),
  { server: true }
)

const post = ref({
  content: '',
  frontmatter: {},
  toc: []
})

const notFound = computed(() => error.value || !rawPostData.value)

// 代码高亮处理
function highlightCodeBlocks(html) {
  return html.replace(
    /<pre><code(?: class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) => {
      const finalLang = lang && ['language'].includes(lang.toLowerCase()) ? '' : lang;
      const lines = (code.match(/\n/g) || []).length + 1
      const isCollapsed = lines > 20
      const encodedCode = typeof encodeURIComponent === 'function' ? encodeURIComponent(code) : code
      return `
        <div class="code-block-wrapper group relative ${isCollapsed ? 'collapsed' : ''}" data-lines="${lines}" aria-expanded="${isCollapsed ? 'false' : 'true'}">
          <button
            class="copy-btn absolute top-2 right-2 px-2 py-1 text-xs rounded-lg border border-black/20 backdrop-blur-2 dark:border-white/20 bg-black/50 text-white dark:bg-white/10 dark:text-white opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100 cursor-pointer"
            data-code="${encodedCode}"
          >复制</button>
          <pre><code class="hljs ${finalLang ? 'language-' + finalLang : ''}">${code}</code></pre>
          ${isCollapsed ? `
          <div class="fold-overlay pointer-events-none absolute left-0 right-0 bottom-0 h-20"></div>
          <button class="expand-btn absolute left-1/2 -translate-x-1/2 bottom-5 px-3 py-2 text-xs rounded-lg border border-black/20 backdrop-blur-2 dark:border-white/20 bg-black/50 text-white dark:bg-white/10 dark:text-white cursor-pointer z-10">展开剩余代码</button>
          ` : ''}
        </div>
      `;
    }
  );
}

// KaTeX 渲染
function renderKatex(html) {
  const codeBlocks = []
  html = html.replace(/<pre><code[\s\S]*?<\/code><\/pre>/g, match => {
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
    const lazyImgTag = imgTag.replace(
      '<img',
      '<img loading="lazy" class="fade-in-image" onload="this.style.opacity=1" style="opacity:0;transition:opacity 0.3s ease-in-out;"'
    )
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

// 代码块复制、展开按钮点击处理
function onDocumentClick(e) {
  // 复制
  const copyBtn = e.target.closest('.copy-btn')
  if (copyBtn) {
    const encoded = copyBtn.getAttribute('data-code')
    if (!encoded) return
    const code = typeof decodeURIComponent === 'function' ? decodeURIComponent(encoded) : encoded
    navigator.clipboard.writeText(code).then(() => {
      const originalText = copyBtn.innerText
      copyBtn.innerText = '已复制'
      setTimeout(() => { copyBtn.innerText = originalText }, 1000)
    }).catch(() => {
      const originalText = copyBtn.innerText
      copyBtn.innerText = '复制失败'
      setTimeout(() => { copyBtn.innerText = originalText }, 1000)
    })
    return
  }

  // 展开收起
  const expandBtn = e.target.closest('.expand-btn')
  if (expandBtn) {
    const wrapper = expandBtn.closest('.code-block-wrapper')
    if (!wrapper) return
    const pre = wrapper.querySelector('pre')
      const wasCollapsed = wrapper.classList.contains('collapsed')
      wrapper.classList.toggle('collapsed')
      const isCollapsedNow = wrapper.classList.contains('collapsed')
      wrapper.setAttribute('aria-expanded', isCollapsedNow ? 'false' : 'true')
      if (!isCollapsedNow) {
        expandBtn.style.display = 'none'
        pre.style.maxHeight = ''
      } else {
      const codeElem = pre.querySelector('code')
      const lh = parseFloat(window.getComputedStyle(codeElem).lineHeight) || 18
      const height = Math.ceil(lh * 20)
      pre.style.maxHeight = `${height}px`
        expandBtn.style.display = ''
    }
    return
  }
}

// 设置折叠高度
function setCollapsedHeights() {
  if (typeof document === 'undefined') return
  
  document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
    const pre = wrapper.querySelector('pre')
    const code = pre.querySelector('code')
    const lineHeight = parseFloat(getComputedStyle(code).lineHeight) || 18
    const collapsedHeight = Math.ceil(lineHeight * 20)

    pre.style.setProperty('--collapsed-height', `${collapsedHeight}px`)

    const btn = wrapper.querySelector('.expand-btn')
    const isCollapsed = wrapper.classList.contains('collapsed')

    if (isCollapsed) {
      pre.style.maxHeight = `${collapsedHeight}px`
      if (btn) btn.style.display = ''
    } else {
      pre.style.maxHeight = ''
      if (btn) btn.style.display = 'none'
    }
  })

  attachExpandBtnHandlers()
}

function attachExpandBtnHandlers() {
  if (typeof document === 'undefined') return
  const expandBtns = document.querySelectorAll('.expand-btn')
  expandBtns.forEach(btn => {
    if (btn.dataset._expandBound) return
    const handler = function (e) {
      e.stopPropagation()
      const wrapper = btn.closest('.code-block-wrapper')
      if (!wrapper) return
      const pre = wrapper.querySelector('pre')
      wrapper.classList.toggle('collapsed')
      const isCollapsedNow = wrapper.classList.contains('collapsed')
      wrapper.setAttribute('aria-expanded', isCollapsedNow ? 'false' : 'true')
      if (!isCollapsedNow) {
        btn.style.display = 'none'
        pre.style.maxHeight = ''
      } else {
        const codeElem = pre.querySelector('code')
        const lh = parseFloat(window.getComputedStyle(codeElem).lineHeight) || 18
        const height = Math.ceil(lh * 20)
        pre.style.maxHeight = `${height}px`
        btn.style.display = ''
      }
    }
    btn.addEventListener('click', handler)
    btn.dataset._expandBound = '1'
    btn._expandHandler = handler
  })
}

function detachExpandBtnHandlers() {
  if (typeof document === 'undefined') return
  const expandBtns = document.querySelectorAll('.expand-btn')
  expandBtns.forEach(btn => {
    if (!btn.dataset._expandBound) return
    if (btn._expandHandler) btn.removeEventListener('click', btn._expandHandler)
    delete btn._expandHandler
    delete btn.dataset._expandBound
  })
}

// 链接添加 target="_blank" 和 rel="noopener noreferrer nofollow"
function enhanceLinks(html) {
  return html
    .replace(/<a(?![^>]*\btarget=)([^>]*)>/g, '<a target="_blank" rel="noopener noreferrer nofollow"$1>')
    .replace(/<a([^>]*)target=("[^"]*"|'[^']*'|[^\s>]*)/g, '<a$1target="_blank" rel="noopener noreferrer nofollow"')
}

// 解析文章
watch([rawPostData, error], async () => {
  if (notFound.value) {
    post.value = {
      content: '',
      frontmatter: {
        title: '文章未找到',
        description: '该文章不存在或已被删除。',
        tags: ['不存在','Not Found','404']
      },
      toc: []
    }
  } else {
    let html = marked(rawPostData.value.content)
    html = wrapImagesWithLinks(html)
    html = addFancyboxAttributesToAnchors(html)
    html = renderKatex(html)
    html = highlightCodeBlocks(html)
    html = enhanceLinks(html)

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

    applyClientEnhancements()
  }
}, { immediate: true })

// 监听内容变化
watch(() => post.value.content, () => applyClientEnhancements())

// 高亮 + Fancybox
function applyClientEnhancements() {
  if (!process.client) return
  nextTick(() => {
    requestAnimationFrame(() => {
      const codeBlocks = document.querySelectorAll('article pre code')
      if (codeBlocks.length) {
        codeBlocks.forEach(block => hljs.highlightElement(block))
      }
      // 初始化 Fancybox
      Fancybox.bind('[data-fancybox="gallery"]', {
        Hash: false,
      })
      // 计算折叠高度并初始化按钮文本
      setCollapsedHeights()
    })
  })
}

watch(
  () => post.value.content,
  () => {
    applyClientEnhancements()
  }
)

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
      { property: 'og:url', content: `${siteConfig.url}/posts/${route.params.slug}` },
      { name: 'twitter:title', content: `${title} | ${siteConfig.title}` },
      { name: 'twitter:description', content: description },
    ]
  }
})

// 页面挂载
let observer
onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  loadHighlightStyle(isDark.value)

  observer = new MutationObserver(() => {
    const darkNow = document.documentElement.classList.contains('dark')
    if (darkNow !== isDark.value) {
      isDark.value = darkNow
      loadHighlightStyle(darkNow)
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  document.addEventListener('click', onDocumentClick)

  attachExpandBtnHandlers()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('click', onDocumentClick)

  detachExpandBtnHandlers()
})

// 格式化日期
const formattedDate = computed(() => {
  if (!post.value.frontmatter.date) return ''
  return `${siteConfig.author.name} 发布于 ${dayjs(post.value.frontmatter.date).format('YYYY-MM-DD')}`
})

// 分享到微博
function shareToWeibo() {
  if (typeof window === 'undefined') return
  
  const title = post.value.frontmatter.title || '无标题文章'
  const url = `${siteConfig.url}/posts/${route.params.slug}`
  const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  
  // 计算屏幕中心位置
  const width = 600
  const height = 400
  const left = Math.round((window.screen.width - width) / 2)
  const top = Math.round((window.screen.height - height) / 2)
  
  window.open(
    shareUrl, 
    '_blank', 
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
  )
}

// 复制文章链接
async function copyArticleLink() {
  if (typeof window === 'undefined') return
  
  const url = `${siteConfig.url}/posts/${route.params.slug}`
  
  try {
    await navigator.clipboard.writeText(url)
    notification.show('本文链接已复制!')
  } catch (err) {
    console.error('复制失败:', err)
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    notification.show('本文链接已复制!')
  }
}
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
          <div>
            <Sidebar :toc="(post.toc && post.toc.length) ? post.toc : [{ id: 'no-toc', text: '暂无标题', tag: 'H2' }]" />
          </div>
          <div class="flex items-center justify-center py-20"></div>
        </div>
      </div>

      <div data-fade class="mt-16 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] relative hidden sm:block">
        <!-- 头像 -->
        <div class="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
          <a href="/about" class="block">
              <img
                :src="siteConfig.author.avatar"
                :alt="siteConfig.author.name"
                class="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.3)] fade-in-image"
                loading="lazy"
                onload="this.classList.add('onload-fade')"
              />
          </a>
        </div>
        
        <!-- 作者信息 -->
        <div class="pt-10 text-center">
          <div>
            <div class="font-bold text-2xl text-#2f3f5b dark:text-white mb-1">
              {{ siteConfig.author.name }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ siteConfig.author.description }}
            </div>
          </div>
          
          <!-- 文章信息 -->
          <div class="flex flex-wrap items-center justify-center gap-1 mt-4">
            <span class="post-copyright__original inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-300">
              原创
            </span>
            <div class="text-sm text-gray-600 dark:text-gray-300">
              <span class="text-#2f3f5b dark:text-white text-4">
                {{ post.frontmatter.title || '无标题文章' }}
              </span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-6">
            <!-- 打赏按钮 -->
            <div v-if="siteConfig.donate && siteConfig.donate.length > 0" class="relative">
              <button
                @mouseenter="showDonateQR = true"
                @mouseleave="showDonateQR = false"
                title="打赏作者"
                class="h-10 px-4 text-sm rounded-lg border-none text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300 cursor-pointer shadow-[0_0_2px_rgba(0,0,0,0.2)] flex items-center gap-1"
              >
                <i class="iconfont icon-dashang"></i> 打赏作者 
              </button>
              
              <!-- 打赏二维码浮层 -->
              <transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-2"
              >
                <div 
                  v-if="showDonateQR"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 z-50 p-4 mb-3 bg-#fefefe/95 dark:bg-#1a1a1a/95 rounded-lg 
                         shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                  @mouseenter="showDonateQR = true"
                  @mouseleave="showDonateQR = false"
                >
                <span class="text-md text-red-400 font-bold">
                  感谢您赐予我前进的力量！
                </span>
                <div class="text-center mt-3">
                  <div class="flex items-center justify-center gap-6">
                    <div
                      v-for="(method, index) in siteConfig.donate"
                      :key="index"
                      class="text-center"
                    >
                      <div class="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center">
                        <img
                          :src="method.qrCode"
                          :alt="`${method.name}打赏二维码`"
                          class="w-28 h-28 fade-in-image"
                          loading="lazy"
                          onload="this.classList.add('onload-fade')"
                        />
                      </div>
                      <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">{{ method.name }}</div>
                    </div>
                  </div>
                </div>
                </div>
              </transition>
            </div>

            <!-- 手机访问按钮 -->
            <div class="relative">
              <button
                @mouseenter="showMobileQR = true"
                @mouseleave="showMobileQR = false"
                title="使用手机访问这篇文章"
                class="w-10 h-10 rounded-lg border-none text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_2px_rgba(0,0,0,0.2)]"
              >
                <i class="iconfont icon-erweima"></i>
              </button>
              
              <!-- 二维码浮层 -->
              <transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-2"
              >
                <div 
                  v-if="showMobileQR"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 z-50 p-4 mb-3 bg-#fefefe/95 dark:bg-#1a1a1a/95 rounded-lg 
                         shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)]"
                  @mouseenter="showMobileQR = true"
                  @mouseleave="showMobileQR = false"
                >
                <div class="text-center">
                  <div class="w-32 h-32 bg-white rounded-lg p-2 flex items-center justify-center">
                    <img
                      :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(siteConfig.url + '/posts/' + route.params.slug)}`"
                      alt="文章二维码"
                      class="w-28 h-28 fade-in-image"
                      loading="lazy"
                      onload="this.classList.add('onload-fade')"
                    />
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">使用手机扫码查看</div>
                </div>
                </div>
              </transition>
            </div>

            <button
              title="分享本文到微博"
              @click="shareToWeibo"
              class="w-10 h-10 rounded-lg border-none text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_2px_rgba(0,0,0,0.2)]"
            >
              <i class="iconfont icon-xinlangweibo"></i>
            </button>
            
            <button
              title="复制本文链接"
              @click="copyArticleLink"
              class="w-10 h-10 rounded-lg border-none text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_2px_rgba(0,0,0,0.2)]"
            >
              <i class="iconfont icon-link"></i>
            </button>
          </div>

          <!-- 版权提示 -->
          <div class="text-xs text-gray-500 dark:text-gray-400 p-3">
            本文采用 
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/" 
              target="_blank" rel="noopener noreferrer" 
              class="text-gray-500 dark:text-gray-400 hover:text-blue-400 transition-colors"
            >
              CC BY-NC-SA 4.0
            </a>
            许可协议进行许可，转载请注明出处，禁止商业使用！
          </div>
        </div>
      </div>

      <div data-fade>
        <Comment />
      </div>
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

/* 代码块折叠样式 */
.code-block-wrapper {
  position: relative;
  overflow: visible;
  margin: 1rem 0;
}

.code-block-wrapper pre {
  margin: 0;
  overflow: auto;
  overflow-x: auto;
  overflow-y: hidden;
  transition: max-height 0.5s ease, box-shadow 0.5s ease;
  --collapsed-height: 260px; /* 折叠高度 */
  --expanded-height: 2000px; /* 允许展开的最大高度 */
}

.code-block-wrapper.collapsed pre {
  overflow: hidden;
  max-height: var(--collapsed-height);
}

.code-block-wrapper:not(.collapsed) pre {
  max-height: var(--expanded-height);
}

.code-block-wrapper .fold-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20rem;
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
  pointer-events: none;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.code-block-wrapper[aria-expanded="true"] .fold-overlay {
  display: none;
}

.dark .code-block-wrapper .fold-overlay {
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgb(26, 26, 26) 100%);
}

.code-block-wrapper .copy-btn {
  z-index: 20;
}
</style>