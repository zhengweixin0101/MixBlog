<template>
  <nav class="w-full py-8 z-50 bg-#0e1111">
    <div class="max-w-screen-xl">
      <ul class="flex space-x-4 list-none">
        <li v-for="(item, index) in navItems" :key="index">
          <router-link
            :to="item.href"
            class="flex items-center space-x-1 no-underline"
            :class="route.path === item.href
              ? 'bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent'
              : 'text-white'"
          >
            <i :class="['iconfont', item.icon]"></i>
            <span class="font-bold">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: 'Home', href: '/', icon: 'icon-house-chimney' },
  { label: 'About', href: '/about.html', icon: 'icon-about' },
]
</script>
