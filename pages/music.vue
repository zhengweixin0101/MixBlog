<template>
  <div v-if="!isFullscreen" class="h-screen pt-20 flex flex-col select-none">
    <div data-fade class="flex flex-1 min-h-0">
      <!-- 左侧列表 -->
      <aside class="musicList max-w-65 overflow-y-auto relative hidden md:block" ref="listEl">
        <!-- 加载中骨架屏 -->
        <ul v-if="isLoadingList" class="space-y-2 p-1">
          <li v-for="n in 6" :key="n" class="flex items-center p-2 py-3 rounded-lg bg-surface shadow-xs">
            <div class="w-6 h-6 flex items-center justify-center mr-2">
              <div class="w-4 h-4 rounded skeleton"></div>
            </div>
            <div class="min-w-0 flex-1 flex justify-between items-center">
              <div class="w-24 h-4 rounded skeleton"></div>
              <div class="w-16 h-3 rounded skeleton ml-2"></div>
            </div>
          </li>
        </ul>
        <!-- 列表为空 -->
        <div v-else-if="!list?.length" class="flex items-center justify-center h-full text-ink-subtle text-sm">
          暂无歌曲
        </div>
        <!-- 正常列表 -->
        <ul v-else class="space-y-2 p-1">
          <li
            v-for="(item, idx) in list"
            :key="item.musicFull || item.title || idx"
            @click="playIndex(idx)"
            :class="[
              'flex items-center p-2 py-3 rounded-lg cursor-pointer bg-surface transition-all duration-base',
              idx === currentIndex
                ? 'border border-accent-line bg-accent-soft'
                : 'border border-line shadow-xs'
            ]"
          >
            <div class="w-6 h-6 flex items-center justify-center text-xs font-semibold mr-2 text-ink-muted">
              {{ idx + 1 }}
            </div>
            <div class="min-w-0 flex-1 flex justify-between items-center">
              <div class="transition-color duration-base font-semibold truncate">{{ item.title }}</div>
              <div class="text-xs transition-color duration-base truncate ml-2">
                {{ item.artist }}
              </div>
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右侧播放界面 -->
      <div class="card-base flex-1 flex flex-col min-h-0 ml-1 bg-surface transition-all duration-base">
        <!-- 加载中骨架屏 -->
        <div v-if="isLoadingList" class="mt-20 p-6 text-center">
          <div class="cover-wrap w-40 h-40 rounded-full overflow-hidden shadow-xl flex items-center justify-center mx-auto">
            <div class="w-full h-full rounded-full skeleton"></div>
          </div>
          <div class="mt-3 text-center w-full px-4 flex flex-col items-center gap-2">
            <div class="w-40 h-6 rounded skeleton"></div>
            <div class="w-24 h-4 rounded skeleton"></div>
          </div>
        </div>
        <!-- 正常播放信息 -->
        <div v-else-if="currentItem" class="mt-20 p-6 text-center">
          <div class="cover-wrap w-40 h-40 rounded-full overflow-hidden shadow-xl flex items-center justify-center mx-auto">
            <!-- 加载中骨架 -->
            <div v-if="isLoadingSong" class="w-full h-full rounded-full skeleton"></div>
            <!-- 正常封面 -->
            <img
              v-else-if="currentItem.coverBlobUrl"
              :src="currentItem.coverBlobUrl"
              :alt="currentItem.title || 'cover'"
              class="block w-full h-full object-cover origin-center animate-spin fade-in-image"
              :style="{ animationPlayState: isPlaying ? 'running' : 'paused', animationDuration: '40s' }"
              loading="lazy"
              draggable="false"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-sm text-ink-subtle">
              无封面
            </div>
          </div>
          <div class="mt-3 text-center w-full px-4">
            <!-- 歌名加载中 -->
            <div v-if="isLoadingSong" class="flex flex-col items-center gap-2">
              <div class="w-40 h-6 rounded skeleton mx-auto"></div>
              <div class="w-24 h-4 rounded skeleton mx-auto"></div>
            </div>
            <template v-else>
              <div class="text-6 font-bold truncate transition-color duration-base">{{ currentItem.title }}</div>
              <div class="text-sm transition-color duration-base text-ink-muted truncate">
                {{ currentItem.artist }}
              </div>
            </template>
          </div>
        </div>

        <!-- 歌词 -->
        <div
          class="lyrics flex-1 overflow-y-auto p-6 text-center"
          ref="lyricsEl"
          tabindex="-1"
          @wheel.prevent
          @keydown.prevent
        >
          <!-- 歌词加载中 -->
          <div v-if="isLoadingList" class="mt-20 space-y-2 flex flex-col items-center">
            <div v-for="n in 8" :key="n" class="w-48 h-4 rounded skeleton"
              :class="n === 1 ? 'w-36' : n === 4 ? 'w-40' : 'w-48'"></div>
          </div>
          <div v-else-if="isLoadingSong && !lyrics?.length" class="mt-20 space-y-2 flex flex-col items-center">
            <div v-for="n in 8" :key="n" class="w-48 h-4 rounded skeleton"
              :class="n === 1 ? 'w-36' : n === 4 ? 'w-40' : 'w-48'"></div>
          </div>
          <div v-else-if="!currentItem" class="mt-20">请选择歌曲播放</div>
          <div v-else-if="!lyrics?.length" class="mt-20">暂无歌词</div>
          <div v-else class="space-y-2">
            <div
              v-for="(line, i) in lyrics"
              :key="i"
              :class="[ 
                'lyric-line sm:text-5 transition-all duration-base',
                currentLyricIndices.includes(i)
                  ? 'current text-gradient font-semibold scale-115'
                  : 'text-ink-muted'
              ]"
              :style="currentLyricIndices.includes(i) ? { filter: 'none' } : { filter: 'blur(1.5px)' }"
            >
              <template v-if="Array.isArray(line.text)">
                <div v-for="(text, textIndex) in line.text" :key="textIndex" class="py-0.5">
                  {{ text }}
                </div>
              </template>
              <template v-else>
                {{ line.text }}
              </template>
            </div>
          </div>
        </div>

        <div class="hidden md:block absolute bottom-2 right-3 cursor-pointer opacity-50" @click="toggleFullscreen"> 
          <AppIcon name="maximize" class="text-lg" />
        </div>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div
      data-fade
      class="my-4 p-5 rounded-lg bg-surface shadow-xs duration-base"
    >
      <!-- 移动端 -->
      <div class="md:hidden flex flex-col gap-3">
        <!-- 进度条 -->
        <div class="w-full flex items-center gap-2">
          <span class="text-xs w-10 text-right">{{ formatTime(currentTime) }}</span>
          <input
            class="flex-1 h-1.5 rounded-full bg-surface-2 appearance-none cursor-pointer accent-accent"
            type="range"
            min="0"
            :max="duration"
            step="0.1"
            v-model.number="seekValue"
            @input="onSeekInput"
            @change="onSeekChange"
            @pointerdown="isSeeking = true"
            @pointerup="isSeeking = false"
            @pointerleave="isSeeking = false"
            :style="getProgressTrackStyle()"
          />
          <span class="text-xs w-10">{{ formatTime(duration) }}</span>
        </div>

        <!-- 按钮 -->
        <div class="w-full flex items-center justify-between px-2">
          <!-- 左侧列表 -->
          <div class="flex items-center gap-2">
            <button @click="musicList" :disabled="!list?.length" class="p-2 rounded-full text-ink hover:bg-surface-2 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <AppIcon name="list-music" class="text-lg" />
            </button>
          </div>

          <!-- 中间控制 -->
          <div class="flex items-center gap-4">
            <button @click="prev" :disabled="!list?.length" class="p-2 rounded-full text-ink hover:bg-surface-2 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <AppIcon name="skip-back-solid" class="text-lg" />
            </button>

            <button @click="togglePlay" :disabled="!list?.length" class="p-3 rounded-full bg-accent text-white shadow-xs appearance-none border-none cursor-pointer transition-all">
              <AppIcon :name="isPlaying ? 'pause-solid' : 'play-solid'" class="text-xl" />
            </button>

            <button @click="next" :disabled="!list?.length" class="p-2 rounded-full text-ink hover:bg-surface-2 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <AppIcon name="skip-forward-solid" class="text-lg" />
            </button>
          </div>

          <!-- 右侧功能 -->
          <div class="flex items-center gap-2">
            <button @click="togglePlayMode" class="p-2 rounded-full text-ink hover:bg-surface-2 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <AppIcon :name="playMode === 'single' ? 'repeat-1' : playMode === 'shuffle' ? 'shuffle' : 'repeat'" class="text-lg" />
            </button>
          </div>
        </div>
      </div>

      <!-- 桌面端 -->
      <div class="hidden md:flex items-center gap-4 flex-wrap justify-between">
        <!-- 左侧播放控制 -->
        <div class="flex items-center gap-4">
          <button @click="prev" :disabled="!list?.length" class="text-ink hover:opacity-50 dark:hover:opacity-100 dark:hover:text-accent appearance-none bg-transparent border-none cursor-pointer transition-all">
            <AppIcon name="skip-back-solid" class="text-lg" />
          </button>

          <button @click="togglePlay" :disabled="!list?.length" class="text-ink hover:opacity-50 dark:hover:opacity-100 dark:hover:text-accent appearance-none bg-transparent border-none cursor-pointer transition-all">
            <AppIcon :name="isPlaying ? 'pause-solid' : 'play-solid'" class="text-xl" />
          </button>

          <button @click="next" :disabled="!list?.length" class="text-ink hover:opacity-50 dark:hover:opacity-100 dark:hover:text-accent appearance-none bg-transparent border-none cursor-pointer transition-all">
            <AppIcon name="skip-forward-solid" class="text-lg" />
          </button>
        </div>

        <!-- 进度条 -->
        <div class="flex-1 flex items-center gap-2 mx-2 min-w-[200px]">
          <span class="text-xs w-10 text-right">{{ formatTime(currentTime) }}</span>
          <input
            class="flex-1 h-1.5 rounded-full bg-surface-2 appearance-none cursor-pointer accent-accent"
            type="range"
            min="0"
            :max="duration"
            step="0.1"
            v-model.number="seekValue"
            @input="onSeekInput"
            @change="onSeekChange"
            @pointerdown="isSeeking = true"
            @pointerup="isSeeking = false"
            @pointerleave="isSeeking = false"
            :style="getProgressTrackStyle()"
          />
          <span class="text-xs w-10">{{ formatTime(duration) }}</span>
        </div>

        <!-- 右侧功能 -->
        <div class="flex items-center gap-4">
          <button @click="togglePlayMode" class="text-ink hover:opacity-50 dark:hover:opacity-100 dark:hover:text-accent appearance-none bg-transparent border-none cursor-pointer transition-all">
            <AppIcon :name="playMode === 'single' ? 'repeat-1' : playMode === 'shuffle' ? 'shuffle' : 'repeat'" class="text-lg" />
          </button>

          <button @click="toggleMute" class="text-ink hover:opacity-50 dark:hover:opacity-100 dark:hover:text-accent appearance-none bg-transparent border-none cursor-pointer transition-all">
            <AppIcon :name="muted ? 'volume-mute' : 'volume'" class="text-lg" />
          </button>

          <button
            v-if="currentItem?.musicFull"
            @click="downloadMusic"
            class="text-ink hover:opacity-50 dark:hover:opacity-100 dark:hover:text-accent appearance-none bg-transparent border-none cursor-pointer transition-all"
          >
            <AppIcon name="download" class="text-lg" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 移动端歌曲列 -->
  <Teleport to="body">
    <div class="fixed inset-0 z-350 md:hidden select-none" :class="{ 'pointer-events-none': !mobileListOpen }" aria-hidden="true">
      <transition name="fade">
        <div v-show="mobileListOpen" class="absolute inset-0 bg-black/50 backdrop-blur" @click="closeMobileList"></div>
      </transition>

      <transition name="slide-up">
        <aside
          ref="mobileListEl"
          v-show="mobileListOpen"
          class="fixed bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto shadow-lg
                 border-t border-line bg-overlay text-ink rounded-t-lg"
        >
          <!-- 加载中骨架屏 -->
          <ul v-if="isLoadingList" class="space-y-2 p-3">
            <li v-for="n in 6" :key="n" class="flex items-center p-2 py-3 rounded-lg bg-surface shadow-xs">
              <div class="w-6 h-6 flex items-center justify-center mr-2">
                <div class="w-4 h-4 rounded skeleton"></div>
              </div>
              <div class="min-w-0 flex-1 flex justify-between items-center">
                <div class="w-24 h-4 rounded skeleton"></div>
                <div class="w-16 h-3 rounded skeleton ml-2"></div>
              </div>
            </li>
          </ul>
          <!-- 列表为空 -->
          <div v-else-if="!list?.length" class="flex items-center justify-center py-12 text-ink-subtle text-sm">
            暂无歌曲
          </div>
          <!-- 正常列表 -->
          <ul v-else class="space-y-2 p-3">
            <li
              v-for="(item, idx) in list"
              :key="item.musicFull || item.title || idx"
              @click="selectMobile(idx)"
              :class="[
                'flex items-center p-2 py-3 rounded-lg cursor-pointer bg-surface transition-all duration-base',
                idx === currentIndex
                  ? 'border border-accent-line bg-accent-soft'
                  : 'border border-line shadow-xs'
              ]"
            >
              <div class="w-6 h-6 flex items-center justify-center text-xs font-semibold mr-2 text-ink-muted">
                {{ idx + 1 }}
              </div>
              <div class="min-w-0 flex-1 flex justify-between items-center">
                <div class="transition-color duration-base font-semibold truncate">{{ item.title }}</div>
                <div class="text-sm transition-color duration-base truncate ml-2">
                  {{ item.artist }}
                </div>
              </div>
            </li>
          </ul>
        </aside>
      </transition>
    </div>
  </Teleport>

</template>

<script setup>
import { siteConfig } from '../siteConfig/main'

import { useNotification } from '~/composables/useNotification'
const notification = useNotification()

usePageMeta('音乐', `${siteConfig.description}`, '/music', '音乐,Music')

definePageMeta({
  hideFooter: true
})

const {
  list, isLoadingList, error, currentIndex, currentItem,
  isPlaying, isLoadingSong, duration, currentTime,
  lyrics, groupedLyrics, currentLyricIndex, currentLyricIndices,
  playMode, muted, shuffleList, shuffleIndex, pausedOnMusicPage,
  loadList, ensureInfo, loadLyrics, buildGroupedLyrics,
  playIndex: sharedPlayIndex, togglePlay: sharedTogglePlay,
  prev: sharedPrev, next: sharedNext, togglePlayMode: sharedTogglePlayMode,
  toggleMute: sharedToggleMute, seek: sharedSeek, downloadMusic: sharedDownloadMusic,
  cleanup, getAudio, attachPermanentListeners, setOnLyricChange,
  cancelPendingPlay, closeCapsule, capsuleClosing,
} = useMusicPlayer()

const seekValue = ref(0)
const isSeeking = ref(false)
const lyricsEl = ref(null)
const listEl = ref(null)
const isFullscreen = useState('showMusicFullscreen', () => false)
const mobileListOpen = ref(false)
const mobileListEl = ref(null)

const progressPercent = computed(() => {
  const total = Number(duration.value)
  const value = Number(seekValue.value)

  if (!Number.isFinite(total) || total <= 0) return null
  if (!Number.isFinite(value)) return 0

  return Math.min(Math.max((value / total) * 100, 0), 100)
})

function getProgressTrackStyle(value = progressPercent.value) {
  if (value === null) return { background: 'var(--surface-3)' }

  const percent = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0
  return {
    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, var(--surface-3) ${percent}%, var(--surface-3) 100%)`
  }
}

watch(currentTime, (v) => { if (!isSeeking.value) seekValue.value = v })

async function playIndex(i, forcePlay = false) {
  const switched = await sharedPlayIndex(i, forcePlay)
  if (!switched) return
  seekValue.value = 0
}

function togglePlay() {
  const wasPlaying = isPlaying.value
  sharedTogglePlay()
  pausedOnMusicPage.value = wasPlaying
}
function prev() { sharedPrev() }
function next() { sharedNext(false) }
function togglePlayMode() { sharedTogglePlayMode() }
function toggleMute() {
  const wasMuted = muted.value
  sharedToggleMute()
  if (muted.value !== wasMuted) {
    notification.show(muted.value ? '已开启静音' : '已关闭静音', 'info')
  }
}
function downloadMusic() { sharedDownloadMusic() }

function musicList() {
  if (!list.value?.length) return
  mobileListOpen.value = !mobileListOpen.value
  if (mobileListOpen.value) {
    nextTick().then(scrollMobileToCurrentItem)
  }
}

function closeMobileList() { mobileListOpen.value = false }

function selectMobile(idx) {
  playIndex(idx)
  closeMobileList()
}

const scrollAnims = new WeakMap()

function animateScrollTop(el, target, dur) {
  const pending = scrollAnims.get(el)
  if (pending) cancelAnimationFrame(pending)
  const start = el.scrollTop
  const distance = target - start
  if (!distance) return
  const startTime = performance.now()
  function animate(now) {
    const progress = Math.min((now - startTime) / dur, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.scrollTop = start + distance * ease
    if (progress < 1) scrollAnims.set(el, requestAnimationFrame(animate))
    else scrollAnims.delete(el)
  }
  scrollAnims.set(el, requestAnimationFrame(animate))
}

async function scrollListToIndex(el, index, dur) {
  if (!el || index < 0) return
  await nextTick()
  const itemEl = el.querySelector(`li:nth-child(${index + 1})`)
  if (!itemEl) return
  const elRect = el.getBoundingClientRect()
  const itemRect = itemEl.getBoundingClientRect()
  if (itemRect.top >= elRect.top && itemRect.bottom <= elRect.bottom) return
  animateScrollTop(el, el.scrollTop + (itemRect.bottom - elRect.bottom) + 20, dur)
}

function scrollToCurrentItem() {
  return scrollListToIndex(listEl.value, currentIndex.value, 500)
}

function scrollMobileToCurrentItem() {
  return scrollListToIndex(mobileListEl.value, currentIndex.value, 400)
}

watch(currentIndex, () => {
  scrollToCurrentItem()
  if (mobileListOpen.value) scrollMobileToCurrentItem()
})

const hideHeader = useState('hideHeader', () => false)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  hideHeader.value = isFullscreen.value
}

function handleFullscreenChange() {
  if (document.fullscreenElement) {
    if (!isFullscreen.value) { isFullscreen.value = true; hideHeader.value = true }
  } else {
    if (isFullscreen.value) { isFullscreen.value = false; hideHeader.value = false }
  }
}

function onSeekInput() { currentTime.value = seekValue.value }
function onSeekChange() { sharedSeek(seekValue.value) }

function seekForward() {
  const audioEl = getAudio()
  if (!audioEl || !duration.value) return
  const groups = groupedLyrics.value
  let newTime
  if (groups.length) {
    const nextIdx = currentLyricIndex.value + 1
    newTime = nextIdx < groups.length ? groups[nextIdx].time : duration.value
  } else {
    newTime = Math.min(audioEl.currentTime + 5, duration.value)
  }
  sharedSeek(newTime)
}

function seekBackward() {
  const audioEl = getAudio()
  if (!audioEl) return
  const groups = groupedLyrics.value
  let newTime
  if (groups.length) {
    const prevIdx = currentLyricIndex.value - 1
    newTime = prevIdx >= 0 ? groups[prevIdx].time : 0
  } else {
    newTime = Math.max(audioEl.currentTime - 5, 0)
  }
  sharedSeek(newTime)
}

function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00'
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  const m = Math.floor(sec / 60)
  return `${m}:${s}`
}

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

function handleKeydown(e) {
  if (isFullscreen.value) return
  if (e.ctrlKey || e.altKey || e.metaKey) return
  if (e.code === 'F11') { e.preventDefault(); toggleFullscreen(); return }
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); return }
  if (e.code === 'ArrowLeft') { e.preventDefault(); prev(); return }
  if (e.code === 'ArrowRight') { e.preventDefault(); next(); return }
  if (e.code === 'ArrowUp') { e.preventDefault(); seekBackward(); return }
  if (e.code === 'ArrowDown') { e.preventDefault(); seekForward(); return }
}

let autoPlayPending = false
let autoPlayAborted = false

function abandonAutoPlay() {
  if (!autoPlayPending) return
  autoPlayPending = false
  autoPlayAborted = true
  capsuleClosing.value = true
}

onBeforeRouteLeave(() => {
  abandonAutoPlay()
})

onMounted(async () => {
  attachPermanentListeners()
  setOnLyricChange(scrollLyrics)

  await loadList()
  await nextTick()

  if (autoPlayAborted) return
  if (!list.value?.length) return

  const audioEl = getAudio()
  if (!audioEl) return

  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  if (currentIndex.value >= 0 && currentItem.value) {
    seekValue.value = currentTime.value
    scrollToCurrentItem()
    if (lyrics.value?.length && currentLyricIndex.value >= 0) scrollLyrics()
    return
  }

  const idx = Math.floor(Math.random() * list.value.length)
  if (playMode.value === 'shuffle') sharedTogglePlayMode()

  autoPlayPending = true
  await sharedPlayIndex(idx, true)
  autoPlayPending = false
  if (autoPlayAborted) return
  scrollToCurrentItem()

  if (!isPlaying.value) {
    notification.show('自动播放被浏览器阻止，请点击播放按钮开始播放', 'warning', 10000, true)
  }
})

onBeforeUnmount(() => {
  abandonAutoPlay()
  if (autoPlayAborted) closeCapsule()
  cancelPendingPlay()
  cleanup()
  setOnLyricChange(null)

  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
/* 禁止封面图片拖动 */
.cover-wrap img {
  -webkit-user-drag: none;
  user-select: none;
}

.lyrics {
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
  touch-action: none;
}

.lyrics::-webkit-scrollbar {
  display: none;
}

/* 移动端歌曲列表动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 300ms cubic-bezier(.2,.8,.2,1), opacity 200ms;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>