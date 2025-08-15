<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

import { aboutConfig } from '@/siteConfig/about.js'
import { siteConfig } from '@/siteConfig/main.js'
 
//标签位置
function leftTagPosition(index) {
  return [
    'top-12 left-14',
    'top-25 left-10',
    'bottom-10 left-14'
  ][index] || ''
}

function rightTagPosition(index) {
  return [
    'top-12 right-14',
    'top-25 right-10',
    'bottom-12 right-14'
  ][index] || ''
}

//tips切换动画
const tips = aboutConfig.author.tips
const current = ref(0)

onMounted(() => {
  setInterval(() => {
    current.value = (current.value + 1) % tips.length
  }, 2000)
})

//欢迎卡片
const helloAboutEl = ref(null)
const cursorEl = ref(null)
const shapeEls = ref([])

const shapesConfig = [
  { color: '#66c6ba', size: 650 },
  { color: '#a4e5d9', size: 440 },
  { color: '#c8f4de', size: 270 },
]

let mouseMoveHandler = null

onMounted(() => {
  shapeEls.value = helloAboutEl.value.querySelectorAll('.shape')

  const container = helloAboutEl.value
  const cursor = cursorEl.value
  const shapes = shapeEls.value

  const rect = container.getBoundingClientRect()
  
  // 容器中心
  const centerX = rect.width / 2 - cursor.offsetWidth / 2
  const centerY = rect.height / 2 - cursor.offsetHeight / 2

  // 初始化位置，默认在中心
  gsap.set(cursor, { x: centerX, y: centerY })
  gsap.set(shapes, { x: centerX, y: centerY })

  // 鼠标移动跟随
  mouseMoveHandler = evt => {
    const rect = container.getBoundingClientRect()
    const mouseX = evt.clientX - rect.left - cursor.offsetWidth / 2
    const mouseY = evt.clientY - rect.top - cursor.offsetHeight / 2

    gsap.set(cursor, { x: mouseX, y: mouseY })
    gsap.to(shapes, {
      x: mouseX,
      y: mouseY,
      stagger: -0.1,
      overwrite: 'auto',
      ease: 'power3.out'
    })
  }

  container.addEventListener('mousemove', mouseMoveHandler)
})

onBeforeUnmount(() => {
  const container = helloAboutEl.value
  if (container) {
    container.removeEventListener('mousemove', mouseMoveHandler)
  }
})
</script>

<template>
  <main v-fade-in class="mt-17 md:mt-15">
    <div class="relative flex justify-center items-center transition-colors duration-300">
      <!-- 左侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.left"
          :key="'left-' + i"
          class="author-tag absolute rounded-full bg-white dark:bg-white/15 py-1 px-2 shadow"
          :class="leftTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
      <!-- 中间头像 -->
      <div data-fade class="w-35 h-35 md:w-40 md:h-40 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <img
          src="https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover transition-transform duration-300 md:hover:rotate-360"
          draggable="false"
        />
      </div>
      <!-- 右侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.right"
          :key="'right-' + i"
          class="author-tag absolute rounded-full bg-white dark:bg-white/15 py-1 px-2 shadow"
          :class="rightTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <h1 data-fade class="text-3xl flex justify-center mt-5 md:mt--5">
      <span class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient">
        关于我
        <span class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/50 to-#00e2d8/50 dark:hidden transition-colors duration-300"/>
      </span>
    </h1>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <div class="flex-1 md:flex-[3_3_0%] bg-gradient-to-r from-[#233142] to-[#455d7a] text-white p-5 rounded-2xl min-w-full md:min-w-[300px] flex flex-col justify-center gap-2">
        <div class="text-sm opacity-90">Hi，很高兴认识你！👋</div>
        <div class="text-3xl font-bold">我叫
          <span class="relative inline-block">
            <span class="text-gradient">
              {{ aboutConfig.author.name }}
            </span>
          </span>
        </div>
        <div class="text-sm opacity-90">{{ aboutConfig.author.description }}</div>
      </div>

      <div class="flex-1 md:flex-[2_2_0%] bg-white dark:bg-white/10 p-5 rounded-2xl shadow min-w-full md:min-w-[200px] aboutsiteTips relative transition-colors duration-300">
        <div class="author-content-item-tips text-xs absolute text-gray-400">追求</div>
        <h2 class="text-3xl font-bold mt-5">
          源于<br>
          热爱而去 感受<br>
          <div class="mask relative inline-block overflow-hidden mt-2" style="height:3rem">
            <transition name="slide" mode="out-in">
              <div
                :key="current"
                :style="{ color: tips[current].color }"
                class="text-3xl font-bold"
              >
                {{ tips[current].text }}
              </div>
            </transition>
          </div>
        </h2>
      </div>
    </div>

    <!-- 欢迎卡片 -->
    <div data-fade ref="helloAboutEl" class="hidden md:block relative overflow-hidden select-none rounded-2xl auto shadow">
      <!-- 小圆点 -->
      <div ref="cursorEl" class="absolute w-5 h-5 rounded-full bg-#70a1d7 pointer-events-none z-10"></div>

      <!-- 圆形 -->
      <div class="relative w-full h-[245px] overflow-hidden">
        <div
          v-for="(shape, index) in shapesConfig"
          :key="index"
          class="shape absolute rounded-full"
          :style="{
            width: shape.size + 'px',
            height: shape.size + 'px',
            margin: (-shape.size / 2) + 'px 0 0 ' + (-shape.size / 2) + 'px',
            background: shape.color
          }"
          ref="shapeEls"
        ></div>
      </div>

      <!-- 内容 -->
      <div class="absolute top-0 left-0 w-full h-[250px] flex justify-center items-center bg-white mix-blend-screen dark:bg-#649dad transition-colors duration-300">
        <h2 class="text-[clamp(80px,8vw,140px)] text-#649dad dark:text-white flex items-center justify-center">{{ aboutConfig.helloCard.text }}</h2>
      </div>
    </div>
  </main>
</template>

<style>
/* 标签动画 */
.author-tag {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

.author-tag:nth-child(1) { animation-delay: 0s; }
.author-tag:nth-child(2) { animation-delay: 0.5s; }
.author-tag:nth-child(3) { animation-delay: 1s; }
.author-tag:nth-child(4) { animation-delay: 1.5s; }
.author-tag:nth-child(5) { animation-delay: 2s; }
.author-tag:nth-child(6) { animation-delay: 2.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* tips动画 */
.slide-enter-from { transform: translateY(100%); opacity:0; }
.slide-enter-to   { transform: translateY(0%);   opacity:1; }
.slide-leave-from { transform: translateY(0%);   opacity:1; }
.slide-leave-to   { transform: translateY(-100%); opacity:0; }
.slide-enter-active,
.slide-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
</style>