<template>
  <nav class="w-full py-8 fixed z-50 bg-#0e1111">
    <div class="max-w-screen-xl">
      <ul class="flex space-x-4 list-none">
        <li v-for="(item, index) in navItems" :key="index">
          <router-link
            :to="item.href"
            :class="route.path === item.href
              ? 'bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent font-bold'
              : 'text-white no-underline font-bold'"
          >
            {{ item.label }}
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
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about.html' },
]
</script>
