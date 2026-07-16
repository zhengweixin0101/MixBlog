<script setup>
import { siteConfig } from '@/siteConfig/main.js'
import { ref, onMounted, onUnmounted } from 'vue'

const currentYear = new Date().getFullYear()
const runTime = ref('加载中...')
const displayText = ref('')
const fullText = ref('')
const nextText = ref('')
const isDeleting = ref(false)

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

let typingTimer = null

async function fetchHitokoto() {
  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i')
    const data = await res.json()
    const hitokoto = data.hitokoto || ''
    const from = data.from || ''
    return from ? `「${hitokoto}」——${from}` : `「${hitokoto}」`
  } catch {
    return ''
  }
}

async function typeText() {
  if (!fullText.value) return
  
  if (displayText.value.length < fullText.value.length) {
    displayText.value = fullText.value.slice(0, displayText.value.length + 1)
    typingTimer = setTimeout(typeText, 150)
  } else {
    if (!nextText.value) {
      nextText.value = await fetchHitokoto()
    }
    typingTimer = setTimeout(() => {
      isDeleting.value = true
      deleteText()
    }, 6000)
  }
}

function deleteText() {
  if (displayText.value.length > 0) {
    displayText.value = displayText.value.slice(0, -1)
    typingTimer = setTimeout(deleteText, 50)
  } else {
    isDeleting.value = false
    fullText.value = nextText.value
    nextText.value = ''
    displayText.value = ''
    typeText()
  }
}

onMounted(async () => {
  calculateRunTime()
  setInterval(calculateRunTime, 1000)
  
  fullText.value = await fetchHitokoto()
  typeText()
})

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer)
})
</script>

<template>
  <div class="w-full h-0.3 bg-#2f3f5b/20 dark:bg-gray-700 my-8 transition-colors duration-300"></div>
  <footer class="mb-10 w-full text-sm text-#2f3f5b dark:text-gray-300 px-4">
    <div class="flex flex-col md:flex-row justify-between">
      <div class="flex flex-col gap-y-1">
        <div>© {{ currentYear }} {{ siteConfig.author.name }}. All rights reserved.</div>
        <div class="truncate min-h-[1.25rem]">{{ displayText }}<span class="animate-pulse">|</span></div>
      </div>
      <div class="flex flex-col gap-y-1 text-right">
        <div>本站居然苟活了 {{ runTime }}</div>
        <div>
          今日总访问量 <span id="busuanzi_today_pv">加载中...</span> 次 | 今日总访客数 <span id="busuanzi_today_uv">加载中...</span> 人
        </div>
      </div>
    </div>
  </footer>
</template>
