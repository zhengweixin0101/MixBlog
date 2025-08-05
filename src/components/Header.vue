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
                'text-#2f3f5b dark:text-white hover:brightness-75 cursor-pointer transition-colors duration-500': route.path !== item.href || !isRouteReady
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
          :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
          class="ml-4 px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1 select-none"
          type="button"
        >
          <span v-if="isDark" class="iconfont icon-sun" style="font-size: 18px;"></span>
          <span v-else class="iconfont icon-moon" style="font-size: 18px;"></span>
          <span>{{ isDark ? '亮色' : '暗色' }}</span>
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

// 主题切换相关
const isDark = ref(false)

// 初始化主题状态
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (saved === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // 没保存则按系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    if (prefersDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }
})

// 切换函数
function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
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