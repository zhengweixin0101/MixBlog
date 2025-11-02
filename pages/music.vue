<template>
  <div v-if="!isFullscreen" v-fade-in class="h-screen pt-20 flex flex-col select-none">
    <div data-fade class="flex flex-1 min-h-0">
      <!-- 左侧列表 -->
      <aside class="musicList w-65 overflow-y-auto relative hidden md:block" ref="listEl" @scroll="onScrollList">
        <ul class="space-y-2 p-1">
          <li
            v-for="(item, idx) in list || []"
            :key="item.musicFull || item.path || idx"
            @click="playIndex(idx, false, false)"
            :class="[ 
              'flex items-center p-2 rounded-lg cursor-pointer bg-#fefefe dark:bg-white/10 transition-all duration-300',
              idx === currentIndex
                ? 'shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]'
                : 'shadow-[0_0_2px_rgba(0,0,0,0.2)]'
            ]"
          >
            <img
              v-if="item.coverFull"
              :src="item.coverFull"
              class="w-12 h-12 rounded-md mr-3 object-cover"
            />
            <div class="min-w-0 flex-1">
              <div class="transition-color duration-300 font-semibold truncate ">{{ item.title }}</div>
              <div class="text-sm transition-color duration-300 truncate">
                {{ item.artist }}<span v-if="item.album"> - {{ item.album }}</span>
              </div>
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右侧播放界面 -->
      <div class="flex-1 flex flex-col min-h-0 ml-1 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] transition-all duration-300">
        <div v-if="currentItem" class="mt-20 p-6 text-center">
          <div class="cover-wrap w-40 h-40 rounded-full overflow-hidden shadow-xl flex items-center justify-center mx-auto">
            <img
              v-if="currentItem.coverFull"
              :src="currentItem.coverFull"
              :alt="currentItem.title || 'cover'"
              class="block w-full h-full object-cover origin-center animate-spin"
              :style="{ animationPlayState: isPlaying ? 'running' : 'paused', animationDuration: '40s' }"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-sm text-gray-500">
              无封面
            </div>
          </div>
          <div class="mt-3 text-center w-full px-4">
            <div class="text-6 font-bold truncate transition-color duration-300">{{ currentItem.title }}</div>
            <div class="text-sm transition-color duration-300 text-gray-600 dark:text-gray-300 truncate">
              {{ currentItem.artist }}<span v-if="currentItem.album"> - {{ currentItem.album }}</span>
            </div>
          </div>
        </div>

        <!-- 歌词 -->
        <div
          class="lyrics flex-1 overflow-y-auto p-6 text-center"
          ref="lyricsEl"
          tabindex="-1"
        >
          <div v-if="!currentItem" class="mt-20">请选择歌曲播放</div>
          <div v-else-if="!lyrics?.length" class="mt-20">暂无歌词</div>
          <div v-else class="space-y-2">
            <div
              v-for="(line, i) in lyrics"
              :key="i"
              :class="[ 
                'lyric-line text-5 transition-all duration-300',
                i === currentLyricIndex
                  ? 'current text-gradient font-semibold scale-115'
                  : 'text-gray-600 dark:text-white'
              ]"
              :style="i === currentLyricIndex ? { filter: 'none' } : { filter: 'blur(1.5px)' }"
            >
              {{ line.text }}
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
            <button @click="togglePlayMode" class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <i :class="{
                'iconfont icon-repeat': playMode === 'loop',
                'iconfont icon-repeat-1': playMode === 'single',
                'iconfont icon-shuffle1': playMode === 'shuffle'
              }"></i>
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
            <button @click="toggleMute" class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all">
              <i :class="muted ? 'iconfont icon-16gf-volumeCross' : 'iconfont icon-20gf-volumeHigh'"></i>
            </button>

            <button
              v-if="currentItem?.musicFull"
              @click="downloadMusic"
              class="p-2 rounded-full text-#2f3f5b dark:text-white hover:bg-gray/10 dark:hover:bg-white/5 appearance-none bg-transparent border-none cursor-pointer transition-all"
            >
              <i class="iconfont icon-download"></i>
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
            <i :class="muted ? 'iconfont icon-16gf-volumeCross' : 'iconfont icon-20gf-volumeHigh'"></i>
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

  <!-- 全屏模式 -->
  <div v-if="isFullscreen" class="fixed inset-0 flex overflow-hidden select-none 2xl:px-80">
    <!-- 背景 -->
    <div
      class="absolute inset-0"
      :style="{
        backgroundImage: `url(${currentItem.coverFull})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(30px) brightness(0.3)',
        zIndex: 0
      }"
    ></div>
    <div class="absolute inset-0 bg-black/40 z-0"></div>

    <div class="relative z-10 w-2/5 flex flex-col items-center justify-center p-6 gap-6 text-center text-white">
      <!-- 封面 -->
      <div class="cover-wrap w-50 h-50 lg:w-60 lg:h-60 2xl:w-78 2xl:h-78 rounded-full overflow-hidden shadow-2xl flex items-center justify-center">
        <img
          v-if="currentItem?.coverFull"
          :src="currentItem.coverFull"
          :alt="currentItem.title || 'cover'"
          class="w-full h-full object-cover animate-spin"
          :style="{ animationPlayState: isPlaying ? 'running' : 'paused', animationDuration: '35s' }"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
          无封面
        </div>
      </div>

      <!-- 歌曲信息 -->
      <div class="text-center">
        <div class="text-3xl 2xl:text-4xl font-bold truncate">{{ currentItem?.title }}</div>
        <div class="text-md 2xl:text-xl opacity-80 truncate mt-1">
          {{ currentItem?.artist }}<span v-if="currentItem?.album"> - {{ currentItem.album }}</span>
        </div>
      </div>

      <!-- 播放控件 -->
      <div class="flex items-center gap-6 mt-4">
        <button @click="prev" :disabled="!list?.length" class="text-white hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-color">
          <i class="text-5 iconfont icon-backward"></i>
        </button>

        <button @click="togglePlay" :disabled="!list?.length" class="text-white hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-color">
          <i class="text-5 iconfont" :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
        </button>

        <button @click="next" :disabled="!list?.length" class="text-white hover:text-#00e699 appearance-none bg-transparent border-none cursor-pointer transition-color">
          <i class="text-5 iconfont icon-forward"></i>
        </button>
      </div>
    </div>

    <!-- 歌词 -->
    <div
      class="lyrics flex-1 overflow-y-auto py-78 text-center"
      ref="lyricsEl"
      tabindex="-1"
    >
      <div v-if="!currentItem" class="mt-20">请选择歌曲播放</div>
      <div v-else-if="!lyrics?.length" class="mt-20">暂无歌词</div>
      <div v-else class="space-y-5">
        <div
          v-for="(line, i) in lyrics"
          :key="i"
          :class="[ 
            'lyric-line text-5 lg:text-6 2xl:text-7 transition-all duration-300',
            i === currentLyricIndex
              ? 'current text-gradient font-semibold scale-130'
              : 'text-white'
          ]"
          :style="i === currentLyricIndex ? { filter: 'none' } : { filter: 'blur(1.5px)' }"
        >
          {{ line.text }}
        </div>
      </div>
    </div>
  </div>

  <audio ref="audio" preload="metadata" autoplay></audio>
</template>

<script setup>
import { musicConfig } from '../siteConfig/music'
import { siteConfig } from '../siteConfig/main'

import { useNotification } from '~/composables/useNotification'
const notification = useNotification()

//head
useHead({
  titleTemplate: `Music | ${siteConfig.title}`,
  meta: [
    { name: 'description', content: `This is the music page of ${siteConfig.title}.` },
    { name: 'keywords', content: `${siteConfig.keywords},音乐,Music` },
    { property: 'og:title', content: `Music | ${siteConfig.title}` },
    { property: 'og:description', content: `This is the music page of ${siteConfig.title}.` },
    { property: 'og:url', content: `${siteConfig.url}/music` },
    { name: 'twitter:title', content: `Music | ${siteConfig.title}` },
    { name: 'twitter:description', content: `This is the music page of ${siteConfig.title}.` },
  ],
})

definePageMeta({
  hideFooter: true
})

// 拼接 URL
function joinUrl(base, path) {
  if (!base) return path || ''
  if (!path) return base || ''
  const b = String(base).replace(/\/+$/, '')
  const p = String(path).replace(/^\/+/, '')
  return b + '/' + p
}

// 状态
const list = ref([])
const error = ref('')
const currentIndex = ref(-1)
const currentItem = computed(() => (currentIndex.value >= 0 ? list.value?.[currentIndex.value] || null : null))

const audio = ref(null)
const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const seekValue = ref(0)
const lyrics = ref([])
const currentLyricIndex = ref(-1)
const lyricsEl = ref(null)
const listEl = ref(null)
const shuffleList = ref([])
const shuffleIndex = ref(0)
const isFullscreen = ref(false)

// 切换全屏模式
const hideHeader = useState('hideHeader', () => false)

async function toggleFullscreen() {
  if (!isFullscreen.value) {
    await document.documentElement.requestFullscreen()
    hideHeader.value = true
    isFullscreen.value = true

    if (lyrics.value?.length && currentLyricIndex.value >= 0) {
      await nextTick()
      scrollLyrics()
    }
  } else {
    await document.exitFullscreen()
    hideHeader.value = false
    isFullscreen.value = false

    if (lyrics.value?.length && currentLyricIndex.value >= 0) {
      await nextTick()
      scrollLyrics()
    }
  }
}

function handleFullscreenChange() {
  if (!document.fullscreenElement) {
    hideHeader.value = false
    isFullscreen.value = false
  }
}

watch(isFullscreen, async (val) => {
  await nextTick()
  if (!val && list.value?.length) {
    scrollToCurrentItem()
  }
  if (lyrics.value?.length && currentLyricIndex.value >= 0) {
    scrollLyrics()
  }
})

// 加载列表
async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  return res.json()
}

async function loadList() {
  error.value = ''
  try {
    const listUrl = joinUrl(musicConfig.listFile.basic, musicConfig.listFile.path)
    const remote = await fetchJson(listUrl)
    if (!Array.isArray(remote)) throw new Error('music list json should be an array')
    const enriched = await Promise.all(remote.map(async (item) => {
      try {
        const infoUrl = joinUrl(musicConfig.listFile.basic, item.path)
        const info = await fetchJson(infoUrl)
        const musicFull = info.music_path ? joinUrl(musicConfig.listFile.basic, info.music_path) : ''
        const lyricsFull = info.lyrics_path ? joinUrl(musicConfig.listFile.basic, info.lyrics_path) : ''
        const coverFull = info.cover_path ? joinUrl(musicConfig.listFile.basic, info.cover_path) : ''
        return { ...info, musicFull, lyricsFull, coverFull }
      } catch (e) {
        return { title: item.title || '', artist: item.artist || '', musicFull: '', coverFull: '', _error: e.message }
      }
    }))
    list.value = Array.isArray(enriched) ? enriched : []
  } catch (e) {
    error.value = e.message || String(e)
    list.value = []
  }
}

await loadList()

// 播放
function playIndex(i, forcePlay = false, shouldScroll = true) {
  const audioEl = audio.value
  if (!audioEl) return
  const item = list.value?.[i]
  if (!item || !item.musicFull) return console.warn('no music url for item', i)

  if (currentIndex.value === i && !forcePlay) {
    if (playMode.value === 'single') {
      currentIndex.value = i
      audioEl.src = item.musicFull
      lyrics.value = []
      currentLyricIndex.value = -1
      seekValue.value = 0
      currentTime.value = 0
      loadLyrics(item).catch(console.warn)
      audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
    } else {
      if (audioEl.paused) audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
      else { audioEl.pause(); isPlaying.value = false }
    }
    return
  }

  currentIndex.value = i
  audioEl.src = item.musicFull
  lyrics.value = []
  currentLyricIndex.value = -1
  seekValue.value = 0
  currentTime.value = 0
  loadLyrics(item).catch(console.warn)
  audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
  
  if (shouldScroll) {
    scrollToCurrentItem()
  }
}

// 播放/暂停
function togglePlay() {
  const audioEl = audio.value
  if (!audioEl) return
  if (audioEl.paused) audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
  else { audioEl.pause(); isPlaying.value = false }
}

// 上一首
function prev() {
  if (!list.value?.length) return;

  let idx = currentIndex.value;

  if (playMode.value === 'single') {
    idx = currentIndex.value > 0 ? currentIndex.value - 1 : list.value.length - 1;
  } else if (playMode.value === 'shuffle') {
    if (!shuffleList.value.length) generateShuffleList();
    shuffleIndex.value =
      (shuffleIndex.value - 1 + shuffleList.value.length) % shuffleList.value.length;
    idx = shuffleList.value[shuffleIndex.value];
  } else {
    idx = currentIndex.value > 0 ? currentIndex.value - 1 : list.value.length - 1;
  }

  playIndex(idx);
}

// 下一首
function next(auto = false) {
  if (!list.value?.length) return;

  let idx = currentIndex.value;

  if (playMode.value === 'single') {
    if (auto) {
      idx = currentIndex.value;
    } else {
      idx = (currentIndex.value + 1) % list.value.length;
    }
  } else if (playMode.value === 'shuffle') {
    if (!shuffleList.value.length) generateShuffleList();
    shuffleIndex.value = (shuffleIndex.value + 1) % shuffleList.value.length;
    idx = shuffleList.value[shuffleIndex.value];
  } else {
    idx = (currentIndex.value + 1) % list.value.length;
  }

  playIndex(idx);

  if (!auto && audio.value) audio.value.play().catch(console.warn);
}

function onEnded() {
  next(true)
}

// 播放模式：loop（循环播放）/ single（单曲循环）/ shuffle（随机播放）
const playMode = ref('loop')

function togglePlayMode() {
  if (playMode.value === 'loop') {
    playMode.value = 'shuffle'
    generateShuffleList()
    notification.show(`已切换到随机播放模式`)
  } else if (playMode.value === 'shuffle') {
    playMode.value = 'single'
    notification.show(`已切换到单曲循环模式`)
  } else {
    playMode.value = 'loop'
    notification.show(`已切换到循环播放模式`)
  }
}

// 生成随机列表
function generateShuffleList() {
  if (!list.value?.length) return;

  const indices = list.value.map((_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  shuffleIndex.value = currentIndex.value >= 0 ? indices.indexOf(currentIndex.value) : 0;

  shuffleList.value = indices;
}

// 音量控制
const muted = ref(false)
function toggleMute() {
  if (audio.value) audio.value.muted = muted.value = !muted.value
}

// 下载歌曲
function downloadMusic() {
  const item = currentItem.value
  if (!item?.musicFull) return
  const link = document.createElement('a')
  link.href = item.musicFull
  link.download = `${item.title || 'music'}.mp3`
  document.body.appendChild(link)
  link.click()
  link.remove()
  notification.show(`已尝试下载，请注意查看！`)
}

// 加载歌词
async function loadLyrics(item) {
  if (!item || !item.lyricsFull) return
  try {
    const raw = await fetch(item.lyricsFull).then(r => r.text())
    lyrics.value = parseLRC(raw)
  } catch {
    lyrics.value = []
  }
}

function parseLRC(text) {
  if (!text) return []
  const lines = text.split(/\r?\n/)
  const res = []
  const timeTagRe = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/g
  for (const line of lines) {
    let match
    let lastIndex = 0
    const texts = line.replace(/\uFEFF/g, '')
    timeTagRe.lastIndex = 0
    const times = []
    while ((match = timeTagRe.exec(texts)) !== null) {
      const mm = parseInt(match[1], 10)
      const ss = parseFloat(match[2])
      times.push(mm * 60 + ss)
      lastIndex = timeTagRe.lastIndex
    }
    const content = texts.slice(lastIndex).trim()
    for (const t of times) res.push({ time: t, text: content })
  }
  return res.sort((a,b) => a.time - b.time)
}

// 时间更新
function onTimeUpdate() {
  const audioEl = audio.value
  if (!audioEl) return
  currentTime.value = audioEl.currentTime
  seekValue.value = audioEl.currentTime

  if (lyrics.value && lyrics.value.length > 0) {
    const t = audioEl.currentTime
    let i = 0
    for (let j = lyrics.value.length - 1; j >= 0; j--) {
      if (t >= lyrics.value[j].time) { 
        i = j
        break
      }
    }
    if (i !== currentLyricIndex.value) { 
      currentLyricIndex.value = i
      scrollLyrics() 
    }
  }
}

// 播放元数据加载完成
function onLoadedMetadata() {
  const audioEl = audio.value
  if (!audioEl) return
  duration.value = audioEl.duration || 0
}

// 进度条
function onSeekInput() { currentTime.value = seekValue.value }
function onSeekChange() { if(audio.value) audio.value.currentTime = seekValue.value }

// 格式化时间
function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00'
  const s = Math.floor(sec % 60).toString().padStart(2,'0')
  const m = Math.floor(sec / 60)
  return `${m}:${s}`
}

// 歌词滚动
let scrollTimer = null

async function scrollLyrics() {
  const el = lyricsEl.value
  if (!el) return
  await nextTick()

  const cur = el.querySelector('.lyric-line.current')
  if (!cur) return

  const elRect = el.getBoundingClientRect()
  const curRect = cur.getBoundingClientRect()
  const target = el.scrollTop + (curRect.top - elRect.top) - (el.clientHeight / 2 - cur.offsetHeight / 2)

  const start = el.scrollTop
  const distance = target - start
  const duration = 700
  const startTime = performance.now()

  if (scrollTimer) cancelAnimationFrame(scrollTimer)

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    el.scrollTop = start + distance * ease
    if (progress < 1) scrollTimer = requestAnimationFrame(animate)
  }

  scrollTimer = requestAnimationFrame(animate)
}

// 音乐列表滚动
async function scrollToCurrentItem() {
  const listElement = listEl.value
  if (!listElement || currentIndex.value < 0) return
  
  await nextTick()
  
  const currentItemEl = listElement.querySelector(`li:nth-child(${currentIndex.value + 1})`)
  if (!currentItemEl) return
  
  const listRect = listElement.getBoundingClientRect()
  const itemRect = currentItemEl.getBoundingClientRect()
  const isVisible = itemRect.top >= listRect.top && itemRect.bottom <= listRect.bottom

  if (isVisible) return
  
  const target = listElement.scrollTop + (itemRect.bottom - listRect.bottom) + 20
  
  const start = listElement.scrollTop
  const distance = target - start
  const duration = 500
  const startTime = performance.now()
  
  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    listElement.scrollTop = start + distance * ease
    if (progress < 1) requestAnimationFrame(animate)
  }
  
  requestAnimationFrame(animate)
}

onMounted(async () => {
  await loadList()
  await nextTick()

  if (!list.value?.length) return
  let idx = Math.floor(Math.random() * list.value.length)
  if (playMode.value === 'shuffle') generateShuffleList()

  const audioEl = audio.value
  if (!audioEl) return

  audioEl.addEventListener('timeupdate', onTimeUpdate)
  audioEl.addEventListener('loadedmetadata', onLoadedMetadata)
  audioEl.addEventListener('ended', onEnded)

  const lyricsElement = lyricsEl.value
  if (lyricsElement) {
    const preventScroll = (e) => e.preventDefault()
    lyricsElement.addEventListener('wheel', preventScroll, { passive: false })
    lyricsElement.addEventListener('touchmove', preventScroll, { passive: false })
    lyricsElement.addEventListener('keydown', preventScroll)
  }

  const item = list.value[idx]
  currentIndex.value = idx
  await loadLyrics(item)

  audioEl.src = item.musicFull
  audioEl.load()

  scrollToCurrentItem()

  document.addEventListener('fullscreenchange', handleFullscreenChange)

  audioEl.play().then(() => {
    isPlaying.value = true
  }).catch(() => {
    console.warn('首次自动播放被阻止，需要用户交互')
  })
})

onBeforeUnmount(() => {
  const audioEl = audio.value
  if (audioEl) {
    audioEl.removeEventListener('timeupdate', onTimeUpdate)
    audioEl.removeEventListener('loadedmetadata', onLoadedMetadata)
    audioEl.removeEventListener('ended', onEnded)
  }
  
  const lyricsElement = lyricsEl.value
  if (lyricsElement) {
    const preventScroll = (e) => e.preventDefault()
    lyricsElement.removeEventListener('wheel', preventScroll)
    lyricsElement.removeEventListener('touchmove', preventScroll)
    lyricsElement.removeEventListener('keydown', preventScroll)
  }
  
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.lyrics {
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
}

.lyrics::-webkit-scrollbar {
  display: none;
}
</style>