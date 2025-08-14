<template>
  <!-- 404 页面 -->
  <section v-fade-in class="bg-#0e1111 min-h-screen flex flex-col items-center justify-center text-center text-white px-6">
    <!-- 图标 -->
    <div data-fade>
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 24 24"
        class="drop-shadow-glow animate-flicker text-yellow-300"
        height="60"
        width="60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path
            d="M4 20v-6a8 8 0 1 1 16 0v6h1v2H3v-2h1zm2-6h2a4 4 0 0 1 4-4V8a6 6 0 0 0-6 6zm5-12h2v3h-2V2zm8.778 2.808l1.414 1.414-2.12 2.121-1.415-1.414 2.121-2.121zM2.808 6.222l1.414-1.414 2.121 2.12L4.93 8.344 2.808 6.222z"
          ></path>
        </g>
      </svg>
    </div>

    <!-- 标题 -->
    <h1 data-fade class="mt-8 text-3xl sm:text-5xl font-bold">Page Not Found</h1>

    <!-- 返回按钮 -->
      <div data-fade class="mt-10 flex flex-row items-center justify-end gap-4">
        <NuxtLink
          to="/"
          class="custom-gradient-link inline-flex relative font-medium no-underline"
          data-fade
        >
          <span class="text-gradient"
            >← Back to Home</span
          >
        </NuxtLink>
      </div>
  </section>
</template>

<script setup>
import { useHead } from '#imports'
import { siteConfig } from '@/site.config.js'

definePageMeta({
  layout: false, // 不使用默认布局
})

//head
useHead({
  titleTemplate: `Not Found | ${siteConfig.title}`,
})
</script>

<style>
/* 闪烁动画 */
@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 22%, 24%, 55% { opacity: 0.4; }
}
.animate-flicker {
  animation: flicker 1.5s infinite;
}

/* 阴影光晕 */
.drop-shadow-glow {
  filter: drop-shadow(0 0 10px #facc15);
}

/* 下划线动画 */
.custom-gradient-link {
  position: relative;
  border-bottom: 1.5px dotted white;
  transition: border-bottom-color 0.5s ease;
  --underline-width: 0%;
}
.custom-gradient-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #00e699, #00e2d8);
  width: var(--underline-width);
  transition: width 0.3s ease;
  border-radius: 9999px;
  pointer-events: none;
}
.custom-gradient-link:hover {
  border-bottom-color: transparent;
}
.custom-gradient-link:hover::after {
  --underline-width: 100%;
}
</style>
