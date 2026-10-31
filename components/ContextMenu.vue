<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, useRouter, useRoute, useColorMode } from '#imports'
import NProgress from 'nprogress'
import { siteConfig } from '@/siteConfig/main.js'
import { useNotification } from '~/composables/useNotification'
import { useMusicPlayer } from '~/composables/useMusicPlayer'
import { useThemeReveal } from '~/composables/useThemeReveal'

const notification = useNotification()
const { toggleTheme: revealToggleTheme } = useThemeReveal()
const { togglePlay: musicTogglePlay, prev: musicPrev, next: musicNext, closeCapsule, currentItem: musicCurrentItem, playIndex: musicPlayIndex, list: musicList, loadList: musicLoadList, pausedOnMusicPage, playMode: musicPlayMode, togglePlayMode: musicTogglePlayMode } = useMusicPlayer()

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const menuRef = ref(null)
// 缩放起点，随鼠标在菜单中的位置取最近的那个角
const menuOrigin = ref('top left')

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

const menuType = ref('default')
const targetElement = ref(null)
const selectedText = ref('')

const showMenu = async (event) => {
  // 检测是否为移动设备
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileDevice = /mobile|android|iphone|ipad|ipod|windows phone/i.test(userAgent)
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches

  // 移动设备或小屏触控设备上禁用自定义右键菜单
  if (isMobileDevice || (isSmallScreen && window.matchMedia('(pointer: coarse)').matches)) {
    return
  }

  event.preventDefault()

  if (visible.value) {
    visible.value = false
    return
  }

  const el = event.target

  selectedText.value = ''

  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
    targetElement.value = el
    selectedText.value = el.value.substring(el.selectionStart, el.selectionEnd)
    menuType.value = selectedText.value ? 'input-selected' : 'input'
  }
  else if (window.getSelection()?.toString()) {
    const sel = window.getSelection()
    selectedText.value = sel.toString()
    targetElement.value = el

    const commentBox = document.querySelector('.tk-input textarea')
    if (commentBox) {
      menuType.value = 'selection-with-twikoo'
    } else {
      menuType.value = 'selection'
    }
  }
  else if (el.tagName === 'IMG' || el.closest('a[data-fancybox]')) {
    menuType.value = 'image'
    targetElement.value = el.tagName === 'IMG' ? el : el.querySelector('img')
  }
  else if (el.closest('a')) {
    menuType.value = 'link'
    targetElement.value = el.closest('a')
  }
  else if (el.closest('[data-music-capsule]')) {
    menuType.value = 'music'
    targetElement.value = el
  }
  else {
    menuType.value = 'default'
    targetElement.value = el
  }

  visible.value = true
  await nextTick()

  const menu = menuRef.value
  if (!menu) return

  let posX = event.clientX
  let posY = event.clientY
  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight
  const pageWidth = window.innerWidth
  const pageHeight = window.innerHeight

  // 右侧/下方放不下时反向贴住鼠标，缩放起点即为鼠标所在的那个角
  if (posX + menuWidth + 5 > pageWidth) posX = Math.max(5, posX - menuWidth)
  if (posY + menuHeight + 5 > pageHeight) posY = Math.max(5, posY - menuHeight)

  x.value = posX
  y.value = posY
  menuOrigin.value = `${event.clientX < posX + menuWidth / 2 ? 'left' : 'right'} ${event.clientY < posY + menuHeight / 2 ? 'top' : 'bottom'}`
}

const hideMenu = () => {
  visible.value = false
}

// scroll 事件按帧节流，避免捕获阶段高频触发
// 只对文档级滚动关菜单（target 为 document/html/body），内层容器（歌词、歌曲列表）的自动滚动不关
let scrollFrame = null
const hideMenuOnScroll = (event) => {
  const target = event.target
  if (target && target !== document && target !== document.documentElement && target !== document.body) return
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null
    hideMenu()
  })
}

const isHome = computed(() => route.path === '/')
const isMusicPage = computed(() => route.path === '/music')

const isMobileSize = ref(false)
function checkMobileSize() {
  isMobileSize.value = window.matchMedia('(max-width: 768px)').matches
}
const onResize = () => {
  checkMobileSize()
  hideMenu()
}

// 默认菜单功能
const goBack = () => { window.history.back(); hideMenu() }
const goForward = () => { window.history.forward(); hideMenu() }
const refreshPage = () => { window.location.reload(); hideMenu() }
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); hideMenu() }
const goHome = () => { router.push('/'); hideMenu() }

// 音乐菜单功能
const playMusic = async () => {
  if (!musicList.value?.length) {
    await musicLoadList()
  }
  if (musicCurrentItem.value) {
    musicTogglePlay()
    pausedOnMusicPage.value = false
  } else if (musicList.value?.length) {
    const idx = Math.floor(Math.random() * musicList.value.length)
    if (musicPlayMode.value === 'shuffle') musicTogglePlayMode()
    musicPlayIndex(idx, true)
  }
  hideMenu()
}
const goMusicPage = () => { router.push('/music'); hideMenu() }
const goMusicFullscreen = () => {
  const showMusicFullscreen = useState('showMusicFullscreen')
  showMusicFullscreen.value = true
  const hideHeader = useState('hideHeader')
  hideHeader.value = true
  hideMenu()
}
const exitMusicFullscreen = () => {
  const showMusicFullscreen = useState('showMusicFullscreen')
  showMusicFullscreen.value = false
  const hideHeader = useState('hideHeader')
  hideHeader.value = false
  hideMenu()
}
// 供模板判断是否在全屏音乐界面（右键菜单挂在 window 上，全屏层不拦截 contextmenu）
const musicFullscreenOpen = useState('showMusicFullscreen', () => false)
const closeMusicCapsule = () => { closeCapsule(); hideMenu() }

const shufflePost = async () => {
  NProgress.start()
  await nextTick()

  try {
    const result = await $fetch(`${siteConfig.apiUrl}/api/articles?fields=slug`)

    if (!result?.data || !Array.isArray(result.data) || result.data.length === 0) {
      console.warn('No posts available to shuffle.')
      return
    }

    const randomIndex = Math.floor(Math.random() * result.data.length)
    const randomPost = result.data[randomIndex]

    if (randomPost?.slug) {
      router.push(`/posts/${randomPost.slug}`)
    } else {
      console.warn('Selected post has no slug:', randomPost)
    }
  } catch (err) {
    console.error('Failed to fetch posts:', err)
  } finally {
    hideMenu()
  }
}

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    notification.show(`复制成功!`)
  } catch (err) {
    notification.show(`复制失败!`, 'error')
  } finally {
    hideMenu()
  }
}

// 从被点的这一项原地扩散 / 收回，菜单先收起，提示等过渡结束再弹
async function toggleTheme(e) {
  hideMenu()
  const next = await revealToggleTheme({ origin: e?.currentTarget })
  notification.show(`已为您切换为${next === 'dark' ? '深色' : '浅色'}模式`)
}

// 图片菜单功能
const copyImageUrl = async () => {
  const src = targetElement.value?.src
  if (!src) return
  try {
    await navigator.clipboard.writeText(src)
    notification.show('图片地址已复制!')
  } catch {
    notification.show('复制失败', 'error')
  } finally {
    hideMenu()
  }
}

const openImageNewTab = () => {
  const src = targetElement.value?.src
  if (src) window.open(src, '_blank')
  hideMenu()
}

const viewImage = () => {
  const img = targetElement.value
  if (!img || img.tagName !== 'IMG') return

  const parentLink = img.closest('a[data-fancybox]')
  if (parentLink) {
    parentLink.click()
  } else {
    window.open(img.src, '_blank')
  }

  hideMenu()
}

// 链接菜单功能
const openLinkNewTab = () => {
  const href = targetElement.value?.href
  if (href) window.open(href, '_blank')
  hideMenu()
}

const copyLink = async () => {
  const href = targetElement.value?.href
  if (!href) return
  try {
    await navigator.clipboard.writeText(href)
    notification.show('链接已复制!')
  } catch {
    notification.show('复制失败', 'error')
  } finally {
    hideMenu()
  }
}

// 输入框菜单功能
const cutText = () => {
  if (!targetElement.value) return
  const el = targetElement.value

  if ('value' in el) {
    navigator.clipboard.writeText(el.value)
      .then(() => {
        el.value = ''
        hideMenu()
      })
      .catch(() => {
        notification.show('复制失败，请向开发者反馈问题!', 'error')
      })
  }
}

const copyText = () => {
  if (!targetElement.value) return
  let textToCopy = ''
  if (menuType.value === 'selection' && selectedText.value) {
    textToCopy = selectedText.value
    notification.show('复制成功，请遵循版权协议!')
  } else {
    const el = targetElement.value
    if ('value' in el) {
      textToCopy = el.value
      notification.show('复制成功!')
    } else {
      textToCopy = el.innerText || el.textContent
      notification.show('复制成功，请遵循版权协议!')
    }
  }
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      hideMenu()
    })
    .catch(() => {
      notification.show('复制失败，请向开发者反馈问题!', 'error')
    })
}


const pasteText = () => {
  if (!targetElement.value) return
  navigator.clipboard.readText().then(text => {
    const el = targetElement.value
    const start = el.selectionStart
    const end = el.selectionEnd
    el.setRangeText(text, start, end, 'end')
  })
  hideMenu()
}

// 选中文本功能
function search() {
  if (!selectedText.value) {
    notification.show('请选择文本！', 'warning')
    return
  }
  const query = encodeURIComponent(selectedText.value)
  const url = `https://www.bing.com/search?q=${query}`
  window.open(url, '_blank')
  hideMenu()
}

const quoteToTwikoo = () => {
  if (!selectedText.value) return

  const commentBox = document.querySelector('.tk-input textarea')
  if (!commentBox) {
    notification.show('评论框未找到!', 'error')
    return
  }

  const el = commentBox
  const start = el.selectionStart
  const end = el.selectionEnd

  const quoteText = selectedText.value
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n') + '\n' + '\n'

  el.setRangeText(quoteText, start, end, 'end')
  el.focus()

  const event = new Event('input', { bubbles: true })
  el.dispatchEvent(event)

  notification.show('已引用到评论区！你无需删除空行，直接评论以获取最佳展示效果。', 'success', 10000, true)
  hideMenu()
}

// 事件绑定
onMounted(() => {
  checkMobileSize()
  window.addEventListener('contextmenu', showMenu)
  window.addEventListener('click', hideMenu)
  window.addEventListener('scroll', hideMenuOnScroll, true)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = null
  }
  window.removeEventListener('contextmenu', showMenu)
  window.removeEventListener('click', hideMenu)
  window.removeEventListener('scroll', hideMenuOnScroll, true)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
<Transition name="menu">
  <div
    v-if="visible"
    ref="menuRef"
    id="rightMenu"
    class="fixed z-700 border border-line bg-overlay text-ink rounded-lg
           shadow-lg p-1.5"
    :style="{ top: y + 'px', left: x + 'px', transformOrigin: menuOrigin }"
  >
    <div class="flex justify-between gap-1 p-1">
      <span class="rightMenu-item-1 rightMenu-icon-nav" @click="goBack"><AppIcon name="arrow-left" /></span>
      <span class="rightMenu-item-1 rightMenu-icon-nav" @click="goForward"><AppIcon name="arrow-right" /></span>
      <span class="rightMenu-item-1 rightMenu-icon-nav" @click="scrollToTop"><AppIcon name="arrow-up" /></span>
      <span class="rightMenu-item-1 rightMenu-icon-nav" @click="refreshPage"><AppIcon name="refresh" /></span>
    </div>
    <div class="border border-dashed border-line m-1"></div>

    <!-- 默认 -->
    <template v-if="menuType === 'default'">
      <div class="flex flex-col p-1">
        <span v-if="musicFullscreenOpen" @click="exitMusicFullscreen" class="rightMenu-item-2">
          <AppIcon name="minimize" class="text-lg mr-2" />退出全屏
        </span>
        <span v-if="!isHome" @click="goHome" class="rightMenu-item-2">
          <AppIcon name="home" class="text-lg mr-2" />返回首页
        </span>
        <span @click="shufflePost" class="rightMenu-item-2">
          <AppIcon name="shuffle" class="text-lg mr-2" />随便逛逛
        </span>
        <span v-if="!isMusicPage && !isMobileSize && (!musicCurrentItem || pausedOnMusicPage)" @click="playMusic" class="rightMenu-item-2">
          <AppIcon name="play" class="text-lg mr-2" />播放音乐
        </span>
      </div>
      <div class="border border-dashed border-line m-1"></div>
      <div class="flex flex-col p-1">
        <span @click="copyAddress" class="rightMenu-item-2">
          <AppIcon name="copy" class="text-lg mr-2" />复制地址
        </span>
        <client-only>
          <span @click="toggleTheme" class="rightMenu-item-2">
            <AppIcon name="contrast" class="text-lg mr-2" />
            {{colorMode.value === 'dark' ? '浅色' : '深色'}}模式
          </span>
        </client-only>
      </div>
    </template>

    <!-- 图片 -->
    <template v-else-if="menuType === 'image'">
      <div class="flex flex-col p-1">
        <span class="rightMenu-item-2" @click="viewImage">
          <AppIcon name="maximize" class="text-lg mr-2" />查看图片
        </span>
        <span class="rightMenu-item-2" @click="copyImageUrl">
          <AppIcon name="link" class="text-lg mr-2" />复制链接
        </span>
        <span class="rightMenu-item-2" @click="openImageNewTab">
          <AppIcon name="external" class="text-lg mr-2" />新标签打开
        </span>
      </div>
    </template>

    <!-- 链接 -->
    <template v-else-if="menuType === 'link'">
      <div class="flex flex-col p-1">
        <span class="rightMenu-item-2" @click="openLinkNewTab">
          <AppIcon name="external" class="text-lg mr-2" />新标签打开
        </span>
        <span class="rightMenu-item-2" @click="copyLink">
          <AppIcon name="link" class="text-lg mr-2" />复制链接
        </span>
      </div>
    </template>

    <!-- 输入框 -->
    <template v-else-if="menuType === 'input'">
      <div class="flex flex-col p-1">
        <span @click="pasteText" class="rightMenu-item-2"><AppIcon name="paste" class="text-lg mr-2" />粘贴</span>
      </div>
    </template>

    <template v-else-if="menuType === 'input-selected'">
      <div class="flex flex-col p-1">
        <span @click="pasteText" class="rightMenu-item-2"><AppIcon name="paste" class="text-lg mr-2" />粘贴</span>
        <span @click="copyText" class="rightMenu-item-2"><AppIcon name="copy" class="text-lg mr-2" />复制</span>
        <span @click="cutText" class="rightMenu-item-2"><AppIcon name="cut" class="text-lg mr-2" />剪切</span>
      </div>
    </template>
    
    <!-- 选中 -->
    <template v-else-if="menuType === 'selection'">
      <div class="flex flex-col p-1">
        <span @click="copyText" class="rightMenu-item-2"><AppIcon name="copy" class="text-lg mr-2" />复制</span>
        <span @click="search" class="rightMenu-item-2"><AppIcon name="search" class="text-lg mr-2" />必应搜索</span>
      </div>
    </template>

    <template v-else-if="menuType === 'selection-with-twikoo'">
      <div class="flex flex-col p-1">
        <span @click="copyText" class="rightMenu-item-2"><AppIcon name="copy" class="text-lg mr-2" />复制</span>
        <span @click="search" class="rightMenu-item-2"><AppIcon name="search" class="text-lg mr-2" />必应搜索</span>
        <span @click="quoteToTwikoo" class="rightMenu-item-2"><AppIcon name="quote" class="text-lg mr-2" />引用到评论</span>
      </div>
    </template>

    <!-- 音乐胶囊 -->
    <template v-else-if="menuType === 'music'">
      <div class="flex flex-col p-1">
        <span @click="musicPrev" class="rightMenu-item-2"><AppIcon name="skip-back" class="text-lg mr-2" />上一首</span>
        <span @click="musicNext" class="rightMenu-item-2"><AppIcon name="skip-forward" class="text-lg mr-2" />下一首</span>
      </div>
      <div class="border border-dashed border-line m-1"></div>
      <div class="flex flex-col p-1">
        <span @click="goMusicPage" class="rightMenu-item-2"><AppIcon name="circle-arrow-right" class="text-lg mr-2" />查看详情</span>
        <span @click="goMusicFullscreen" class="rightMenu-item-2"><AppIcon name="maximize" class="text-lg mr-2" />全屏播放</span>
        <span @click="closeMusicCapsule" class="rightMenu-item-2"><AppIcon name="close" class="text-lg mr-2" />关闭胶囊</span>
      </div>
    </template>
  </div>
</Transition>
</template>

<style>
#rightMenu {
  transform-origin: top left;
  /* 把菜单固定为独立绘制层，菜单项 hover 换底色时不再被提升为新合成层，修复hover时的1px跳动 */
  contain: paint;
}

.rightMenu-icon-nav {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
}

.rightMenu-icon-nav::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: var(--accent-soft);
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out);
  pointer-events: none;
}

.rightMenu-icon-nav:hover::after {
  opacity: 1;
}

.menu-enter-active {
  animation: menu-expand 0.1s ease-out;
}

.menu-leave-active {
  animation: menu-expand 0.1s ease-in reverse;
}

@keyframes menu-expand {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>