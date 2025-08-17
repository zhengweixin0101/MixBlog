<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useColorMode } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'

const route = useRoute()
const colorMode = useColorMode()

const isMenuOpen = ref(false)
const menuButton = ref(null)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function isActive(item) {
  if (item.href === '/posts') return route.path.startsWith('/posts')
  return route.path === item.href
}

// 点击空白区域关闭菜单
function handleClickOutside(event) {
  const menu = document.getElementById('mobile-menu')
  if (
    isMenuOpen.value &&
    menu &&
    !menu.contains(event.target) &&
    menuButton.value &&
    !menuButton.value.contains(event.target)
  ) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <header>
    <nav class="fixed top-0 left-0 right-0 z-50 w-full h-[68px] bg-#f8f8f8/50 dark:bg-[#0e1111]/50 backdrop-blur-md transition-colors duration-300 border-b border-white/10 dark:border-white/10">
      <div class="flex items-center justify-between h-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[90vw] xl:max-w-[80vw] 2xl:max-w-[55vw] mx-auto">
        <ul class="hidden md:flex justify-start space-x-4 list-none p-0 m-0 flex-1">
          <li v-for="(item, index) in siteConfig.navItems" :key="'main-' + index" class="relative">
            <span
              v-if="isActive(item)"
              class="absolute inset-0 -z-10
                    bg-gradient-to-r from-#00e699/40 to-#00e2d8/40
                    dark:hidden transition-colors duration-300"
            />
            <NuxtLink
              :to="item.href"
              class="flex items-center space-x-1 no-underline whitespace-nowrap"
              :class="{
                'text-#2f3f5b dark:text-gradient': isActive(item),
                'text-#2f3f5b hover:bg-#00e699/20 dark:hover:bg-transparent dark:text-white dark:hover:brightness-75 cursor-pointer': !isActive(item)
              }"
            >
              <i :class="['iconfont', item.icon, { 'text-#2f3f5b dark:text-gradient': isActive(item) }]" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>

        <button
          ref="menuButton"
          @click="toggleMenu"
          aria-label="展开菜单"
          class="md:hidden w-10 h-10 rounded-lg border-none text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300 flex items-center justify-center select-none cursor-pointer"
          type="button"
        >
          <i :class="isMenuOpen ? 'iconfont icon-guanbi text-lg' : 'iconfont icon-caidan text-lg'"></i>
        </button>

        <button
          @click="toggleTheme"
          aria-label="切换主题"
          class="w-10 h-10 rounded-lg border-none text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300 flex items-center justify-center select-none cursor-pointer"
          type="button"
        >
            <i v-if="colorMode.value === 'dark'" class="iconfont icon-a-Frame47 text-lg"></i>
            <i v-else class="iconfont icon-a-Frame48 text-lg"></i>
        </button>
      </div>
    </nav>

    <Transition name="fade-slide">
      <div
        id="mobile-menu"
        v-if="isMenuOpen"
        class="md:hidden fixed top-[68px] left-4 w-1/4 min-w-[160px] mt-1 rounded-xl shadow-xl border border-white/10 backdrop-blur-md bg-white/60 dark:bg-[#1a1a1a]/60 z-40 overflow-hidden"
      >
        <ul class="flex flex-col divide-y divide-white/10 dark:divide-white/10">
          <li
            v-for="(item, index) in siteConfig.navItems"
            :key="'mobile-' + index"
            @click="isMenuOpen = false"
          >
            <NuxtLink
              draggable="false"
              :to="item.href"
              class="flex items-center px-4 py-3 text-sm font-medium no-underline transition-colors duration-300"
              :class="{
                'bg-gradient-to-r from-#00e699/40 to-#00e2d8/40 text-#2f3f5b dark:text-gradient': isActive(item),
                'text-#2f3f5b dark:text-white hover:bg-black/10 dark:hover:bg-white/10': !isActive(item)
              }"
            >
              <i :class="['iconfont', item.icon, 'mr-2 text-base']" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

/* 移动端菜单动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>