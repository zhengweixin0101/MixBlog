<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { siteConfig } from '@/siteConfig/main.js'

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const menuRef = ref(null)
const loading = ref(false)

const router = useRouter()

// 显示右键菜单
const showMenu = async (event) => {
  event.preventDefault()
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

// 浏览器操作
const goBack = () => { window.history.back(); hideMenu() }
const goForward = () => { window.history.forward(); hideMenu() }
const refreshPage = () => { window.location.reload(); hideMenu() }
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); hideMenu() }
const goHome = () => { router.push('/'); hideMenu() }

// 随机文章
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
    class="fixed z-10002 bg-#fefefe dark:bg-white/10 dark:backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-lg shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)] p-1.5"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div class="flex justify-between gap-1 p-1">
      <i class="iconfont icon-arrow-left rightMenu-item-1" @click="goBack"></i>
      <i class="iconfont icon-arrow-right rightMenu-item-1" @click="goForward"></i>
      <i class="iconfont icon-arrow-rotate-right rightMenu-item-1" @click="refreshPage"></i>
      <i class="iconfont icon-arrow-up rightMenu-item-1" @click="scrollToTop"></i>
    </div>
    <div class="border border-dashed border-gray-300 dark:border-white/20 m-1"></div>
    <div class="flex flex-col p-1">
      <span @click="goHome" class="rightMenu-item-2"><i class="iconfont icon-home text-lg mr-2"></i>返回首页</span>
      <span @click="shufflePost" class="rightMenu-item-2"><i class="iconfont icon-shuffle text-lg mr-2"></i>随便逛逛</span>
    </div>
  </div>
</template>