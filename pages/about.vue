<script setup>
import { aboutConfig } from '@/siteConfig/about.js'

function leftTagPosition(index) {
  return [
    'top-14 left-16',
    'top-25 left-10',
    'bottom-14 left-16'
  ][index] || ''
}

function rightTagPosition(index) {
  return [
    'top-14 right-16',
    'top-25 right-10',
    'bottom-14 right-16'
  ][index] || ''
}
</script>

<template>
  <main v-fade-in class="mt-25">
    <div data-fade class="hidden relative flex justify-center items-center">
      <!-- 左侧标签组 -->
      <div class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.authorTags.left"
          :key="'left-' + i"
          class="author-tag absolute"
          :class="leftTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
      <!-- 中间头像 -->
      <div class="w-35 h-35 md:w-40 md:h-40 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <img
          src="https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover transition-transform duration-300 md:hover:rotate-360"
          draggable="false"
        />
      </div>
      <!-- 右侧标签组 -->
      <div class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.authorTags.right"
          :key="'right-' + i"
          class="author-tag absolute"
          :class="rightTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <h1 data-fade class="text-3xl mt-5">
      <span class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient">
        About Me
        <span class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/50 to-#00e2d8/50 dark:hidden transition-colors duration-300"/>
      </span>
    </h1>
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
</style>