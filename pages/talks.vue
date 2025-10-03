<template>
  <main v-fade-in>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <!-- 标题 -->
      <h1 data-fade class="text-3xl mt-40">
        <span class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient">
          Talks
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-#00e699/50 to-#00e2d8/50
                  dark:hidden transition-colors duration-300"
          ></span>
        </span>
      </h1>
      <p data-fade class="mt-2 text-#2f3f5b dark:text-gray-300 transition-colors duration-300">
        Share my life anytime, anywhere.
      </p>

      <!-- Masonry 容器 -->
      <ul ref="masonryContainer" class="mt-8 list-none">
        <li data-fade
          v-for="talk in talks"
          :key="talk.id"
          class="break-inside-avoid mb-5 rounded-xl px-4 pt-4 pb-2 bg-white dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] transition-color duration-300"
        >
          <div class="text-#2f3f5b dark:text-white text-base whitespace-pre-line leading-relaxed">
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
                  class="w-16 h-16 object-cover rounded-lg cursor-pointer shadow-[0_0_8px_0_rgba(0,0,0,0.2)]"
                />
              </a>
            </div>
          </div>

          <!-- 分割线 -->
          <hr class="mt-3 border-dashed border-t border-gray-300 dark:border-gray-600" />

          <div class="flex justify-between text-gray-400 text-xs flex-wrap gap-y-2 mt-2">
            <div class="flex items-center gap-1.5">
              <!-- 时间 -->
              <span class="flex items-center px-1.5 py-1 rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">
                <i class="iconfont icon-zhong"></i><span class="ml-0.5">{{ formatDate(talk.created_at) }}</span>
              </span>
              <!-- 链接 -->
              <div v-if="talk.links?.length" class="flex items-center px-1.5 py-1 rounded-full bg-red-300/20 transition-colors duration-300">
                <a
                  v-for="(link, idx) in talk.links"
                  :key="idx"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  class="text-#f56c6c no-underline hover:opacity-60 px-0.5 transition-opacity duration-200"
                >
                  <i class="iconfont icon-link text-12px"></i><span class="ml-1">{{ link.text }}</span>
                </a>
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(tag, idx) in talk.tags"
                :key="idx"
                class="flex items-center px-1.5 py-1 rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300"
              >
                <span>{{ tag }}</span>
              </span>
            </div>
          </div>
          
        </li>
      </ul>

      <!-- 加载更多 -->
      <div v-if="!finished" class="mt-4 flex justify-center">
        <button
          class="px-4 py-2 bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 hover:opacity-70 rounded-full transition-all duration-300 cursor-pointer shadow-none border-none"
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
import { ref, onMounted, nextTick, useHead } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import Comment from '@/components/Comment.vue'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

useHead({
  titleTemplate: `说说 | ${siteConfig.title}`,
  meta: [
    { name: 'description', content: `share my life.` },
    { name: 'keywords', content: `${siteConfig.keywords},说说,talks` },
    { property: 'og:title', content: `说说 | ${siteConfig.title}` },
    { property: 'og:description', content: `share my life.` },
    { property: 'og:url', content: `${siteConfig.url}/talks` },
    { name: 'twitter:title', content: `说说 | ${siteConfig.title}` },
    { name: 'twitter:description', content: `share my life.` },
  ],
})

// 格式化时间
dayjs.extend(utc)
dayjs.extend(timezone)
const formatDate = (date) => dayjs(date).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm')

// Masonry 容器
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

// 请求数据
const talks = ref([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)

const TALKS_API = `${siteConfig.apiUrl}/api/talks/get`

// 首屏数据
const { data: initialData } = await useAsyncData('talks', async () => {
  try {
    return await $fetch(`${TALKS_API}?page=1&pageSize=${pageSize}`)
  } catch (e) {
    console.error('Fetch talks failed', e)
    return { data: [], totalPages: 0 }
  }
}, { server: true })

talks.value = initialData.value.data || []
if (initialData.value.totalPages <= 1) finished.value = true

// 加载更多
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
  return str.replace(/[&<>"']/g, function(m) { return ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  })[m]})
}

//获取图片数量
function getImgBlocks(talk) {
  if (!talk.content) return []
  const matches = [...talk.content.matchAll(/<talkImg>(.*?)<\/talkImg>/g)]
  return matches.map(match => {
    const alt = match[1]
    const imgObj = talk.imgs.find(i => i.alt === alt)
    return imgObj || { url: '', alt }
  })
}

//渲染内容
function renderContent(talk) {
  let html = talk.content

  // 移除 <talkImg> 标签 和 <talkLink> 标签
  html = html.replace(/\n*<talkImg>.*?<\/talkImg>/g, '')
  html = html.replace(/\n*<talkLink>.*?<\/talkLink>/g, '')

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    lang = lang || 'text';
    return `<div class="w-full px-2 py-1 flex flex-row justify-between items-center text-amber-500 dark:text-zinc-400"></div><pre class="my-1 bg-gray-100 dark:bg-white/10 dark:border-gray-700 rounded-lg p-2 text-sm font-mono text-#1f2937 dark:text-gray-200 shadow-inner" style="white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;"><code>${escapeHtml(code)}</code></pre>`
  })

  // 任务列表
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
  border: 2px solid #9ca3af;
  border-radius: 4px;
  background-color: transparent;
  position: relative;
}

/* 选中状态 */
.custom-checkbox:checked {
  background-color: #22c55e;
  border-color: #22c55e;
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