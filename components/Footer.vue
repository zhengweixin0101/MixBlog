<script setup>
import { siteConfig } from '@/siteConfig/main.js'
import { ref, onMounted, onUnmounted } from 'vue'

const currentYear = new Date().getFullYear()
const runTime = ref('加载中...')

const calculateRunTime = () => {
  const startDate = new Date(siteConfig.startDate)
  const now = new Date()
  const diff = now - startDate
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  runTime.value = `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`
}

let timer = null

onMounted(() => {
  calculateRunTime()
  timer = setInterval(calculateRunTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="w-full h-0.3 bg-#2f3f5b/20 dark:bg-gray-700 my-8 transition-colors duration-300"></div>
  <footer class="mb-10 w-full text-center text-#2f3f5b dark:text-gray-300 text-sm">
    <p>© {{ currentYear }} {{ siteConfig.author.name }}. All rights reserved.</p>
    <p class="mt-2">本站居然苟活了 {{ runTime }}</p>
    <p class="mt-2">
      今日总访问量 <span id="busuanzi_today_pv">加载中...</span> 次 | 今日总访客数 <span id="busuanzi_today_uv">加载中...</span> 人
    </p>
  </footer>
</template>
