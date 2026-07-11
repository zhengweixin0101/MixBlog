<template>
  <div v-if="!isFullscreen" v-fade-in class="h-screen pt-20 flex flex-col select-none">
    <div data-fade class="flex flex-1 min-h-0">
      <!-- 左侧列表 -->
      <aside class="musicList max-w-65 overflow-y-auto relative hidden md:block" ref="listEl">
        <!-- 加载中骨架屏 -->
        <ul v-if="isLoadingList" class="space-y-2 p-1">
          <li v-for="n in 6" :key="n" class="flex items-center p-2 py-3 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)]">
            <div class="w-6 h-6 flex items-center justify-center mr-2">
              <div class="w-4 h-4 rounded bg-gray/20 dark:bg-white/10 shimmer"></div>
            </div>
            <div class="min-w-0 flex-1 flex justify-between items-center">
              <div class="w-24 h-4 rounded bg-gray/20 dark:bg-white/10 shimmer"></div>
              <div class="w-16 h-3 rounded bg-gray/20 dark:bg-white/10 shimmer ml-2"></div>
            </div>
          </li>
        </ul>
        <!-- 列表为空 -->
        <div v-else-if="!list?.length" class="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
          暂无歌曲
        </div>
        <!-- 正常列表 -->
        <ul v-else class="space-y-2 p-1">
          <li
            v-for="(item, idx) in list"
            :key="item.musicFull || item.title || idx"
            @click="playIndex(idx, false, false)"
            :class="[
              'flex items-center p-2 py-3 rounded-lg cursor-pointer bg-#fefefe dark:bg-white/10 transition-all duration-300',
              idx === currentIndex
                ? 'shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]'
                : 'shadow-[0_0_2px_rgba(0,0,0,0.2)]'
            ]"
          >
            <div class="w-6 h-6 flex items-center justify-center text-xs font-semibold mr-2 text-gray-600 dark:text-gray-300">
              {{ idx + 1 }}
            </div>
            <div class="min-w-0 flex-1 flex justify-between items-center">
              <div class="transition-color duration-300 font-semibold truncate">{{ item.title }}</div>
              <div class="text-xs transition-color duration-300 truncate ml-2">
                {{ item.artist }}
              </div>
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右侧播放界面 -->
      <div class="flex-1 flex flex-col min-h-0 ml-1 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] transition-all duration-300">
        <!-- 加载中骨架屏 -->
        <div v-if="isLoadingList" class="mt-20 p-6 text-center">
          <div class="cover-wrap w-40 h-40 rounded-full overflow-hidden shadow-xl flex items-center justify-center mx-auto">
            <div class="w-full h-full rounded-full bg-gray/20 dark:bg-white/10 shimmer"></div>
          </div>
          <div class="mt-3 text-center w-full px-4 flex flex-col items-center gap-2">
            <div class="w-40 h-6 rounded bg-gray/20 dark:bg-white/10 shimmer"></div>
            <div class="w-24 h-4 rounded bg-gray/20 dark:bg-white/10 shimmer"></div>
          </div>
        </div>
        <!-- 正常播放信息 -->
        <div v-else-if="currentItem" class="mt-20 p-6 text-center">
          <div class="cover-wrap w-40 h-40 rounded-full overflow-hidden shadow-xl flex items-center justify-center mx-auto">
            <!-- 加载中骨架 -->
            <div v-if="isLoadingSong" class="w-full h-full rounded-full bg-gray/20 dark:bg-white/10 shimmer"></div>
            <!-- 正常封面 -->
            <img
              v-else-if="currentItem.coverBlobUrl"
              :src="currentItem.coverBlobUrl"
              :alt="currentItem.title || 'cover'"
              class="block w-full h-full object-cover origin-center animate-spin fade-in-image"
              :style="{ animationPlayState: isPlaying ? 'running' : 'paused', animationDuration: '40s' }"
              loading="lazy"
              draggable="false"
              onload="this.classList.add('onload-fade')"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-500">
              无封面
            </div>
          </div>
          <div class="mt-3 text-center w-full px-4">
            <!-- 歌名加载中 -->
            <div v-if="isLoadingSong" class="flex flex-col items-center gap-2">
              <div class="w-40 h-6 rounded bg-gray/20 dark:bg-white/10 shimmer mx-auto"></div>
              <div class="w-24 h-4 rounded bg-gray/20 dark:bg-white/10 shimmer mx-auto"></div>
            </div>
            <template v-else>
              <div class="text-6 font-bold truncate transition-color duration-300">{{ currentItem.title }}</div>
              <div class="text-sm transition-color duration-300 text-gray-600 dark:text-gray-300 truncate">
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
          @touchmove.prevent
          @keydown.prevent
        >
          <!-- 歌词加载中 -->
          <div v-if="isLoadingList" class="mt-20 space-y-2 flex flex-col items-center">
            <div v-for="n in 8" :key="n" class="w-48 h-4 rounded shimmer"
              :class="n === 1 ? 'w-36' : n === 4 ? 'w-40' : 'w-48'"
              :style="{ background: `linear-gradient(90deg, rgba(128,128,128,.06) 25%, rgba(128,128,128,.14) 50%, rgba(128,128,128,.06) 75%)`, backgroundSize: '200% 100%' }"></div>
          </div>
          <div v-else-if="isLoadingSong && !lyrics?.length" class="mt-20 space-y-2 flex flex-col items-center">
            <div v-for="n in 8" :key="n" class="w-48 h-4 rounded shimmer"
              :class="n === 1 ? 'w-36' : n === 4 ? 'w-40' : 'w-48'"
              :style="{ background: `linear-gradient(90deg, rgba(128,128,128,.06) 25%, rgba(128,128,128,.14) 50%, rgba(128,128,128,.06) 75%)`, backgroundSize: '200% 100%' }"></div>
          </div>
          <div v-else-if="!currentItem" class="mt-20">请选择歌曲播放</div>
          <div v-else-if="!lyrics?.length" class="mt-20">暂无歌词</div>
          <div v-else class="space-y-2">
            <div
              v-for="(line, i) in lyrics"
              :key="i"
              :class="[ 
                'lyric-line sm:text-5 transition-all duration-300',
                currentLyricIndices.includes(i)
                  ? 'current text-gradient font-semibold scale-115'
                  : 'text-gray-600 dark:text-white'
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

        <div class="hidden md:block absolute bottom-1 right-2 cursor-pointer opacity-50" @click="toggleFullscreen"> 
          <i class="text-lg iconfont icon-quanping"></i>
        </div>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div
      data-fade
      class="my-4 p-5 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] duration-300"
    >
      <!-- 移动端 -->
      <div class="md:hidden flex flex-col gap-3">
        <!-- 进度条 -->
        <div class="w-full flex items-center gap-2">
          <span class="text-xs w-10 text-right">{{ formatTime(currentTime) }}</span>
          <input
            class="flex-1 h-1.5 rounded-full bg-gray/20 dark:bg-white/10 appearance-none cursor-pointer accent-gray dark:accent-white"
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
            :style="{ background: `linear-gradient(to right, #00e699 0%, #00e699 ${duration ? (seekValue/duration*100) : 0}%, #D9D9D9 ${duration ? (seekValue/duration*100) : 0}%, #D9D9D9 100%)` }"
          />
          <span class="text-xs w-10">{{ formatTime(duration) }}</span>
        </div>

        <!-- 按钮 -->
        <div class="w-full flex items-center justify-between px-2">
          <!-- 左侧列表 -->
          <div class="flex items-center gap-2">
            <button @click="musicList" :disabled="!list?.length" class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <i class="iconfont icon-liebiao"></i>
            </button>
          </div>

          <!-- 中间控制 -->
          <div class="flex items-center gap-4">
            <button @click="prev" :disabled="!list?.length" class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <i class="iconfont icon-backward"></i>
            </button>

            <button @click="togglePlay" :disabled="!list?.length" class="p-3 rounded-full bg-#00e699 text-white shadow-[0_0_2px_rgba(0,0,0,0.2)] appearance-none border-none cursor-pointer transition-all">
              <i :class="isPlaying ? 'iconfont icon-pause' : 'iconfont icon-play'"></i>
            </button>

            <button @click="next" :disabled="!list?.length" class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <i class="iconfont icon-forward"></i>
            </button>
          </div>

          <!-- 右侧功能 -->
          <div class="flex items-center gap-2">
            <button @click="togglePlayMode" class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <i :class="{
                'iconfont icon-repeat': playMode === 'loop',
                'iconfont icon-repeat-1': playMode === 'single',
                'iconfont icon-shuffle1': playMode === 'shuffle'
              }"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 桌面端 -->
      <div class="hidden md:flex items-center gap-4 flex-wrap justify-between">
        <!-- 左侧播放控制 -->
        <div class="flex items-center gap-4">
          <button @click="prev" :disabled="!list?.length" class="text-#2f3f5b dark:text-white hover:opacity-50 dark:hover:opacity-100 dark:hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-all">
            <i class="iconfont icon-backward"></i>
          </button>

          <button @click="togglePlay" :disabled="!list?.length" class="text-#2f3f5b dark:text-white hover:opacity-50 dark:hover:opacity-100 dark:hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-all">
            <i :class="isPlaying ? 'iconfont icon-pause' : 'iconfont icon-play'"></i>
          </button>

          <button @click="next" :disabled="!list?.length" class="text-#2f3f5b dark:text-white hover:opacity-50 dark:hover:opacity-100 dark:hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-all">
            <i class="iconfont icon-forward"></i>
          </button>
        </div>

        <!-- 进度条 -->
        <div class="flex-1 flex items-center gap-2 mx-2 min-w-[200px]">
          <span class="text-xs w-10 text-right">{{ formatTime(currentTime) }}</span>
          <input
            class="flex-1 h-1.5 rounded-full bg-gray/20 dark:bg-white/10 appearance-none cursor-pointer accent-gray dark:accent-white"
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
            :style="{ background: `linear-gradient(to right, #00e699 0%, #00e699 ${seekValue/duration*100}%, #D9D9D9 ${seekValue/duration*100}%, #D9D9D9 100%)` }"
          />
          <span class="text-xs w-10">{{ formatTime(duration) }}</span>
        </div>

        <!-- 右侧功能 -->
        <div class="flex items-center gap-4">
          <button @click="togglePlayMode" class="text-#2f3f5b dark:text-white hover:opacity-50 dark:hover:opacity-100 dark:hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-all">
            <i :class="{
              'iconfont icon-repeat': playMode === 'loop',
              'iconfont icon-repeat-1': playMode === 'single',
              'iconfont icon-shuffle1': playMode === 'shuffle'
            }"></i>
          </button>

          <button @click="toggleMute" class="text-#2f3f5b dark:text-white hover:opacity-50 dark:hover:opacity-100 dark:hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-all">
            <i :class="muted ? 'iconfont icon-volumeCross' : 'iconfont icon-volumeHigh'"></i>
          </button>

          <button
            v-if="currentItem?.musicFull"
            @click="downloadMusic"
            class="text-#2f3f5b dark:text-white hover:opacity-50 dark:hover:opacity-100 dark:hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-all"
          >
            <i class="iconfont icon-download"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 移动端歌曲列 -->
  <div class="fixed inset-0 z-50 md:hidden select-none" :class="{ 'pointer-events-none': !mobileListOpen }" aria-hidden="true">
    <transition name="fade">
      <div v-show="mobileListOpen" class="absolute inset-0 bg-black/50 backdrop-blur" @click="closeMobileList"></div>
    </transition>

    <transition name="slide-up">
      <aside
        ref="mobileListEl"
        v-show="mobileListOpen"
        class="fixed bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)]
               bg-#fefefe/80 dark:bg-#1a1a1a/70 backdrop-blur-lg text-gray-800 dark:text-gray-100 rounded-t-lg"
      >
        <!-- 加载中骨架屏 -->
        <ul v-if="isLoadingList" class="space-y-2 p-3">
          <li v-for="n in 6" :key="n" class="flex items-center p-2 py-3 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)]">
            <div class="w-6 h-6 flex items-center justify-center mr-2">
              <div class="w-4 h-4 rounded bg-gray/20 dark:bg-white/10 shimmer"></div>
            </div>
            <div class="min-w-0 flex-1 flex justify-between items-center">
              <div class="w-24 h-4 rounded bg-gray/20 dark:bg-white/10 shimmer"></div>
              <div class="w-16 h-3 rounded bg-gray/20 dark:bg-white/10 shimmer ml-2"></div>
            </div>
          </li>
        </ul>
        <!-- 列表为空 -->
        <div v-else-if="!list?.length" class="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500 text-sm">
          暂无歌曲
        </div>
        <!-- 正常列表 -->
        <ul v-else class="space-y-2 p-3">
          <li
            v-for="(item, idx) in list"
            :key="item.musicFull || item.title || idx"
            @click="selectMobile(idx)"
            :class="[
              'flex items-center p-2 py-3 rounded-lg cursor-pointer bg-#fefefe dark:bg-white/10 transition-all duration-300',
              idx === currentIndex
                ? 'shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]'
                : 'shadow-[0_0_2px_rgba(0,0,0,0.2)]'
            ]"
          >
            <div class="w-6 h-6 flex items-center justify-center text-xs font-semibold mr-2 text-gray-600 dark:text-gray-300">
              {{ idx + 1 }}
            </div>
            <div class="min-w-0 flex-1 flex justify-between items-center">
              <div class="transition-color duration-300 font-semibold truncate">{{ item.title }}</div>
              <div class="text-sm transition-color duration-300 truncate ml-2">
                {{ item.artist }}
              </div>
            </div>
          </li>
        </ul>
      </aside>
    </transition>
  </div>

</template>

<script setup>
import { siteConfig } from '../siteConfig/main'

import { useNotification } from '~/composables/useNotification'
const notification = useNotification()

usePageMeta('Music', `This is the music page of ${siteConfig.title}.`, '/music', '音乐,Music')

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
  cleanup, getAudio, attachPermanentListeners, setOnLyricChange, setOnPlayIndex,
} = useMusicPlayer()

const seekValue = ref(0)
const isSeeking = ref(false)
const lyricsEl = ref(null)
const listEl = ref(null)
const isFullscreen = useState('showMusicFullscreen', () => false)
const mobileListOpen = ref(false)
const mobileListEl = ref(null)

watch(currentTime, (v) => { if (!isSeeking.value) seekValue.value = v })

async function playIndex(i, forcePlay = false, shouldScroll = true) {
  seekValue.value = 0
  await sharedPlayIndex(i, forcePlay)
  if (shouldScroll) {
    scrollToCurrentItem()
    if (mobileListOpen.value) scrollMobileToCurrentItem().catch(() => {})
  }
}

function togglePlay() {
  sharedTogglePlay()
  pausedOnMusicPage.value = !isPlaying.value
}
function prev() { sharedPrev() }
function next() { sharedNext(false) }
function togglePlayMode() { sharedTogglePlayMode() }
function toggleMute() { sharedToggleMute() }
function downloadMusic() { sharedDownloadMusic() }

function musicList() {
  if (!list.value?.length) return
  mobileListOpen.value = !mobileListOpen.value
  if (mobileListOpen.value) {
    nextTick().then(() => { scrollMobileToCurrentItem().catch(() => {}) })
  }
}

function closeMobileList() { mobileListOpen.value = false }

function selectMobile(idx) {
  playIndex(idx, false, true)
  closeMobileList()
}

async function scrollMobileToCurrentItem() {
  const el = mobileListEl.value
  if (!el || currentIndex.value < 0) return
  await nextTick()
  const currentItemEl = el.querySelector(`li:nth-child(${currentIndex.value + 1})`)
  if (!currentItemEl) return
  const elRect = el.getBoundingClientRect()
  const itemRect = currentItemEl.getBoundingClientRect()
  if (itemRect.top >= elRect.top && itemRect.bottom <= elRect.bottom) return
  const target = el.scrollTop + (itemRect.bottom - elRect.bottom) + 20
  const start = el.scrollTop
  const distance = target - start
  const dur = 400
  const startTime = performance.now()
  function animate(now) {
    const progress = Math.min((now - startTime) / dur, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.scrollTop = start + distance * ease
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

watch(currentIndex, async () => {
  if (mobileListOpen.value) {
    await nextTick()
    scrollMobileToCurrentItem().catch(() => {})
  }
})

const hideHeader = useState('hideHeader', () => false)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  hideHeader.value = isFullscreen.value
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

async function scrollToCurrentItem() {
  const listElement = listEl.value
  if (!listElement || currentIndex.value < 0) return
  await nextTick()
  const currentItemEl = listElement.querySelector(`li:nth-child(${currentIndex.value + 1})`)
  if (!currentItemEl) return
  const listRect = listElement.getBoundingClientRect()
  const itemRect = currentItemEl.getBoundingClientRect()
  if (itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom) return
  const target = listElement.scrollTop + (itemRect.bottom - listRect.bottom) + 20
  const start = listElement.scrollTop
  const distance = target - start
  const dur = 500
  const startTime = performance.now()
  function animate(now) {
    const progress = Math.min((now - startTime) / dur, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    listElement.scrollTop = start + distance * ease
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

function handleKeydown(e) {
  if (e.ctrlKey || e.altKey || e.metaKey) return
  if (e.code === 'Space') { e.preventDefault(); togglePlay(); return }
  if (e.code === 'ArrowLeft') { e.preventDefault(); prev(); return }
  if (e.code === 'ArrowRight') { e.preventDefault(); next(); return }
  if (e.code === 'ArrowUp') { e.preventDefault(); seekBackward(); return }
  if (e.code === 'ArrowDown') { e.preventDefault(); seekForward(); return }
}

onMounted(async () => {
  attachPermanentListeners()
  setOnLyricChange(scrollLyrics)
  setOnPlayIndex(() => { scrollToCurrentItem(); if (mobileListOpen.value) scrollMobileToCurrentItem().catch(() => {}) })

  await loadList()
  await nextTick()

  if (!list.value?.length) return

  const audioEl = getAudio()
  if (!audioEl) return

  document.addEventListener('keydown', handleKeydown)

  if (currentIndex.value >= 0 && currentItem.value) {
    seekValue.value = currentTime.value
    scrollToCurrentItem()
    if (lyrics.value?.length && currentLyricIndex.value >= 0) scrollLyrics()
    return
  }

  const idx = Math.floor(Math.random() * list.value.length)
  if (playMode.value === 'shuffle') sharedTogglePlayMode()

  await sharedPlayIndex(idx, true)
  scrollToCurrentItem()

  audioEl.play().then(() => {
    isPlaying.value = true
  }).catch(() => {
    notification.show('自动播放被浏览器阻止，请点击播放按钮开始播放', 'warning', 10000, true)
  })
})

onBeforeUnmount(() => {
  cleanup()
  setOnLyricChange(null)
  setOnPlayIndex(null)

  document.removeEventListener('keydown', handleKeydown)
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
}

.lyrics::-webkit-scrollbar {
  display: none;
}

/* 骨架屏闪烁动画 */
.shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, rgba(128,128,128,.08) 25%, rgba(128,128,128,.18) 50%, rgba(128,128,128,.08) 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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