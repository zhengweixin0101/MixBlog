<template>
  <main>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <!-- 标题 -->
      <h1 data-fade="1" class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">说说</span>
      </h1>
      <p data-fade="2" class="mt-2 text-ink-muted transition-colors duration-base">
        随时随地，分享生活。
      </p>

      <!-- 桌面端双列瀑布流 -->
      <div v-if="twoCols" ref="listEl" class="mt-8 flex items-start gap-[18px]">
        <div
          v-for="(segs, ci) in columnSegments"
          :key="ci"
          class="flex flex-1 min-w-0 flex-col gap-[18px]"
        >
          <!-- 每列按批次切段 -->
          <div
            v-for="seg in segs"
            :key="seg.batch"
            :class="seg.batch
              ? ['talks-batch flex flex-col gap-[18px]', { 'is-entering': isEntering(seg.batch) }]
              : 'talks-seg'"
          >
            <TalkCard
              v-for="talk in seg.talks"
              :key="talk.id"
              :talk="talk"
              :fade-rank="cardFadeRank(talk)"
              :settled="isSettled(talk.id)"
              @fade-done="markSettled(talk.id)"
            />
          </div>
        </div>
      </div>

      <!-- 移动端单列 -->
      <ul v-else class="mt-8 grid grid-cols-1 gap-4 list-none">
        <li
          v-for="seg in columnSegments[0]"
          :key="seg.batch"
          :class="seg.batch
            ? ['talks-batch flex flex-col gap-4', { 'is-entering': isEntering(seg.batch) }]
            : 'talks-seg'"
        >
          <TalkCard
            :key="talk.id"
            v-for="talk in seg.talks"
            :talk="talk"
            :fade-rank="cardFadeRank(talk)"
            :settled="isSettled(talk.id)"
            @fade-done="markSettled(talk.id)"
          />
        </li>
      </ul>

      <!-- 加载更多 -->
      <div v-if="!finished" :data-fade="tailFadeRank" class="mt-4 flex justify-center">
        <button
          type="button"
          class="talks-more btn-hover appearance-none bg-surface-2 text-ink-muted rounded-full border border-line shadow-xs"
          :class="loading ? 'is-loading cursor-progress' : 'cursor-pointer'"
          :disabled="loading"
          :aria-busy="loading ? 'true' : 'false'"
          :aria-label="loading ? '加载中' : '加载更多'"
          @click="fetchTalks"
        >
          <span class="talks-more-label">加载更多</span>
          <svg class="talks-spinner" viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id="talks-spin-grad" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0" class="talks-spin-stop-a" />
                <stop offset="1" class="talks-spin-stop-b" />
              </linearGradient>
            </defs>
            <circle class="talks-spin-track" cx="10" cy="10" r="8.5" />
            <circle class="talks-spin-arc" cx="10" cy="10" r="8.5" />
          </svg>
        </button>
      </div>

      <div :data-fade="commentFadeRank">
        <Comment />
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import Comment from '@/components/Comment.vue'
import TalkCard from '@/components/TalkCard.vue'
import { usePostsMasonry } from '@/composables/usePostsMasonry'

import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'

usePageMeta('说说', `${siteConfig.description}`, '/talks', '说说,talks')

const talks = ref([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const finished = ref(false)

/** 圆环最短旋转时长 */
const SPIN_MIN = 500
/** 追加批次的入场窗口 */
const APPEAR_HOLD = 900
/** 同一批卡片共用一个容器，只播一次动画 */
const batchStartedAt = ref(new Map())
let batchNo = 0

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

/** 首屏卡片数 */
const initialCount = talks.value.length

async function fetchTalks() {
  if (loading.value || finished.value) return
  loading.value = true
  const startedAt = performance.now()
  try {
    const res = await $fetch(`${TALKS_API}?page=${page.value + 1}&pageSize=${pageSize}`)
    const fresh = res.data || []

    // 让圆环转满再收
    const rest = SPIN_MIN - (performance.now() - startedAt)
    if (rest > 0) await new Promise(resolve => setTimeout(resolve, rest))

    if (fresh.length) {
      // 打上批次号
      const batch = ++batchNo
      fresh.forEach(talk => { talk.batch = batch })
      talks.value.push(...fresh)
      batchStartedAt.value = new Map(batchStartedAt.value).set(batch, performance.now())
    }

    page.value++
    if (page.value >= res.totalPages) finished.value = true
  } catch (e) {
    console.error('Fetch talks failed', e)
  } finally {
    loading.value = false
  }
}

// 双列瀑布流（复用文章列表引擎）
const { listEl, columns, twoCols, isSettled, markSettled } = usePostsMasonry(talks, {
  minWidth: 640,
  getId: (talk) => talk.id
})

// 首屏入场按时间顺序：标题占 1-2，卡片从 3 起按 talks 序号钉位
function cardFadeRank(talk) {
  const i = talks.value.findIndex(t => t.id === talk.id)
  if (i < 0 || i >= initialCount) return 0
  return 3 + i
}

const tailFadeRank = 3 + initialCount
const commentFadeRank = 4 + initialCount

const columnSegments = computed(() => columns.value.map((col) => {
  const segs = []
  for (const talk of col) {
    const batch = talk.batch || 0
    const last = segs[segs.length - 1]
    if (last && last.batch === batch) last.talks.push(talk)
    else segs.push({ batch, talks: [talk] })
  }
  return segs
}))

function isEntering(batch) {
  if (!batch) return false
  const at = batchStartedAt.value.get(batch)
  return !!at && performance.now() - at < APPEAR_HOLD
}

onMounted(() => {
  // Fancybox bind 是挂在 body 上的事件委托，加载更多新增的图片自动生效，无需重新绑定
  Fancybox.bind('[data-fancybox]', { Hash: false })
})
</script>

<style>
.talks-seg {
  display: contents;
}

.talks-batch.is-entering {
  animation: talks-batch-in var(--dur-fade) var(--ease-fade) both;
}

@keyframes talks-batch-in {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.talks-more {
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 7px 16px;
  transition: padding var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}

.talks-more.is-loading {
  padding: 7px;
}

.talks-more.is-loading,
.talks-more.is-loading:hover {
  border-color: var(--line);
  box-shadow: var(--shadow-xs);
  color: var(--ink-muted);
}

.talks-more-label {
  grid-area: 1 / 1;
  max-width: 3.75rem;
  overflow: hidden;
  white-space: nowrap;
  transition: max-width var(--dur-base) var(--ease-in-out),
    opacity var(--dur-fast) var(--ease-out);
}

.talks-more.is-loading .talks-more-label {
  max-width: 0;
  opacity: 0;
}

.talks-spinner {
  grid-area: 1 / 1;
  width: 20px;
  height: 20px;
  opacity: 0;
  transform-origin: center;
  animation: talks-spin 0.85s linear infinite;
  animation-play-state: paused;
  transition: opacity var(--dur-base) var(--ease-out) 40ms;
}

.talks-spinner circle {
  fill: none;
  stroke-width: 2;
}

.talks-spin-track {
  stroke: var(--line-strong);
}

.talks-spin-arc {
  stroke: url(#talks-spin-grad);
  stroke-dasharray: 24 29.4;
  stroke-linecap: round;
}

.talks-spin-stop-a {
  stop-color: var(--accent);
}

.talks-spin-stop-b {
  stop-color: var(--accent-2);
}

.talks-more.is-loading .talks-spinner {
  opacity: 1;
  animation-play-state: running;
}

@keyframes talks-spin {
  to {
    transform: rotate(360deg);
  }
}

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