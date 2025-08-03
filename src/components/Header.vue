<template>
  <header>
    <nav
      class="fixed z-50 top-0 left-0 right-0
             px-4 py-2 w-full
             bg-[#070808]
             md:top-8 md:left-1/2 md:-translate-x-1/2 md:w-[90vw]
             md:bg-white/5 md:backdrop-blur
             md:rounded-2xl md:shadow-2xl
             md:max-w-[90vw] lg:max-w-[75vw] 2xl:max-w-[60vw]"
    >
      <div class="flex justify-between items-center">
        <!-- 导航栏 -->
        <ul class="flex justify-center md:justify-start space-x-4 overflow-x-auto list-none p-0 m-0">
          <li v-for="(item, index) in navItems" :key="index">
            <router-link
              :to="item.href"
              class="flex items-center space-x-1 no-underline px-3 py-2 rounded font-bold whitespace-nowrap"
              :class="{
                'active-gradient-text animate-gradient-flow': (route.path === item.href || (item.href === '/posts.html' && route.path.startsWith('/posts/'))) && isRouteReady,
                'text-white hover:brightness-75 cursor-pointer': route.path !== item.href || !isRouteReady
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

        <!-- 背景切换按钮 -->
        <button
          @click="toggleMode"
          class="ml-4 w-10 h-10 flex items-center justify-center
                rounded-full bg-white/10 text-white text-xl
                hover:text-black hover:bg-gradient-to-r hover:from-[#00e699] hover:to-[#00e2d8]
                border-0 shadow-none outline-none
                transition-all duration-200"
          :title="isPureBackground ? '恢复星轨背景' : '禁用星轨背景（可降低GPU占用）'"
        >
          <i
            class="iconfont"
            :class="isPureBackground ? 'icon-a-LivePhoto-guan' : 'icon-a-LivePhoto-kai'"
          ></i>
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
  isPureBackground.value = localStorage.getItem('usePureBackground') === 'true'
  applyBackgroundMode()
})

const navItems = [
  { label: 'Home', href: '/', icon: 'icon-house-chimney' },
  { label: 'Posts', href: '/posts.html', icon: 'icon-blog' },
  { label: 'About', href: '/about.html', icon: 'icon-about' },
]

const isPureBackground = ref(false)

const isBtnDisabled = ref(false)  // 按钮禁用状态

function toggleMode() {
  if (isBtnDisabled.value) return  // 禁用时不响应点击

  isBtnDisabled.value = true       // 点击后禁用按钮

  isPureBackground.value = !isPureBackground.value
  localStorage.setItem('usePureBackground', isPureBackground.value.toString())
  applyBackgroundMode()

  if (!isPureBackground.value && window.__enableStarTrails) {
    window.__enableStarTrails()
  }

  // 动画结束后恢复按钮状态
  setTimeout(() => {
    isBtnDisabled.value = false
  }, 500)
}

function applyBackgroundMode() {
  const canvas = document.getElementById('star-canvas')
  if (!canvas) return

  if (isPureBackground.value) {
    // 开始淡出动画
    canvas.classList.add('fade-out')

    // 动画结束后隐藏
    canvas.addEventListener('transitionend', function handler() {
      canvas.classList.add('hidden')
      canvas.removeEventListener('transitionend', handler)
    })

    document.body.classList.add('pure-background')
  } else {
    // 显示星轨背景，移除隐藏和动画类
    canvas.classList.remove('hidden')
    canvas.classList.remove('fade-out')
    document.body.classList.remove('pure-background')
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