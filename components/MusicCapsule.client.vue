<template>
  <transition name="capsule">
  <div
    v-show="capsuleVisible"
    class="music-capsule fixed bottom-5 left-5 z-400
           bg-#fefefe/80 dark:bg-#1a1a1a/70 backdrop-blur-md
           shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)]
           cursor-pointer select-none rounded-full h-[44px]
           transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="{ 'capsule-no-anim': !capsuleClosing }"
    data-music-capsule
    :style="{ width: capsuleWidth + 'px' }"
    @click="togglePlayAction"
    @contextmenu.prevent
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- 内容区 -->
    <div class="relative w-full h-full overflow-hidden rounded-full">
      <div class="flex items-center h-full px-[6px] gap-2">
        <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm relative z-[1]">
          <img
            v-if="shownItem?.coverBlobUrl"
            :src="shownItem.coverBlobUrl"
            :alt="shownItem.title"
            class="w-full h-full object-cover fade-in-image"
            :style="{ transform: `rotate(${rotation}deg)` }"
            draggable="false"
            loading="lazy"
            onload="this.classList.add('onload-fade')"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 bg-gray/10 dark:bg-white/5">
            <i class="iconfont icon-music text-xs"></i>
          </div>
        </div>

        <div v-if="!isPlaying" class="flex-shrink-0 overflow-hidden">
          <span class="text-[15px] font-semibold text-#2f3f5b dark:text-white whitespace-nowrap block">
            {{ shownItem?.title }}
          </span>
        </div>

        <div v-else class="flex-shrink-0 overflow-hidden">
          <transition name="lyric-slide" mode="out-in">
            <div
              :key="currentLyricIndex"
              class="text-[15px] text-gray-600 dark:text-gray-300 whitespace-nowrap"
            >
              {{ currentLyricText }}
            </div>
          </transition>
        </div>
      </div>

      <!-- 播放进度条 -->
      <div
        v-if="duration"
        class="absolute inset-0 origin-left pointer-events-none"
        :class="{
          'bg-black/5 dark:bg-white/20': progressPercent < 100,
          'bg-#00e699/20': progressPercent >= 100,
        }"
        :style="{ transform: `scaleX(${progressPercent / 100})` }"
      ></div>
    </div>

    <transition name="overlay-fade">
      <div
        v-if="hovered"
        class="absolute inset-0 rounded-full flex items-center justify-center z-10
               bg-white/60 dark:bg-black/50 backdrop-blur-sm"
      >
        <i :class="isPlaying
          ? 'iconfont icon-pause text-lg text-#2f3f5b dark:text-white'
          : 'iconfont icon-play text-lg text-#2f3f5b dark:text-white ml-0.5'"></i>
      </div>
    </transition>
  </div>
  </transition>

  <div ref="measureEl" class="fixed -left-[9999px] top-0 whitespace-nowrap text-[15px] font-semibold pointer-events-none opacity-0">
    {{ measureText }}
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const route = useRoute()

const {
  currentItem, isPlaying, lyrics, currentLyricIndex, currentTime, duration,
  togglePlay, pausedOnMusicPage, capsuleClosing,
} = useMusicPlayer()

const isMusicPage = computed(() => route.path === '/music')
const shouldShowCapsule = computed(() => !!currentItem.value && !isMusicPage.value && !pausedOnMusicPage.value)
const capsuleVisible = computed(() => shouldShowCapsule.value && !isMobile.value && !capsuleClosing.value)
const lastItem = ref(null)
const shownItem = computed(() => currentItem.value || lastItem.value)
const isMobile = ref(false)
const hovered = ref(false)
const measureEl = ref(null)

watch(currentItem, (item) => {
  if (item) lastItem.value = item
}, { immediate: true })

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

let musicPlayTimer = null

watch([isMobile, isMusicPage], ([mobile, musicPage]) => {
  clearTimeout(musicPlayTimer)
  if (mobile && !musicPage && isPlaying.value) togglePlay()
  if (musicPage && !isPlaying.value && currentItem.value) {
    musicPlayTimer = setTimeout(() => {
      togglePlay()
      pausedOnMusicPage.value = false
    }, 1000)
  }
})

const currentLyricText = computed(() => {
  if (!lyrics.value?.length || currentLyricIndex.value < 0) return currentItem.value?.title || ''
  const line = lyrics.value[currentLyricIndex.value]
  if (!line) return currentItem.value?.title || ''
  return Array.isArray(line.text) ? line.text.join(' / ') : line.text
})

const measureText = computed(() => isPlaying.value ? currentLyricText.value : currentItem.value?.title || '')

const capsuleWidth = ref(45)

function measureWidth() {
  nextTick(() => {
    const el = measureEl.value
    if (!el) {
      capsuleWidth.value = 45
      return
    }
    const textW = el.getBoundingClientRect().width
    capsuleWidth.value = Math.max(45, Math.ceil(6 + 32 + 8 + textW + 15))
  })
}

watch([isPlaying, currentLyricText, currentItem, lyrics], () => {
  if (!isMobile.value) measureWidth()
}, { immediate: true })

watch(shouldShowCapsule, (visible) => {
  if (visible && !isMobile.value) measureWidth()
})

const rotation = ref(0)
let rafId = null
let lastTime = null
const speed = 360 / 20

function animate(now) {
  if (lastTime !== null) {
    const delta = (now - lastTime) / 1000
    rotation.value = (rotation.value + speed * delta) % 360
  }
  lastTime = now
  rafId = requestAnimationFrame(animate)
}

watch([isPlaying, isMobile], ([playing, mobile]) => {
  if (playing && !mobile) {
    lastTime = null
    rafId = requestAnimationFrame(animate)
  } else {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    lastTime = null
  }
}, { immediate: true })

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  nextTick(() => { measureWidth() })
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  clearTimeout(musicPlayTimer)
  window.removeEventListener('resize', checkMobile)
})

function togglePlayAction() {
  togglePlay()
}
</script>

<style scoped>
.music-capsule.capsule-enter-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
}

.music-capsule.capsule-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
  width: 45px !important;
}

.music-capsule.capsule-leave-active {
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease 0.35s, transform 0.25s ease 0.35s;
}

.music-capsule.capsule-leave-to {
  width: 45px !important;
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.music-capsule.capsule-no-anim.capsule-leave-active {
  transition: none;
}

.lyric-slide-enter-active,
.lyric-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.lyric-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.lyric-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
