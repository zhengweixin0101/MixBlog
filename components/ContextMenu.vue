<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, useRouter, useRoute, useColorMode } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import { useNotification } from '~/composables/useNotification'

const notification = useNotification()

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const menuRef = ref(null)
const loading = ref(false)

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

const menuType = ref('default')
const targetElement = ref(null)

const showMenu = async (event) => {
  event.preventDefault()

  const el = event.target
  const parentLink = el.closest('a')

  if (parentLink?.dataset.fancybox) {
    menuType.value = 'image'
    targetElement.value = parentLink.querySelector('img') || el
  }
  else if (el.tagName === 'IMG') {
    menuType.value = 'image'
    targetElement.value = el
  }
  else if (parentLink && el !== parentLink) {
    menuType.value = 'link'
    targetElement.value = parentLink
  }
  else {
    menuType.value = 'default'
    targetElement.value = el
  }

  visible.value = true
  await nextTick()

  const menu = menuRef.value
  if (!menu) return

  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight
  const pageWidth = window.innerWidth
  const pageHeight = window.innerHeight

  let posX = event.clientX
  let posY = event.clientY

  if (posX + menuWidth > pageWidth) posX = pageWidth - menuWidth - 5
  if (posY + menuHeight > pageHeight) posY = pageHeight - menuHeight - 5

  x.value = posX
  y.value = posY
}

// 隐藏菜单
const hideMenu = () => {
  visible.value = false
}

// 状态
const isHome = computed(() => route.path === '/')

// 默认菜单功能
const goBack = () => { window.history.back(); hideMenu() }
const goForward = () => { window.history.forward(); hideMenu() }
const refreshPage = () => { window.location.reload(); hideMenu() }
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); hideMenu() }
const goHome = () => { router.push('/'); hideMenu() }

const shufflePost = async () => {
  loading.value = true
  try {
    const posts = await $fetch(`${siteConfig.postsData.postsList}?fields=slug`)

    if (!Array.isArray(posts) || posts.length === 0) {
      console.warn('No posts available to shuffle.')
      return
    }

    const randomIndex = Math.floor(Math.random() * posts.length)
    const randomPost = posts[randomIndex]

    if (randomPost?.slug) {
      router.push(`/posts/${randomPost.slug}`)
    } else {
      console.warn('Selected post has no slug:', randomPost)
    }
  } catch (err) {
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
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

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  notification.show(`已为您切换为${colorMode.value === 'dark' ? '浅色' : '深色'}模式`)
  hideMenu()
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

// 事件绑定
onMounted(() => {
  window.addEventListener('contextmenu', showMenu)
  window.addEventListener('click', hideMenu)
  window.addEventListener('scroll', hideMenu, true)
  window.addEventListener('resize', hideMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', showMenu)
  window.removeEventListener('click', hideMenu)
  window.removeEventListener('scroll', hideMenu, true)
  window.removeEventListener('resize', hideMenu)
})
</script>

<template>
  <div
    v-show="visible"
    ref="menuRef"
    id="rightMenu"
    class="fixed z-10002 bg-#fefefe dark:bg-white/10 dark:backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-lg 
           shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)] p-1.5"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div class="flex justify-between gap-1 p-1">
      <i class="iconfont icon-arrow-left rightMenu-item-1" @click="goBack"></i>
      <i class="iconfont icon-arrow-right rightMenu-item-1" @click="goForward"></i>
      <i class="iconfont icon-arrow-rotate-right rightMenu-item-1" @click="refreshPage"></i>
      <i class="iconfont icon-arrow-up rightMenu-item-1" @click="scrollToTop"></i>
    </div>
    <div class="border border-dashed border-gray-300 dark:border-white/20 m-1"></div>

    <!-- 默认 -->
    <template v-if="menuType === 'default'">
      <div class="flex flex-col p-1">
        <span v-if="!isHome" @click="goHome" class="rightMenu-item-2">
          <i class="iconfont icon-home text-lg mr-2"></i>返回首页
        </span>
        <span @click="shufflePost" class="rightMenu-item-2">
          <i class="iconfont icon-shuffle text-lg mr-2"></i>随便逛逛
        </span>
      </div>
      <div class="border border-dashed border-gray-300 dark:border-white/20 m-1"></div>
      <div class="flex flex-col p-1">
        <span @click="copyAddress" class="rightMenu-item-2">
          <i class="iconfont icon-copy text-lg mr-2"></i>复制地址
        </span>
        <span @click="toggleTheme" class="rightMenu-item-2">
          <i class="iconfont icon-circle-half-stroke text-lg mr-2"></i>
          {{colorMode.value === 'dark' ? '浅色' : '深色'}}模式
        </span>
      </div>
    </template>

    <!-- 图片 -->
    <template v-else-if="menuType === 'image'">
      <div class="flex flex-col p-1">
        <span class="rightMenu-item-2" @click="viewImage">
          <i class="iconfont icon-images text-lg mr-2"></i>查看图片
        </span>
        <span class="rightMenu-item-2" @click="copyImageUrl">
          <i class="iconfont icon-link text-lg mr-2"></i>复制链接
        </span>
        <span class="rightMenu-item-2" @click="openImageNewTab">
          <i class="iconfont icon-window-restore text-lg mr-2"></i>新标签打开
        </span>
      </div>
    </template>

    <!-- 链接 -->
    <template v-else-if="menuType === 'link'">
      <div class="flex flex-col p-1">
        <span class="rightMenu-item-2" @click="openLinkNewTab">
          <i class="iconfont icon-window-restore text-lg mr-2"></i>新标签打开
        </span>
        <span class="rightMenu-item-2" @click="copyLink">
          <i class="iconfont icon-link text-lg mr-2"></i>复制链接
        </span>
      </div>
    </template>
  </div>
</template>