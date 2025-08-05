<template>
  <header>
    <nav
      class="fixed top-0 left-0 right-0 z-50 w-full h-[68px] bg-[#f8f8f8] dark:bg-[#0e1111] transition-colors duration-500"
    >
      <div
        class="flex items-center justify-between h-full items-center
               px-4 md:px-8
               max-w-[90vw] lg:max-w-[75vw] 2xl:max-w-[60vw]
               mx-auto"
      >
        <ul class="flex justify-center md:justify-start space-x-4 overflow-x-auto list-none p-0 m-0 flex-1">
          <li v-for="(item, index) in navItems" :key="index">
            <router-link
              :to="item.href"
              class="flex items-center space-x-1 no-underline px-3 py-2 rounded font-bold whitespace-nowrap"
              :class="{
                'active-gradient-text animate-gradient-flow': (route.path === item.href || (item.href === '/posts.html' && route.path.startsWith('/posts/'))) && isRouteReady,
                'text-#2f3f5b dark:text-white hover:brightness-200 dark:hover:brightness-75 cursor-pointer transition-colors duration-500': route.path !== item.href || !isRouteReady
              }"
            >
              <i
                :class="['iconfont', item.icon]"
                :style="route.path === item.href ? 'color: #00e699' : ''"
              ></i>
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>

        <!-- 主题切换按钮 -->
        <button
          @click="toggleTheme"
          aria-label="切换主题"
          class="ml-4 p-2.5 rounded-lg border-none
              text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20
                transition-colors duration-500 flex items-center justify-center select-none cursor-pointer"
          type="button"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <!-- 太阳图标 -->
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m8.66-12.66l-.707.707M4.05 19.95l-.707-.707M21 12h-1M4 12H3m15.66 7.66l-.707-.707M4.05 4.05l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <!-- 月亮图标 -->
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.01 9.79z" />
          </svg>
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const isRouteReady = ref(false)
onMounted(() => {
  isRouteReady.value = true
})

// 导航菜单数据
const navItems = [
  { label: 'Home', href: '/', icon: 'icon-house-chimney' },
  { label: 'Posts', href: '/posts.html', icon: 'icon-blog' },
  { label: 'About', href: '/about.html', icon: 'icon-about' },
]

// 主题切换
const isDark = ref(false)

onMounted(() => {
  const html = document.documentElement
  isDark.value = html.classList.contains('dark')
  html.style.colorScheme = isDark.value ? 'dark' : 'light'
})

function toggleTheme() {
  const html = document.documentElement
  if (html.classList.contains('dark')) {
    html.classList.remove('dark')
    html.style.colorScheme = 'light'
    localStorage.setItem('theme', 'light')
    isDark.value = false
  } else {
    html.classList.add('dark')
    html.style.colorScheme = 'dark'
    localStorage.setItem('theme', 'dark')
    isDark.value = true
  }
}
</script>

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
</style>