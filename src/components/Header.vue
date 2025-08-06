<template>
  <header>
    <nav
      class="fixed top-0 left-0 right-0 z-50 w-full h-[68px]
            bg-#f8f8f8/60 dark:bg-[#0e1111]/60 backdrop-blur-md
            transition-colors duration-300 border-b border-white/10 dark:border-white/10"
    >
      <div class="flex items-center justify-between h-full max-w-[90vw] lg:max-w-[65vw] 2xl:max-w-[55vw] mx-auto" >
        <!-- 桌面导航 -->
        <ul class="hidden md:flex justify-start space-x-4 list-none p-0 m-0 flex-1" >
          <li v-for="(item, index) in navItems" :key="index">
            <router-link
              draggable="false"
              :to="item.href"
              class="flex items-center space-x-1 no-underline px-3 py-2 rounded font-bold whitespace-nowrap"
              :class="{
                'active-gradient-text animate-gradient-flow': (route.path === item.href || (item.href === '/posts.html' && route.path.startsWith('/posts/'))) && isRouteReady,
                'text-#2f3f5b dark:text-white dark:hover:brightness-75 cursor-pointer': route.path !== item.href || !isRouteReady
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

        <!-- 移动端菜单按钮 -->
        <button
          @click="toggleMenu"
          aria-label="展开菜单"
          class="md:hidden w-10 h-10 rounded-lg border-none
                text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10
                hover:bg-black/10 dark:hover:bg-white/20
                transition-colors duration-300 flex items-center justify-center
                select-none cursor-pointer"
          type="button"
        >
          <i :class="isMenuOpen ? 'iconfont icon-guanbi text-lg' : 'iconfont icon-caidan text-lg'"></i>
        </button>

        <!-- 主题切换按钮 -->
        <button
          @click="toggleTheme"
          aria-label="切换主题"
          class="ml-4 w-10 h-10 rounded-lg border-none
                 text-#2f3f5b/80 dark:text-white/60 bg-black/5 dark:bg-white/10
                 hover:bg-black/10 dark:hover:bg-white/20
                 transition-colors duration-300 flex items-center justify-center
                 select-none cursor-pointer"
          type="button"
        >
          <i v-if="isDark" class="iconfont icon-a-Frame47 text-lg"></i>
          <i v-else class="iconfont icon-a-Frame48 text-lg"></i>
        </button>
      </div>
    </nav>
    <!-- 移动端菜单 -->
    <transition name="fade-slide">
      <div
        v-if="isMenuOpen"
        class="md:hidden fixed top-[68px] left-4 w-1/4 min-w-[160px] mt-1
              rounded-xl shadow-xl border border-white/10 backdrop-blur-md
              bg-white/60 dark:bg-[#1a1a1a]/60 z-40 overflow-hidden"
      >
        <ul class="flex flex-col divide-y divide-white/10 dark:divide-white/10">
          <li
            v-for="(item, index) in navItems"
            :key="'mobile-' + index"
            @click="isMenuOpen = false"
          >
            <router-link
              draggable="false"
              :to="item.href"
              class="flex items-center px-4 py-3 text-sm font-medium no-underline
                    text-#2f3f5b dark:text-white hover:bg-black/10 dark:hover:bg-white/10
                    transition-colors duration-200"
            >
              <i :class="['iconfont', item.icon, 'mr-2 text-base']"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </transition>
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

// 主题切换状态
const isDark = ref(document.documentElement.classList.contains('dark'))

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

// 移动端菜单展开状态
const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
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