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
          v-for="memo in memos"
          :key="memo.name"
          class="break-inside-avoid mb-5 rounded-xl px-4 pt-4 pb-2 bg-white dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] transition-color duration-300"
        >
          <!-- 富文本内容渲染 -->
          <div class="text-#2f3f5b dark:text-white text-base">
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
                class="bg-gray-100 dark:bg-white/10 dark:border-gray-700 rounded-lg p-2 text-sm font-mono text-#1f2937 dark:text-gray-200 overflow-x-auto shadow-inner"
              ><code>{{ node.codeBlockNode.content }}</code></pre>

              <!-- 任务列表 -->
              <ul v-else-if="node.type === 'LIST'" class="list-none space-y-0.5">
                <template v-for="(child, childIdx) in node.listNode.children" :key="child.type + childIdx">
                  <li v-if="child.type === 'TASK_LIST_ITEM'" class="flex items-center gap-1">
                    <label class="leading-snug flex items-center">
                      <input
                        type="checkbox"
                        :id="`checkbox-${memo.name}-${childIdx}`" 
                        :checked="child.taskListItemNode.complete"
                        class="custom-checkbox mr-1 mt-0.5"
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
                  :data-fancybox="`gallery-${memo.name}`"
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
          <div class="flex justify-between text-gray-400 text-xs flex-wrap gap-y-2 mt-2">
            <div class="flex gap-1.5 items-center">
              <!-- 日期 -->
              <span class="flex items-center px-1.5 py-1 rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">
                <i class="iconfont icon-zhong"></i><span class="ml-0.5">{{ formatDate(memo.displayTime) }}</span>
              </span>
              <!-- 定位 -->
              <span v-if="memo.location?.placeholder" class="flex items-center px-1.5 py-1 rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300">
                <i class="iconfont icon-dingwei"></i><span class="ml-0.5">{{ memo.location.placeholder }}</span>
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="(tag, idx) in memo.tags"
                :key="idx"
                class="flex items-center px-1.5 py-1 rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300"
              >
                <span>{{ tag }}</span>
              </span>
            </div>
          </div>
          
        </li>
      </ul>

      <!-- 加载更多按钮 -->
      <div data-fade v-if="!finished" class="mt-4 flex justify-center">
        <button
          class="px-4 py-2 bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 hover:opacity-70 rounded-full transition-all duration-300 cursor-pointer shadow-none border-none"
          :disabled="loading"
          @click="fetchMemos(nextPageToken)"
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
const memos = ref([])
const nextPageToken = ref(null)
const loading = ref(false)
const finished = ref(false)

const MEMOS_API = siteConfig.thirdParty.memosApi

// 首屏数据
const { data: initialData } = await useAsyncData('memos', async () => {
  try {
    return await $fetch(`${MEMOS_API}?pageSize=10`)
  } catch (e) {
    console.error('Fetch memos failed', e)
    return { memos: [], nextPageToken: null }
  }
}, { server: true })

memos.value = initialData.value.memos || []
nextPageToken.value = initialData.value.nextPageToken || null
if (!nextPageToken.value) finished.value = true

// 加载更多
async function fetchMemos(pageToken = '') {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    const res = await $fetch(`${MEMOS_API}?pageSize=10&pageToken=${pageToken}`)
    memos.value.push(...(res.memos || []))
    nextPageToken.value = res.nextPageToken || null
    if (!res.nextPageToken) finished.value = true
    nextTick().then(() => initMasonry())
  } catch (e) {
    console.error('Fetch memos failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 初始化 Masonry
  nextTick().then(() => initMasonry())

  // 初始化 Fancybox
  Fancybox.bind('[data-fancybox]', {
    Hash: false
  })
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