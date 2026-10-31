<template>
  <main v-fade-in>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <!-- 标题 -->
      <h1 data-fade class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">说说</span>
      </h1>
      <p data-fade class="mt-2 text-ink-muted transition-colors duration-base">
        随时随地，分享生活。
      </p>

      <!-- Masonry 容器 -->
      <ul ref="masonryContainer" class="mt-8 list-none">
        <li data-fade
          v-for="talk in talks"
          :key="talk.id"
          class="card-base break-inside-avoid mb-5 px-4 pt-4 pb-2 bg-surface transition-colors duration-base"
        >
          <div class="text-ink text-base whitespace-pre-line leading-relaxed">
            <!-- 内容 -->
            <span v-html="renderContent(talk)"></span>

            <!-- 图片 -->
            <div v-if="talk.imgs?.length" class="flex flex-wrap gap-4 mt-3">
              <a
                v-for="(img, idx) in getImgBlocks(talk)"
                :key="idx"
                :href="img.url"
                :data-fancybox="`gallery-${talk.id}`"
              >
                <img
                  :src="img.url"
                  :alt="img.alt"
                  class="w-16 h-16 object-cover rounded-lg cursor-pointer shadow-[0_0_8px_0_rgba(0,0,0,0.2)] fade-in-image"
                  loading="lazy"
                />
              </a>
            </div>
          </div>

          <!-- 分割线 -->
          <hr class="mt-3 border-dashed border-t border-line" />

          <div class="flex justify-between text-ink-subtle text-xs flex-wrap gap-y-2 mt-2">
            <div class="flex items-center gap-1.5">
              <!-- 时间 -->
              <span class="flex items-center px-1.5 py-1 rounded-full bg-surface-4 text-ink-muted">
                <AppIcon name="clock" /><span class="ml-0.5">{{ formatDate(talk.created_at) }}</span>
              </span>
              <!-- 位置 -->
              <span v-if="talk.location?.length" class="flex items-center px-1.5 py-1 rounded-full bg-surface-4 text-ink-muted">
                <AppIcon name="map-pin" /><span class="ml-0.5">{{ talk.location }}</span>
              </span>
              <!-- 链接 -->
              <div v-if="talk.links?.length" class="flex items-center px-1.5 py-1 rounded-full bg-red-300/20 transition-colors duration-base">
                <a
                  v-for="(link, idx) in talk.links"
                  :key="idx"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  class="text-#f56c6c no-underline hover:opacity-60 [will-change:opacity] px-0.5 transition-opacity duration-base"
                >
                  <AppIcon name="link" class="text-12px" /><span class="ml-1">{{ link.text }}</span>
                </a>
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(tag, idx) in talk.tags"
                :key="idx"
                class="flex items-center px-1.5 py-1 rounded-full bg-surface-4 text-ink-muted"
              >
                <span>{{ tag }}</span>
              </span>
            </div>
          </div>
          
        </li>
      </ul>

      <!-- 加载更多 -->
      <div v-if="!finished" data-fade class="mt-4 flex justify-center">
        <button
          class="px-4 py-2 bg-surface-2 text-ink-muted hover:text-ink hover:opacity-70 rounded-full transition-all duration-base cursor-pointer border border-line shadow-xs hover:shadow-md hover:border-accent-line border-none"
          :disabled="loading"
          @click="fetchTalks"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>

      <div data-fade>
        <Comment />
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import Comment from '@/components/Comment.vue'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

usePageMeta('说说', `${siteConfig.description}`, '/talks', '说说,talks')

dayjs.extend(utc)
dayjs.extend(timezone)
const formatDate = (date) => dayjs(date).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm')

const masonryContainer = ref(null)
let macyInstance = null

async function initMasonry() {
  if (typeof window === 'undefined' || !masonryContainer.value) return
  const Macy = (await import('macy')).default
  if (macyInstance) {
    macyInstance.reInit()
  } else {
    macyInstance = Macy({
      container: masonryContainer.value,
      trueOrder: false,
      waitForImages: true,
      margin: 14,
      columns: 2,
      breakAt: { 820: 1 },
    })
  }
}

const talks = ref([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)

const TALKS_API = `${siteConfig.apiUrl}/api/talks`

const { data: initialData } = await useAsyncData('talks', async () => {
  try {
    return await $fetch(`${TALKS_API}?page=1&pageSize=${pageSize}`)
  } catch (e) {
    console.error('Fetch talks failed', e)
    return { data: [], totalPages: 0 }
  }
}, {
  server: true,
  default: () => ({ data: [], totalPages: 0 })
})

talks.value = initialData.value.data || []
if (initialData.value.totalPages <= 1) finished.value = true

async function fetchTalks() {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    const res = await $fetch(`${TALKS_API}?page=${page.value + 1}&pageSize=${pageSize}`)
    talks.value.push(...(res.data || []))
    page.value++
    if (page.value >= res.totalPages) finished.value = true
    nextTick().then(() => initMasonry())
  } catch (e) {
    console.error('Fetch talks failed', e)
  } finally {
    loading.value = false
  }
}

// 转义 HTML 防止 XSS
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getImgBlocks(talk) {
  if (!talk.content) return []
  const matches = [...talk.content.matchAll(/<talkImg>(.*?)<\/talkImg>/g)]
  return matches.map(match => {
    const alt = match[1]
    const imgObj = talk.imgs.find(i => i.alt === alt)
    return imgObj || { url: '', alt }
  })
}

function renderContent(talk) {
  let html = talk.content

  // 图片/链接占位标签由 getImgBlocks / talk.links 单独渲染，正文里要移除
  html = html.replace(/\n*<talkImg>.*?<\/talkImg>/g, '')
  html = html.replace(/\n*<talkLink>.*?<\/talkLink>/g, '')

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    lang = lang || 'text';
    return `<pre class="my-1 bg-surface-4 border border-line rounded-lg p-3 text-sm font-mono text-ink overflow-x-auto" style="white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;"><code>${escapeHtml(code)}</code></pre>`
  })

  // 任务列表 整块匹配连续的 `- [ ] / - [x]` 行，转成禁用的 checkbox
  let taskIdCounter = 1;
  html = html.replace(
    /((?:- \[(?: |x)\] .+\n?)+)/g,
    (match) => {
      const items = match.trim().split('\n').map(line => {
        const [, status, task] = /- \[( |x)\] (.+)/.exec(line)
        const checked = status === 'x' ? 'checked' : ''
        const id = `task-${talk.id}-${taskIdCounter++}`
        return `<li class="flex items-center gap-1"><label for="${id}" class="leading-snug flex items-center"><input id="${id}" type="checkbox" class="custom-checkbox mr-1 mt-0.5" disabled ${checked} /><span ${checked ? 'class="line-through opacity-70"' : ''}>${task}</span></label></li>`
      }).join('')
      return `<ul class="list-none my-1">${items}</ul>`
    }
  )

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')

  return html
}

onMounted(() => {
  nextTick().then(() => initMasonry())
  Fancybox.bind('[data-fancybox]', { Hash: false })
})
</script>

<style>
/* 隐藏浏览器默认勾 */
.custom-checkbox {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--line-strong);
  border-radius: var(--radius-xs);
  background-color: transparent;
  position: relative;
}

/* 选中状态 */
.custom-checkbox:checked {
  background-color: var(--accent);
  border-color: var(--accent);
}

/* 勾 */
.custom-checkbox:checked::after {
  content: "✔";
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-size: 12px;
  line-height: 1;
}
</style>