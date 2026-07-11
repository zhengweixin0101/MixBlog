<template>
  <transition name="fullscreen">
    <div
      v-if="visible && currentItem"
      class="fixed inset-0 z-[9998] flex overflow-hidden select-none 2xl:px-80"
      tabindex="0"
      ref="containerEl"
    >
    <!-- 背景 -->
    <div class="absolute inset-0">
      <img
        v-if="currentItem?.coverBlobUrl"
        :src="currentItem.coverBlobUrl"
        class="absolute inset-0 w-full h-full object-cover blur-[20px] scale-105 fade-in-image"
        alt=""
        loading="lazy"
        draggable="false"
        onload="this.classList.add('onload-fade')"
      />
      <div class="absolute inset-0 bg-black/75"></div>
    </div>

    <div class="relative z-10 w-2/5 flex flex-col items-center justify-center p-6 gap-6 text-center text-white">
      <!-- 封面 -->
      <div class="cover-wrap w-50 h-50 lg:w-60 lg:h-60 2xl:w-78 2xl:h-78 rounded-full overflow-hidden shadow-2xl shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center justify-center">
        <div v-if="isLoadingSong" class="w-full h-full rounded-full bg-white/10 shimmer"></div>
        <img
          v-else-if="currentItem?.coverBlobUrl"
          :src="currentItem.coverBlobUrl"
          :alt="currentItem.title || 'cover'"
          class="w-full h-full object-cover animate-spin fade-in-image"
          :style="{ animationPlayState: isPlaying ? 'running' : 'paused', animationDuration: '35s' }"
          loading="lazy"
          draggable="false"
          onload="this.classList.add('onload-fade')"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
          无封面
        </div>
      </div>

      <!-- 歌曲信息 -->
      <div class="text-center">
        <template v-if="isLoadingSong">
          <div class="w-48 h-8 rounded bg-white/10 shimmer mx-auto"></div>
          <div class="w-32 h-6 rounded bg-white/10 shimmer mx-auto mt-2"></div>
        </template>
        <template v-else>
          <div class="text-3xl 2xl:text-4xl font-bold truncate">{{ currentItem?.title }}</div>
          <div class="text-md 2xl:text-xl opacity-80 truncate mt-1">{{ currentItem?.artist }}</div>
        </template>
      </div>

      <!-- 播放控件 -->
      <div class="flex items-center gap-6 mt-4">
        <button @click="prev" class="text-white hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-color">
          <i class="text-5 iconfont icon-backward"></i>
        </button>
        <button @click="togglePlay" class="text-white hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-color">
          <i class="text-5 iconfont" :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
        </button>
        <button @click="next" class="text-white hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-color">
          <i class="text-5 iconfont icon-forward"></i>
        </button>
      </div>
    </div>

    <!-- 歌词 -->
    <div class="lyrics flex-1 overflow-y-auto py-78 text-center" ref="lyricsEl" tabindex="-1">
      <div v-if="isLoadingSong && !lyrics?.length" class="mt-20 space-y-3 flex flex-col items-center">
        <div v-for="n in 8" :key="n" class="w-64 h-5 rounded shimmer"
          :class="n === 1 ? 'w-48' : n === 4 ? 'w-56' : 'w-64'"
          :style="{ background: 'linear-gradient(90deg, rgba(255,255,255,.08) 25%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.08) 75%)', backgroundSize: '200% 100%' }"></div>
      </div>
      <div v-else-if="!lyrics?.length" class="mt-20">暂无歌词</div>
      <div v-else class="space-y-5">
        <div
          v-for="(line, i) in lyrics"
          :key="i"
          :class="[
            'lyric-line text-5 lg:text-6 2xl:text-7 transition-all duration-300',
            currentLyricIndices.includes(i)
              ? 'current text-gradient font-semibold scale-130'
              : 'text-white'
          ]"
          :style="currentLyricIndices.includes(i) ? { filter: 'none' } : { filter: 'blur(1.5px)' }"
        >
          <template v-if="Array.isArray(line.text)">
            <div v-for="(text, textIndex) in line.text" :key="textIndex" class="py-1">{{ text }}</div>
          </template>
          <template v-else>{{ line.text }}</template>
        </div>
      </div>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const {
  currentItem, isPlaying, isLoadingSong, lyrics, currentLyricIndices, currentLyricIndex,
  togglePlay, prev, next,
} = useMusicPlayer()

const visible = useState('showMusicFullscreen', () => false)
const containerEl = ref(null)
const lyricsEl = ref(null)

function close() {
  visible.value = false
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
  const hideHeader = useState('hideHeader')
  hideHeader.value = false
}

// 歌词滚动
let scrollTimer = null

async function scrollLyrics() {
  const el = lyricsEl.value
  if (!el) return
  await nextTick()
  const currentLines = el.querySelectorAll('.lyric-line.current')
  if (!currentLines || currentLines.length === 0) return
  const cur = currentLines[0]
  const elRect = el.getBoundingClientRect()
  const curRect = cur.getBoundingClientRect()
  const target = el.scrollTop + (curRect.top - elRect.top) - (el.clientHeight / 2 - cur.offsetHeight / 2)
  const start = el.scrollTop
  const distance = target - start
  const dur = 700
  const startTime = performance.now()
  if (scrollTimer) cancelAnimationFrame(scrollTimer)
  function animate(now) {
    const progress = Math.min((now - startTime) / dur, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.scrollTop = start + distance * ease
    if (progress < 1) scrollTimer = requestAnimationFrame(animate)
  }
  scrollTimer = requestAnimationFrame(animate)
}

watch(currentLyricIndex, () => {
  if (visible.value) scrollLyrics()
})

watch(visible, (val) => {
  if (val) {
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.scrollbarWidth = 'none'
    nextTick(() => {
      containerEl.value?.focus()
      if (lyrics.value?.length && currentLyricIndex.value >= 0) scrollLyrics()
    })
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.documentElement.style.overflow = ''
    document.documentElement.style.scrollbarWidth = ''
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }
})

function handleKeydown(e) {
  if (!visible.value) return
  if (e.code === 'F11') { close(); return }
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); return }
  if (e.code === 'ArrowLeft') { e.preventDefault(); prev(); return }
  if (e.code === 'ArrowRight') { e.preventDefault(); next(); return }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (scrollTimer) cancelAnimationFrame(scrollTimer)
})
</script>

<style scoped>
.cover-wrap img {
  -webkit-user-drag: none;
  user-select: none;
}

.lyrics {
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
}

.lyrics::-webkit-scrollbar {
  display: none;
}

.shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, rgba(128,128,128,.08) 25%, rgba(128,128,128,.18) 50%, rgba(128,128,128,.08) 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.fullscreen-enter-active {
  transition: opacity 0.3s ease;
}

.fullscreen-leave-active {
  transition: opacity 0.2s ease;
}

.fullscreen-enter-from,
.fullscreen-leave-to {
  opacity: 0;
}
</style>
