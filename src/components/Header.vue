<template>
  <header>
    <nav
      class="fixed top-8 left-1/2 -translate-x-1/2 w-[50vw] z-50
             py-2 px-4 rounded-2xl shadow-2xl
             backdrop-blur bg-white/5"
    >
      <ul class="flex space-x-4 list-none">
        <li v-for="(item, index) in navItems" :key="index">
          <router-link
            :to="item.href"
            class="flex items-center space-x-1 no-underline px-3 py-2 rounded font-bold transition duration-300 text-white"
            :class="route.path === item.href
              ? 'active' 
              : 'hover:brightness-75 cursor-pointer'"
          >
            <i 
              :class="['iconfont', item.icon]" 
              :style="route.path === item.href ? 'color: #00e699' : ''"
            ></i>
            <span 
              :class="route.path === item.href ? 'active-gradient-text animate-gradient-flow' : ''"
            >{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const navItems = [
  { label: 'Home', href: '/', icon: 'icon-house-chimney' },
  { label: 'Posts', href: '/posts.html', icon: 'icon-about' },
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
  animation: gradient-flow 3s linear infinite;
}
</style>