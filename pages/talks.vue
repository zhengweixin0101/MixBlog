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
      <ul data-fade ref="masonryContainer" class="mt-8 list-none">
        <li
          v-for="memo in memos"
          :key="memo.name"
          class="break-inside-avoid mb-5 rounded-xl px-4 pt-4 pb-2 bg-white dark:bg-white/10 shadow"
        >
          <!-- 富文本内容渲染 -->
          <div class="space-y-3 text-#2f3f5b dark:text-white text-base">
            <template v-for="(node, idx) in memo.nodes" :key="idx">
              <!-- 段落 -->
              <p v-if="node.type === 'PARAGRAPH'" class="whitespace-pre-line leading-relaxed">
                <template v-for="child in node.paragraphNode.children" :key="child.type + idx">
                  <!-- 文本 -->
                  <span v-if="child.type === 'TEXT'">{{ child.textNode.content }}</span>
                  <!-- 链接 -->
                  <a
                    v-else-if="child.type === 'LINK'"
                    :href="child.linkNode.url"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    class="text-#2f3f5b dark:text-white underline hover:opacity-60 px-0.5"
                  >
                    {{ child.linkNode.text }}
                  </a>
                </template>
              </p>

              <!-- 代码块 -->
              <pre
                v-else-if="node.type === 'CODE_BLOCK'"
                class="bg-gray-100 dark:bg-white/10 dark:border-gray-700 rounded-lg p-2 text-sm font-mono text-#1f2937 dark:text-gray-200 overflow-x-auto shadow-inner select-text"
              ><code>{{ node.codeBlockNode.content }}</code></pre>

              <!-- 任务列表 -->
              <ul v-else-if="node.type === 'LIST'" class="list-none space-y-1">
                <template v-for="(child, childIdx) in node.listNode.children" :key="child.type + childIdx">
                  <li v-if="child.type === 'TASK_LIST_ITEM'" class="flex items-center gap-1">
                    <label class="leading-snug flex items-center">
                      <input
                        type="checkbox"
                        :id="`checkbox-${memo.name}-${childIdx}`" 
                        :checked="child.taskListItemNode.complete"
                        class="w-4 h-4 rounded-md border-2 border-gray-400 dark:border-gray-600 accent-green-500 mr-1 mt-0.5"
                        disabled
                      />
                      <template v-for="c in child.taskListItemNode.children">
                        <span
                          v-if="c.type === 'TEXT'"
                          :class="child.taskListItemNode.complete ? 'line-through opacity-70' : ''"
                        >
                          {{ c.textNode.content }}
                        </span>
                      </template>
                    </label>
                  </li>
                </template>
              </ul>
            </template>

            <!-- 图片 -->
            <template v-if="memo.resources?.length">
              <div class="flex flex-wrap gap-4 mt-3">
                <a
                  v-for="res in memo.resources"
                  :key="res.name"
                  :href="res.externalLink"
                  data-fancybox="gallery-all"
                >
                  <img
                    :src="res.externalLink"
                    :alt="res.filename"
                    class="w-16 h-16 object-cover rounded-lg cursor-pointer shadow-[0_0_8px_0_rgba(0,0,0,0.2)]"
                  />
                </a>
              </div>
            </template>
          </div>

          <!-- 分割线 -->
          <hr class="mt-3 border-dashed border-t border-gray-300 dark:border-gray-600" />

          <!-- 日期 定位 标签 -->
          <div class="flex justify-between text-gray-400 text-sm flex-wrap gap-y-2 mt-2">
            <div class="flex gap-1 items-center">
              <!-- 日期 -->
              <span class="flex items-center px-1.5 py-0.5 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">
                <i class="iconfont icon-zhong mt-0.4"></i> {{ formatDate(memo.displayTime) }}
              </span>
              <!-- 定位 -->
              <span v-if="memo.location?.placeholder" class="flex items-center px-1.5 py-0.5 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">
                <i class="iconfont icon-dingwei mt-0.4"></i> {{ memo.location.placeholder }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(tag, idx) in memo.tags"
                :key="idx"
                class="flex items-center px-1.5 py-0.5 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300"
              >
                {{ tag }}
              </span>

            </div>
          </div>
        </li>
      </ul>

      <div data-fade id="comment">
        <Comment />
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useHead } from '#imports'
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
    { name: 'keywords', content: `${siteConfig.keywords},说说,memos` },
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
const formatDate = (date) => dayjs(date).tz('Asia/Shanghai').format('YYYY-MM-DD   HH:mm')

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
      breakAt: {
        640: 1,
      },
    })
  }
}

// 请求数据
const memosRaw = ref([])
const MEMOS_API = siteConfig.thirdParty.memosApi
const CACHE_KEY = 'memos-cache'
const CACHE_DURATION = 30 * 60 * 1000 // 缓存时长

async function fetchMemos() {
  if (typeof window !== 'undefined') {
    const cache = localStorage.getItem(CACHE_KEY)
    if (cache) {
      const { timestamp, data } = JSON.parse(cache)
      if (Date.now() - timestamp < CACHE_DURATION) {
        memosRaw.value = data
        return
      }
    }
  }

  // 缓存无效请求 API
  const res = await $fetch(MEMOS_API)
  const memos = res.memos || []
  memosRaw.value = memos

  // 存入缓存
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: memos,
      })
    )
  }
}

const memos = computed(() => memosRaw.value || [])

onMounted(async () => {
  // 获取数据
  await fetchMemos()

  // 初始化 Masonry
  nextTick().then(() => initMasonry())

  // 初始化 Fancybox
  Fancybox.bind('[data-fancybox]')
})
</script>