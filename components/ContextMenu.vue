<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const menuRef = ref(null)

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

const hideMenu = () => {
  visible.value = false
}

// 绑定操作
const goBack = () => { window.history.back(); hideMenu() }
const goForward = () => { window.history.forward(); hideMenu() }
const refreshPage = () => { window.location.reload(); hideMenu() }
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); hideMenu() }

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
    class="fixed z-10002 bg-#fefefe dark:bg-white/10 dark:backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-xl border shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.3)] p-1"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div class="flex justify-between p-1 dark:border-gray-700">
      <i class="iconfont icon-arrow-left text-3xl text-#2f3f5b dark:text-white cursor-pointer px-2" @click="goBack"></i>
      <i class="iconfont icon-arrow-right text-3xl text-#2f3f5b dark:text-white cursor-pointer px-2" @click="goForward"></i>
      <i class="iconfont icon-arrow-rotate-right text-3xl text-#2f3f5b dark:text-white cursor-pointer px-2" @click="refreshPage"></i>
      <i class="iconfont icon-arrow-up text-3xl text-#2f3f5b dark:text-white cursor-pointer px-2" @click="scrollToTop"></i>
    </div>
  </div>
</template>