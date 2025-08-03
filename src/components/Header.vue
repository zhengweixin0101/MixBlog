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

const navItems = [
  { label: 'Home', href: '/', icon: 'icon-house-chimney' },
  { label: 'Posts', href: '/posts.html', icon: 'icon-blog' },
  { label: 'About', href: '/about.html', icon: 'icon-about' },
]
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