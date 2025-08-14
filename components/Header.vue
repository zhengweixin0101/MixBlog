<script setup>
import { useRoute, useColorMode } from '#imports'
import { siteConfig } from '@/site.config.js'

const route = useRoute()

const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const isMenuOpen = ref(false)
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function isActive(item) {
  if (item.href === '/posts') {
    return route.path.startsWith('/posts')
  }
  return route.path === item.href
}
</script>

<template>
  <header>
    <nav class="fixed top-0 left-0 right-0 z-50 w-full h-[68px] bg-#f8f8f8/50 dark:bg-[#0e1111]/50 backdrop-blur-md transition-colors duration-300 border-b border-white/10 dark:border-white/10">
      <div class="flex items-center justify-between h-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[60vw] mx-auto">
        <ul class="hidden md:flex justify-start space-x-4 list-none p-0 m-0 flex-1">
          <li v-for="(item, index) in siteConfig.navItems" :key="'main-' + index">
            <NuxtLink
              :to="item.href"
              class="flex items-center space-x-1 no-underline px-3 py-2 rounded font-bold whitespace-nowrap"
              :class="{
                'active-gradient-text animate-gradient-flow': isActive(item),
                'text-#2f3f5b dark:text-white dark:hover:brightness-75 cursor-pointer': !isActive(item)
              }"
            >
              <i :class="['iconfont', item.icon]" :style="isActive(item) ? 'color: #00e699' : ''"></i>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>

        <button
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

    <transition name="fade-slide">
      <div
        v-if="isMenuOpen"
        class="md:hidden fixed top-[68px] left-4 w-1/4 min-w-[160px] mt-1 rounded-xl shadow-xl border border-white/10 backdrop-blur-md bg-white/60 dark:bg-[#1a1a1a]/60 z-40 overflow-hidden"
      >
        <ul class="flex flex-col divide-y divide-white/10 dark:divide-white/10">
          <li v-for="(item, index) in siteConfig.navItems" :key="'mobile-' + index" @click="isMenuOpen = false">
            <NuxtLink
              draggable="false"
              :to="item.href"
              class="flex items-center px-4 py-3 text-sm font-medium no-underline text-#2f3f5b dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
            >
              <i :class="['iconfont', item.icon, 'mr-2 text-base']"></i>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </transition>
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

.active-gradient-text {
  background: linear-gradient(90deg, #00e699, #00e2d8, #00e699);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: none !important;
  transition: none !important;
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