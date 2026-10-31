<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, useHead, useRoute, setResponseStatus } from '#imports'
import { useNotification } from '~/composables/useNotification'
import { useShareDialog } from '~/composables/useShareDialog'
import { useUmami } from '~/composables/useUmami'
import { marked } from 'marked'
import dayjs from 'dayjs'

import Comment from '@/components/Comment.vue'
import Sidebar from '@/components/Sidebar.vue'
import '@/assets/article-content.css'
import '@/assets/hljs-themes.css'
import 'katex/dist/katex.min.css'

import { decodeHtmlEntities, highlightToHtml, normalizeLanguage } from '@/utils/highlight'
import { getIcon } from '@/utils/icons'
import { canonicalD, createMorph } from 'morphicons/dom'
import { siteConfig } from '@/siteConfig/main.js'

const route = useRoute()
const notification = useNotification()
const shareDialog = useShareDialog()
const { getStats } = useUmami()

// 按需加载 KaTeX
let katex = null
await import('katex').then((mod) => { katex = mod.default })

// Twikoo 评论系统
const twikooEnvId = siteConfig.thirdParty?.twikoo?.envId || ''

// 访问量和评论数，null 表示加载中，失败显示 '--'
const commentCount = ref(null)
const postPageviews = ref(null)

// 二维码浮层控制
const showDonateQR = ref(false)
const showMobileQR = ref(false)

// 阅读时长记录
const readingDuration = ref(0)
let readingTimer = null
let isPageVisible = true
let visibilityChangeHandler = null
let beforeUnloadHandler = null
let twikooPollTimer = null
let twikooPollResolve = null

// 获取文章
const { data: rawPostData, error } = await useAsyncData(
  `post-${route.params.slug}`,
  () => $fetch(`${siteConfig.apiUrl}/api/articles/${route.params.slug}`),
  { server: true }
)

const notFound = computed(() => error.value || !rawPostData.value?.success)

// 解析响应数据
if (import.meta.server) {
  const apiStatus = error.value?.statusCode ?? error.value?.status
  if (apiStatus) {
    setResponseStatus(apiStatus)
  } else if (rawPostData.value && !rawPostData.value.success) {
    setResponseStatus(404)
  }
}

const post = ref({
  content: '',
  frontmatter: {},
  toc: []
})

const articleRef = ref(null)


// 代码高亮处理
function highlightCodeBlocks(html) {
  return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_, attrs, escaped) => {
    const langMatch = attrs.match(/\blang(?:uage)?-([^\s"']+)/i)
    const language = normalizeLanguage(langMatch?.[1])
    const code = decodeHtmlEntities(escaped)
    const lines = code.split('\n').length
    const isCollapsed = lines > 20
    const highlighted = highlightToHtml(code, language)
    const encodedCode = encodeURIComponent(code)
    return `
        <div class="code-block-wrapper group relative ${isCollapsed ? 'collapsed' : ''}" data-lines="${lines}" aria-expanded="${isCollapsed ? 'false' : 'true'}">
          <button
            type="button"
            class="copy-btn appearance-none absolute top-2 right-2 z-20 w-7 h-7 rounded-lg border border-line bg-code-chip text-ink-muted shadow-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-accent-line hover:shadow-md cursor-pointer"
            data-code="${encodedCode}"
            aria-label="复制代码"
            title="复制代码"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${canonicalD(getIcon('copy'))}"/></svg>
          </button>
          <pre><code class="hljs language-${language}">${highlighted}</code></pre>
          ${isCollapsed ? `
          <div class="fold-overlay pointer-events-none absolute left-0 right-0 bottom-0 h-20"></div>
          <button class="expand-btn appearance-none absolute left-1/2 -translate-x-1/2 bottom-5 px-3 py-2 text-xs rounded-lg border border-line bg-code-chip text-ink-muted shadow-sm transition-colors duration-base hover:border-accent-line hover:shadow-md hover:text-ink cursor-pointer z-10">展开剩余代码</button>
          ` : ''}
        </div>
      `;
  });
}

// KaTeX 渲染
function renderKatex(html) {
  const codeSegments = []
  html = html.replace(/<pre><code[\s\S]*?<\/code><\/pre>|<code>[\s\S]*?<\/code>/g, match => {
    codeSegments.push(match)
    return `___CODE_SEGMENT_${codeSegments.length - 1}___`
  })
  html = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    try { return katex.renderToString(expr, { displayMode: true, throwOnError: false }) }
    catch { return `<span class="katex-error">$$${expr}$$</span>` }
  })
  html = html.replace(/\\\$|\$([^\s$](?:[^$\n]*?[^\s$])?)\$/g, (_, expr) => {
    if (expr === undefined) return '$'
    try { return katex.renderToString(expr, { displayMode: false, throwOnError: false }) }
    catch { return `<span class="katex-error">$${expr}$</span>` }
  })
  html = html.replace(/___CODE_SEGMENT_(\d+)___/g, (_, index) => codeSegments[index])
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

// 复制文本
async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const input = document.createElement('input')
      input.value = text
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(input)
      return ok
    } catch {
      return false
    }
  }
}

// 代码块复制按钮点击处理
function onDocumentClick(e) {
  const copyBtn = e.target.closest('.copy-btn')
  if (!copyBtn) return
  if (copyBtn.dataset.copying === '1') return
  const encoded = copyBtn.getAttribute('data-code')
  if (!encoded) return
  let code = encoded
  try {
    code = decodeURIComponent(encoded)
  } catch {}
  // 反馈期间锁定按钮，禁止重复点击
  copyBtn.dataset.copying = '1'
  copyBtn.disabled = true
  copyTextToClipboard(code).then(success => {
    notification.show(success ? '代码已复制!' : '复制失败!', success ? 'info' : 'error')
    if (success) {
      copyBtn.classList.add('is-copied')
      copyBtn._morph?.morphTo(getIcon('check'))
    }
    setTimeout(() => {
      copyBtn.classList.remove('is-copied')
      copyBtn._morph?.morphTo(getIcon('copy'))
      copyBtn.disabled = false
      delete copyBtn.dataset.copying
    }, 1000)
  })
}

// 设置折叠高度
function setCollapsedHeights() {
  if (!articleRef.value) return

  articleRef.value.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
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
  if (!articleRef.value) return
  articleRef.value.querySelectorAll('.expand-btn').forEach(btn => {
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
        pre.style.maxHeight = `${pre.scrollHeight + 1}px`
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
  if (!articleRef.value) return
  articleRef.value.querySelectorAll('.expand-btn').forEach(btn => {
    if (!btn.dataset._expandBound) return
    if (btn._expandHandler) btn.removeEventListener('click', btn._expandHandler)
    delete btn._expandHandler
    delete btn.dataset._expandBound
  })
}

// 链接添加 target="_blank" 和 rel="noopener noreferrer nofollow"
function enhanceLinks(html) {
  return html.replace(/<a\b([^>]*)>/g, (match, attrs) => {
    let newAttrs = attrs
    if (!/\btarget\s*=/.test(attrs)) {
      newAttrs = ` target="_blank" rel="noopener noreferrer nofollow"${newAttrs}`
    }
    if (!/\brel\s*=/.test(attrs)) {
      newAttrs = `${newAttrs} rel="noopener noreferrer nofollow"`
    }
    return `<a${newAttrs}>`
  })
}

// 解析文章
watch([rawPostData, error], () => {
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
    html = shareDialog.replaceShareLinks(html)

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

// 监听内容变化
watch(() => post.value.content, () => applyClientEnhancements(), { immediate: true })

// 把 SSR 直出的复制按钮 SVG 懒升级成 morphicons 驱动的形变实例
function upgradeCopyButtons() {
  articleRef.value?.querySelectorAll('.copy-btn').forEach(btn => {
    if (btn._morph) return
    const path = btn.querySelector('svg path')
    if (!path) return
    btn._morph = createMorph(path, getIcon('copy'), { strokeWidth: 2.4 })
  })
}

function killCopyButtonMorphs() {
  articleRef.value?.querySelectorAll('.copy-btn').forEach(btn => {
    btn._morph?.destroy()
    delete btn._morph
  })
}

// Fancybox + 折叠高度
function applyClientEnhancements(retries = 0) {
  if (!import.meta.client || !post.value.content) return
  nextTick(() => {
    requestAnimationFrame(async () => {
      const root = articleRef.value
      if (!root) {
        if (retries < 5) applyClientEnhancements(retries + 1)
        return
      }
      // 初始化 Fancybox
      const { Fancybox } = await import('@fancyapps/ui/dist/fancybox/')
      try { await import('@fancyapps/ui/dist/fancybox/fancybox.css') } catch { /* CSS 注入失败可忽略 */ }
      Fancybox.unbind('[data-fancybox="gallery"]')
      Fancybox.bind('[data-fancybox="gallery"]', {
        Hash: false,
      })
      // 计算折叠高度并初始化按钮文本
      setCollapsedHeights()
      upgradeCopyButtons()
    })
  })
}

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
onMounted(() => {
  document.addEventListener('click', onDocumentClick)

  attachExpandBtnHandlers()

  // 加载缓存的阅读时长
  readingDuration.value = getStoredReadingDuration()

  // 获取文章统计信息
  getArticleStats()
  getPostPageviews()

  // 监听页面可见性变化
  visibilityChangeHandler = () => {
    if (document.hidden) {
      // 页面隐藏时停止计时并保存
      isPageVisible = false
      if (readingTimer) {
        clearInterval(readingTimer)
        readingTimer = null
      }
      saveReadingDuration(readingDuration.value)
    } else {
      // 页面显示时重新开始计时
      isPageVisible = true
      if (!readingTimer) {
        readingTimer = setInterval(() => {
          if (isPageVisible) readingDuration.value++
        }, 1000)
      }
    }
  }
  document.addEventListener('visibilitychange', visibilityChangeHandler)

  // 启动阅读时长计时器
  readingTimer = setInterval(() => {
    if (isPageVisible) readingDuration.value++
  }, 1000)

  // 页面卸载前保存
  beforeUnloadHandler = () => {
    if (readingTimer) {
      clearInterval(readingTimer)
      readingTimer = null
    }
    saveReadingDuration(readingDuration.value)
  }
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)

  detachExpandBtnHandlers()

  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
    visibilityChangeHandler = null
  }

  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
    beforeUnloadHandler = null
  }

  // 清理 Twikoo 轮询
  stopTwikooPoll()

  // 保存最后的阅读时长
  if (readingTimer) {
    clearInterval(readingTimer)
    readingTimer = null
  }
  saveReadingDuration(readingDuration.value)

  // 解绑 Fancybox
  import('@fancyapps/ui/dist/fancybox/').then(({ Fancybox }) => {
    Fancybox.unbind('[data-fancybox="gallery"]')
    Fancybox.close()
  }).catch(() => {})

  // 销毁复制按钮的形变驱动
  killCopyButtonMorphs()

  // 清理复制链接按钮的复位计时器
  if (copyLinkTimer) clearTimeout(copyLinkTimer)
})

// 格式化日期
const formattedDate = computed(() => {
  const date = post.value.frontmatter.date
  if (!date || !dayjs(date).isValid()) return ''
  return `${siteConfig.author.name} 发布于 ${dayjs(date).format('YYYY-MM-DD')}`
})

const updatedDate = computed(() => {
  const updated = post.value.frontmatter.updated
  if (!updated || updated === post.value.frontmatter.date || !dayjs(updated).isValid()) return ''
  return dayjs(updated).format('YYYY-MM-DD')
})

const formattedUpdatedDate = computed(() => {
  if (!updatedDate.value) return ''
  return `最后更新于 ${updatedDate.value}`
})

// 计算文章字数
const wordCount = computed(() => {
  const text = post.value.content
    .replace(/<pre>[\s\S]*?<\/pre>/g, '')
    .replace(/<button[\s\S]*?<\/button>/g, '')
    .replace(/<span class="katex-mathml">[\s\S]*?<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, '')
  return text.length
})

// 格式化字数显示
const formattedWordCount = computed(() => {
  const count = wordCount.value
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
})

// 计算预计阅读时间（按中文平均每分钟400字计算）
const readingTime = computed(() => {
  const words = wordCount.value
  const minutes = Math.ceil(words / 400)
  return minutes
})

// 从缓存获取阅读时长
function getStoredReadingDuration() {
  if (typeof window === 'undefined') return 0
  try {
    const stored = localStorage.getItem('blog_reading_durations')
    if (!stored) return 0
    const durations = JSON.parse(stored)
    return durations[route.params.slug] || 0
  } catch {
    return 0
  }
}

// 保存阅读时长到缓存
function saveReadingDuration(duration) {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem('blog_reading_durations')
    const durations = stored ? JSON.parse(stored) : {}
    durations[route.params.slug] = duration
    localStorage.setItem('blog_reading_durations', JSON.stringify(durations))
  } catch {}
}

// 格式化显示阅读时长
const formattedReadingDuration = computed(() => {
  const totalSeconds = readingDuration.value
  const minutes = Math.floor(totalSeconds / 60)

  if (minutes > 60) {
    return '超过1小时'
  }
  if (minutes === 0) {
    return '小于1分钟'
  }
  return `${minutes}分钟`
})

// 停止轮询并释放挂起的 Promise
function stopTwikooPoll(resolved = false) {
  if (twikooPollTimer) {
    clearInterval(twikooPollTimer)
    twikooPollTimer = null
  }
  if (twikooPollResolve) {
    const resolver = twikooPollResolve
    twikooPollResolve = null
    resolver(resolved)
  }
}

// 等待 Twikoo 加载
function waitForTwikoo(timeout = 10000) {
  if (typeof window.twikoo !== 'undefined') return Promise.resolve(true)
  return new Promise(resolve => {
    const startTime = Date.now()
    twikooPollResolve = resolve
    twikooPollTimer = setInterval(() => {
      if (typeof window.twikoo !== 'undefined') {
        stopTwikooPoll(true)
      } else if (Date.now() - startTime >= timeout) {
        stopTwikooPoll(false)
      }
    }, 100)
  })
}

// 获取文章评论数
async function getArticleStats() {
  if (typeof window === 'undefined' || !twikooEnvId) return

  const articleUrl = `/posts/${route.params.slug}`

  const ready = await waitForTwikoo()
  if (!ready) {
    commentCount.value = '--'
    return
  }

  try {
    // 获取评论数
    const commentRes = await window.twikoo.getCommentsCount({
      envId: twikooEnvId,
      urls: [articleUrl],
      includeReply: true
    })
    commentCount.value = commentRes?.[0]?.count ?? 0
  } catch (err) {
    console.error('获取评论数失败:', err)
    commentCount.value = '--'
  }
}

// 获取文章访问量
async function getPostPageviews() {
  const stats = await getStats('total', `/posts/${route.params.slug}`)
  postPageviews.value = stats ? stats.pageviews : '--'
}

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

// 复制文章链接按钮状态
const copyLinkBtn = ref(null)
const copyLinkIconName = ref('link')
const copyLinkCopied = ref(false)
let copyLinkTimer = null

// 复制文章链接
async function copyArticleLink() {
  if (typeof window === 'undefined') return

  const btn = copyLinkBtn.value
  if (!btn || btn.disabled) return
  btn.disabled = true
  if (copyLinkTimer) clearTimeout(copyLinkTimer)

  const url = `${siteConfig.url}/posts/${route.params.slug}`

  const success = await copyTextToClipboard(url)
  notification.show(success ? '本文链接已复制!' : '复制失败, 请手动复制链接')
  copyLinkCopied.value = success
  copyLinkIconName.value = success ? 'check' : 'link'

  // 反馈期间锁定按钮，复制成功后复位
  copyLinkTimer = setTimeout(() => {
    copyLinkCopied.value = false
    copyLinkIconName.value = 'link'
    btn.disabled = false
  }, 1000)
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
      <h1 data-fade class="mt-8 text-3xl sm:text-5xl font-display font-semibold tracking-tight text-ink">未找到文章!</h1>
      <div data-fade class="mt-10 flex flex-row items-center justify-center gap-4">
        <BackLink to="/posts" text="← 返回列表" />
      </div>
    </div>

    <div v-else>
      <div class="py-6">
        <h1 data-fade class="text-3xl mt-40 font-display leading-tight tracking-tight text-balance">
          <span class="text-gradient">{{ post.frontmatter.title || '无标题文章' }}</span>
        </h1>
        <div data-fade class="text-sm text-ink-muted mt-4 pb-4 flex flex-col gap-2 transition-colors duration-base" style="border-bottom: 2px solid rgba(153, 153, 153, 0.4);">
          <div class="flex flex-wrap items-center gap-3 !hidden sm:!flex">
            <span class="flex items-center">
              <AppIcon name="words" />
              字数总计: {{ formattedWordCount }}
            </span>
            <span class="flex items-center">
              <AppIcon name="clock" />
              预计需要: {{ readingTime }}分钟
            </span>
            <span class="flex items-center">
              <AppIcon name="eye" />
              阅读时长: {{ formattedReadingDuration }}
            </span>
            <span class="flex items-center">
              <AppIcon name="comment" />
              评论数:
              <span v-if="commentCount === null" class="ml-1 w-5 h-3.5 rounded skeleton"></span>
              <span v-else class="ml-0.8">{{ commentCount }}</span>
            </span>
            <span class="flex items-center">
              <AppIcon name="flame" />
              访问量:
              <span v-if="postPageviews === null" class="ml-1 w-5 h-3.5 rounded skeleton"></span>
              <span v-else class="ml-0.8">{{ postPageviews }}</span>
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="flex items-center">
              <AppIcon name="calendar" />
              {{ formattedDate }}
            </span>
            <span v-if="formattedUpdatedDate" class="flex items-center">
              <AppIcon name="history" />
              {{ formattedUpdatedDate }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span v-for="tag in post.frontmatter.tags || []" :key="tag" class="px-2 py-1 text-xs rounded-full bg-surface-2 text-ink-muted hover:text-ink transition-colors duration-base">{{ tag }}</span>
          </div>
        </div>
      </div>

      <div class="flex lg:gap-8 px-2 flex-col md:flex-row max-w-full">
        <section data-fade class=" flex-1 min-w-0 max-w-full">
          <article ref="articleRef" v-html="post.content" class="article-content whitespace-normal break-words"></article>
        </section>
        <div data-fade class="sticky top-30 flex-shrink-0 hidden md:block self-start">
          <div>
            <Sidebar :toc="post.toc || []" />
          </div>
          <div class="flex items-center justify-center py-20"></div>
        </div>
      </div>

      <div data-fade class="mt-16 rounded-lg bg-surface shadow-xs relative hidden sm:block border border-line">
        <!-- 头像 -->
        <div class="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
          <a href="/about" class="block">
              <img
                :src="siteConfig.author.avatar"
                :alt="siteConfig.author.name"
                class="w-16 h-16 rounded-full object-cover border-0 shadow-[0_0_10px_rgba(0,0,0,0.15)] fade-in-image"
                loading="lazy"
              />
          </a>
        </div>
        
        <!-- 作者信息 -->
        <div class="pt-10 text-center">
          <div>
            <div class="font-display text-2xl font-semibold text-ink mb-1">
              {{ siteConfig.author.name }}
            </div>
            <div class="text-sm text-ink-subtle">
              {{ siteConfig.author.description }}
            </div>
          </div>
          
          <!-- 文章信息 -->
          <div class="flex flex-wrap items-center justify-center gap-1 mt-4">
            <span class="post-copyright__original inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-300">
              原创
            </span>
            <div class="text-sm text-ink-muted">
              <span class="text-ink text-4">
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
                class="appearance-none h-10 px-4 text-sm rounded-lg border border-line bg-surface-4 text-ink-muted hover:border-accent-line hover:shadow-md transition-colors duration-base cursor-pointer flex items-center gap-1"
              >
                <AppIcon name="donate" /> 打赏作者 
              </button>
              
              <!-- 打赏二维码浮层 -->
              <transition
                enter-active-class="transition-all duration-base ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-fast ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-2"
              >
                <div 
                  v-if="showDonateQR"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 z-50 p-4 mb-3 border border-line bg-overlay rounded-lg
                         shadow-lg"
                  @mouseenter="showDonateQR = true"
                  @mouseleave="showDonateQR = false"
                >
                <span class="text-base text-danger font-bold">
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
                        />
                      </div>
                      <div class="text-xs text-ink-muted mt-2">{{ method.name }}</div>
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
                class="appearance-none w-10 h-10 rounded-lg border border-line bg-surface-4 text-ink-muted hover:border-accent-line hover:shadow-md transition-colors duration-base flex items-center justify-center cursor-pointer"
              >
                <AppIcon name="qr-code" />
              </button>
              
              <!-- 二维码浮层 -->
              <transition
                enter-active-class="transition-all duration-base ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-2"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition-all duration-fast ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-2"
              >
                <div 
                  v-if="showMobileQR"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 z-50 p-4 mb-3 border border-line bg-overlay rounded-lg
                         shadow-lg"
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
                    />
                  </div>
                  <div class="text-xs text-ink-muted mt-2">使用手机扫码查看</div>
                </div>
                </div>
              </transition>
            </div>

            <button
              title="分享本文到微博"
              @click="shareToWeibo"
              class="appearance-none w-10 h-10 rounded-lg border border-line bg-surface-4 text-ink-muted hover:border-accent-line hover:shadow-md transition-colors duration-base flex items-center justify-center cursor-pointer"
            >
              <AppIcon name="share" />
            </button>
            
            <button
              ref="copyLinkBtn"
              title="复制本文链接"
              @click="copyArticleLink"
              :class="{ 'is-copied': copyLinkCopied }"
              class="copy-link-btn appearance-none w-10 h-10 rounded-lg border border-line bg-surface-4 text-ink-muted hover:border-accent-line hover:shadow-md transition-colors duration-base flex items-center justify-center cursor-pointer"
            >
              <AppIcon :name="copyLinkIconName" />
            </button>
          </div>

          <!-- 版权提示 -->
          <div class="text-xs text-ink-subtle p-3">
            本文采用 
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/" 
              target="_blank" rel="noopener noreferrer" 
              class="text-ink-subtle hover:text-accent-text transition-colors duration-base"
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

    <ShareDialog />
  </main>
</template>

<style>
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
}

.code-block-wrapper.collapsed pre {
  overflow: hidden;
  max-height: var(--collapsed-height);
}

.code-block-wrapper:not(.collapsed) pre {
  max-height: none;
  overflow-y: auto;
}

.code-block-wrapper .fold-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 20rem;
  background: linear-gradient(
    180deg,
    color-mix(in oklch, var(--surface-4) 0%, transparent) 0%,
    var(--surface-4) 100%
  );
  pointer-events: none;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.code-block-wrapper[aria-expanded="true"] .fold-overlay {
  display: none;
}

/* 复制本文链接按钮 */
.copy-link-btn.is-copied {
  color: var(--accent-text);
  border-color: var(--accent-line);
}
</style>