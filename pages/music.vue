<template>
  <div v-fade-in class="h-screen pt-20 flex flex-col select-none">
    <div data-fade class="flex flex-1 min-h-0">
      <aside class="musicList w-65 overflow-y-auto relative" ref="listEl" @scroll="onScrollList">
        <ul class="space-y-2 p-1">
          <li
            v-for="(item, idx) in list || []"
            :key="item.musicFull || item.path || idx"
            @click="playIndex(idx)"
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

      <div class="flex-1 flex flex-col min-h-0 ml-1 rounded-lg bg-#fefefe dark:bg-white/10 transition-all duration-300">
        <div v-if="currentItem" class="mt-20 p-6 text-center">
          <div class="cover-wrap w-40 h-40 rounded-full overflow-hidden shadow-xl flex items-center justify-center mx-auto">
            <img
              v-if="currentItem.coverFull"
              :src="currentItem.coverFull"
              :alt="currentItem.title || 'cover'"
              class="block w-full h-full object-cover origin-center animate-spin"
              :style="{ animationPlayState: isPlaying ? 'running' : 'paused', animationDuration: '20s' }"
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
        <div
          class="lyrics flex-1 overflow-y-auto p-6 text-center"
          ref="lyricsEl"
          @wheel.prevent
          @touchmove.prevent
          @keydown.prevent
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
                  ? 'current text-#00e699 dark:text-#00e699 font-semibold scale-115'
                  : 'text-gray-600 dark:text-white'
              ]"
              :style="i === currentLyricIndex ? { filter: 'none' } : { filter: 'blur(1px)' }"
            >
              {{ line.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div data-fade class="my-4 py-4 flex flex-col items-center gap-3 rounded-lg bg-#fefefe dark:bg-white/10 transition-all duration-300" >
      <div class="flex items-center w-full text-sm gap-2">
        <span class="w-12 text-right">{{ formatTime(currentTime) }}</span>
        <input
          class="flex-1 h-1.5 rounded-full bg-gray/20 dark:bg-white/10 appearance-none cursor-pointer accent-gray dark:accent-white transition-color duration-300"
          type="range"
          min="0"
          :max="duration"
          step="0.1"
          v-model.number="seekValue"
          @input="onSeekInput"
          @change="onSeekChange"
          :style="{ background: `linear-gradient(to right, #00e699 0%, #00e699 ${seekValue/duration*100}%, #D9D9D9 ${seekValue/duration*100}%, #D9D9D9 100%)`}"
        />
        <span class="w-12">{{ formatTime(duration) }}</span>
      </div>

      <div class="flex justify-center gap-6">
        <button
          @click="prev"
          :disabled="!list?.length"
          class="px-5 py-2 rounded-full border border-white text-[#2f3f5b] dark:text-white transition-colors bg-transparent
                 shadow-[0_0_5px_rgba(47,63,91,1)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]
                 hover:scale-105 transition-transform transition-shadow duration-300"
        >
          上一首
        </button>
        <button
          @click="togglePlay"
          :disabled="!list?.length"
          class="px-5 py-2 rounded-full border border-white text-[#2f3f5b] dark:text-white transition-colors bg-transparent
                 shadow-[0_0_5px_rgba(47,63,91,1)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]
                 hover:scale-105 transition-transform transition-shadow duration-300"
        >
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <button
          @click="next"
          :disabled="!list?.length"
          class="px-5 py-2 rounded-full border border-white text-[#2f3f5b] dark:text-white transition-colors bg-transparent
                 shadow-[0_0_5px_rgba(47,63,91,1)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]
                 hover:scale-105 transition-transform transition-shadow duration-300"
        >
          下一首
        </button>
      </div>
    </div>

    <audio ref="audio" preload="metadata" autoplay></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, useHead } from '#imports'
import { musicConfig } from '../siteConfig/music'
import { siteConfig } from '../siteConfig/main'

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
const loading = ref(false)
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

// 加载列表
async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  return res.json()
}

async function loadList() {
  loading.value = true
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
  } finally {
    loading.value = false
  }
}

// 播放
function playIndex(i) {
  const audioEl = audio.value
  if (!audioEl) return
  const item = list.value?.[i]
  if (!item || !item.musicFull) return console.warn('no music url for item', i)

  if (currentIndex.value === i) {
    if (audioEl.paused) audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
    else { audioEl.pause(); isPlaying.value = false }
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
  if (!list.value || list.value.length === 0) return
  const idx = currentIndex.value > 0 ? currentIndex.value - 1 : list.value.length - 1
  playIndex(idx)
}

// 下一首
function next() {
  if (!list.value || list.value.length === 0) return
  const idx = (currentIndex.value + 1) % list.value.length
  playIndex(idx)
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

// 歌曲结束
function onEnded() {
  isPlaying.value = false
  next()
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

// 生命周期
onMounted(async () => {
  await loadList()
  await nextTick()
  const audioEl = audio.value
  if (audioEl) {
    audioEl.addEventListener('timeupdate', onTimeUpdate)
    audioEl.addEventListener('loadedmetadata', onLoadedMetadata)
    audioEl.addEventListener('ended', onEnded)
  }
  if (list.value && list.value.length > 0) {
    const idx = Math.floor(Math.random() * list.value.length)
    playIndex(idx)
  }
})

onBeforeUnmount(() => {
  const audioEl = audio.value
  if (audioEl) {
    audioEl.removeEventListener('timeupdate', onTimeUpdate)
    audioEl.removeEventListener('loadedmetadata', onLoadedMetadata)
    audioEl.removeEventListener('ended', onEnded)
  }
})
</script>

<style>
html {
  overflow-y: scroll;
  scrollbar-color: rgba(60, 60, 67, 0) transparent;
}

/* 滚动条样式 */
.musicList {
  scrollbar-width: thin;
  scrollbar-color: rgba(60, 60, 67, 0.4) transparent;
}

.lyrics {
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
}

.lyrics::-webkit-scrollbar {
  display: none;
}
</style>