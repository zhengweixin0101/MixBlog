import { ref } from 'vue'
import { musicConfig } from '../siteConfig/music'
import { useNotification } from './useNotification'

function joinUrl(base, path) {
  if (!base) return path || ''
  if (!path) return base || ''
  const b = String(base).replace(/\/+$/, '')
  const p = String(path).replace(/^\/+/, '')
  return b + '/' + p
}

function safeName(s) {
  return s.replace(/\//g, '_').replace(/\\/g, '_').trim()
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
    if (content) {
      for (const t of times) res.push({ time: t, text: content })
    }
  }

  const sorted = res.sort((a, b) => a.time - b.time)
  const merged = []
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]
    const sameTimeLyrics = [current.text]
    while (i + 1 < sorted.length && Math.abs(sorted[i + 1].time - current.time) < 0.01) {
      i++
      const nextText = sorted[i].text
      if (!sameTimeLyrics.includes(nextText)) {
        sameTimeLyrics.push(nextText)
      }
    }
    merged.push({ time: current.time, text: sameTimeLyrics })
  }
  return merged
}

const list = ref([])
const isLoadingList = ref(true)
const error = ref('')
const currentIndex = ref(-1)
const currentItem = ref(null)
const isPlaying = ref(false)
const isLoadingSong = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const lyrics = ref([])
const groupedLyrics = ref([])
const currentLyricIndex = ref(-1)
const currentLyricIndices = ref([])
const playMode = ref('loop')
const muted = ref(false)
const shuffleList = ref([])
const shuffleIndex = ref(0)
const pausedOnMusicPage = ref(false)

let currentCoverBlobUrl = null
let _audio = null
let _permanentListenersAttached = false
let _pageListenersAttached = false
let _onLyricChange = null

function getAudio() {
  if (typeof document === 'undefined') return null
  if (!_audio) {
    _audio = document.createElement('audio')
    _audio.preload = 'metadata'
    _audio.autoplay = false
  }
  return _audio
}

function derivePaths(item) {
  const key = safeName(`${item.title}-${item.artist}`)
  return {
    musicFull: joinUrl(musicConfig.basic, `music/${key}.flac`),
    binFull: joinUrl(musicConfig.basic, `meta/${key}.bin`),
  }
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`)
  return res.json()
}

async function loadList() {
  isLoadingList.value = true
  error.value = ''
  try {
    const listUrl = joinUrl(musicConfig.basic, 'music_list.json')
    const remote = await fetchJson(listUrl)
    if (!Array.isArray(remote)) throw new Error('music list json should be an array')
    list.value = remote.map(item => ({
      title: item.title || '',
      artist: item.artist || '',
      coverBlobUrl: '',
    }))
  } catch (e) {
    error.value = e.message || String(e)
    list.value = []
  } finally {
    isLoadingList.value = false
  }
}

async function ensureInfo(item) {
  if (item.musicFull) return
  const paths = derivePaths(item)
  item.musicFull = paths.musicFull
  item.binFull = paths.binFull
}

async function loadLyrics(item) {
  if (!item || !item.binFull) return
  try {
    const res = await fetch(item.binFull)
    if (!res.ok) throw new Error('fetch bin failed')
    const ab = await res.arrayBuffer()
    const view = new DataView(ab)
    const lyricsLength = view.getUint32(0, true)
    const decoder = new TextDecoder('utf-8')
    const lyricsText = decoder.decode(new Uint8Array(ab, 4, lyricsLength))
    lyrics.value = parseLRC(lyricsText)
    buildGroupedLyrics()

    const coverStart = 4 + lyricsLength
    const coverData = ab.slice(coverStart)
    if (coverData.byteLength > 0) {
      if (currentCoverBlobUrl) URL.revokeObjectURL(currentCoverBlobUrl)
      const coverBlob = new Blob([coverData], { type: 'image/webp' })
      currentCoverBlobUrl = URL.createObjectURL(coverBlob)
      item.coverBlobUrl = currentCoverBlobUrl
    } else {
      item.coverBlobUrl = ''
    }
  } catch {
    lyrics.value = []
    groupedLyrics.value = []
    item.coverBlobUrl = ''
  }
}

function buildGroupedLyrics() {
  const result = []
  let i = 0
  while (i < lyrics.value.length) {
    const t = lyrics.value[i].time
    const indices = []
    while (i < lyrics.value.length && Math.abs(lyrics.value[i].time - t) < 0.01) {
      indices.push(i)
      i++
    }
    result.push({ time: t, indices })
  }
  groupedLyrics.value = result
}

function onTimeUpdate() {
  const audioEl = getAudio()
  if (!audioEl) return
  currentTime.value = audioEl.currentTime

  const groups = groupedLyrics.value
  if (!groups.length) return

  const t = audioEl.currentTime
  let lo = 0, hi = groups.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (groups[mid].time <= t) lo = mid + 1
    else hi = mid - 1
  }
  const found = hi >= 0 ? hi : 0

  if (found !== currentLyricIndex.value) {
    currentLyricIndex.value = found
    currentLyricIndices.value = groups[found].indices
    if (_onLyricChange) _onLyricChange()
  }
}

function onLoadedMetadata() {
  const audioEl = getAudio()
  if (!audioEl) return
  duration.value = audioEl.duration || 0
}

function onEnded() {
  next(true)
}

let _onPlayIndex = null

function attachPermanentListeners() {
  const audioEl = getAudio()
  if (!audioEl || _permanentListenersAttached) return
  _permanentListenersAttached = true
  audioEl.addEventListener('timeupdate', onTimeUpdate)
  audioEl.addEventListener('ended', onEnded)
}

function attachPageListeners() {
  const audioEl = getAudio()
  if (!audioEl || _pageListenersAttached) return
  _pageListenersAttached = true
  audioEl.addEventListener('loadedmetadata', onLoadedMetadata)
}

function detachPageListeners() {
  const audioEl = getAudio()
  if (!audioEl || !_pageListenersAttached) return
  _pageListenersAttached = false
  audioEl.removeEventListener('loadedmetadata', onLoadedMetadata)
}

async function loadSong(item, audioEl) {
  currentIndex.value = list.value.indexOf(item)
  currentItem.value = item
  lyrics.value = []
  currentTime.value = 0
  currentLyricIndex.value = -1
  currentLyricIndices.value = []
  isLoadingSong.value = true
  try {
    await loadLyrics(item)
    if (groupedLyrics.value.length) {
      currentLyricIndex.value = 0
      currentLyricIndices.value = groupedLyrics.value[0].indices
      if (_onLyricChange) _onLyricChange()
    } else {
      currentLyricIndex.value = -1
      currentLyricIndices.value = []
    }
  } catch {
    lyrics.value = []
  } finally {
    isLoadingSong.value = false
  }
  audioEl.src = item.musicFull
}

async function playIndex(i, forcePlay = false) {
  const audioEl = getAudio()
  if (!audioEl) return
  const item = list.value?.[i]
  if (!item) return

  await ensureInfo(item)
  if (!item.musicFull) return

  attachPermanentListeners()
  attachPageListeners()

  if (currentIndex.value === i && !forcePlay) {
    if (audioEl.paused) audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
    else { audioEl.pause(); isPlaying.value = false }
    return
  }

  await loadSong(item, audioEl)
  audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
  if (_onPlayIndex) _onPlayIndex()
}

function togglePlay() {
  const audioEl = getAudio()
  if (!audioEl) return
  if (audioEl.paused) audioEl.play().then(() => { isPlaying.value = true }).catch(console.warn)
  else { audioEl.pause(); isPlaying.value = false }
}

function prev() {
  if (!list.value?.length) return
  let idx = currentIndex.value
  if (playMode.value === 'single') {
    idx = currentIndex.value > 0 ? currentIndex.value - 1 : list.value.length - 1
  } else if (playMode.value === 'shuffle') {
    if (!shuffleList.value.length) generateShuffleList()
    shuffleIndex.value = (shuffleIndex.value - 1 + shuffleList.value.length) % shuffleList.value.length
    idx = shuffleList.value[shuffleIndex.value]
  } else {
    idx = currentIndex.value > 0 ? currentIndex.value - 1 : list.value.length - 1
  }
  playIndex(idx)
}

function next(auto = false) {
  if (!list.value?.length) return
  let idx = currentIndex.value
  if (playMode.value === 'single') {
    idx = auto ? currentIndex.value : (currentIndex.value + 1) % list.value.length
  } else if (playMode.value === 'shuffle') {
    if (!shuffleList.value.length) generateShuffleList()
    shuffleIndex.value = (shuffleIndex.value + 1) % shuffleList.value.length
    idx = shuffleList.value[shuffleIndex.value]
  } else {
    idx = (currentIndex.value + 1) % list.value.length
  }
  playIndex(idx)
}

function togglePlayMode() {
  const notification = useNotification()
  if (playMode.value === 'loop') {
    playMode.value = 'shuffle'
    generateShuffleList()
    notification.show('已切换到随机播放模式')
  } else if (playMode.value === 'shuffle') {
    playMode.value = 'single'
    notification.show('已切换到单曲循环模式')
  } else {
    playMode.value = 'loop'
    notification.show('已切换到循环播放模式')
  }
}

function generateShuffleList() {
  if (!list.value?.length) return
  const indices = list.value.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  shuffleIndex.value = currentIndex.value >= 0 ? indices.indexOf(currentIndex.value) : 0
  shuffleList.value = indices
}

function toggleMute() {
  const audioEl = getAudio()
  if (audioEl) audioEl.muted = muted.value = !muted.value
}

function seek(time) {
  const audioEl = getAudio()
  if (audioEl) {
    audioEl.currentTime = time
    currentTime.value = time
  }
}

function downloadMusic() {
  if (typeof document === 'undefined') return
  const notification = useNotification()
  const item = currentItem.value
  if (!item?.musicFull) return
  const ext = item.musicFull.split('.').pop().split('?')[0] || 'mp3'
  const link = document.createElement('a')
  link.href = item.musicFull
  link.download = `${item.title || 'music'}.${ext}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  notification.show('已尝试下载，请注意查看！')
}

function closeCapsule() {
  const audioEl = getAudio()
  if (audioEl) {
    audioEl.pause()
    audioEl.src = ''
    isPlaying.value = false
  }
  currentItem.value = null
  currentIndex.value = -1
  currentTime.value = 0
  duration.value = 0
  lyrics.value = []
  groupedLyrics.value = []
  currentLyricIndex.value = -1
  currentLyricIndices.value = []
}

function cleanup() {
  detachPageListeners()
}

export function useMusicPlayer() {
  return {
    list,
    isLoadingList,
    error,
    currentIndex,
    currentItem,
    isPlaying,
    isLoadingSong,
    duration,
    currentTime,
    lyrics,
    groupedLyrics,
    currentLyricIndex,
    currentLyricIndices,
    playMode,
    muted,
    shuffleList,
    shuffleIndex,
    pausedOnMusicPage,
    loadList,
    ensureInfo,
    loadLyrics,
    buildGroupedLyrics,
    playIndex,
    togglePlay,
    prev,
    next,
    togglePlayMode,
    toggleMute,
    seek,
    downloadMusic,
    closeCapsule,
    cleanup,
    getAudio,
    attachPermanentListeners,
    setOnLyricChange(fn) { _onLyricChange = fn },
    setOnPlayIndex(fn) { _onPlayIndex = fn },
  }
}
