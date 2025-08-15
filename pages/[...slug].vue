<template>
  <section v-fade-in class="min-h-screen flex flex-col items-center justify-center text-center text-white px-6">
    <div class="min-h-screen flex flex-col items-center justify-center text-center text-white px-6">
      <div data-fade>
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="0"
          viewBox="0 0 24 24"
          class="drop-shadow-glow animate-flicker text-yellow-500"
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
      <h1 data-fade class="mt-8 text-3xl sm:text-5xl font-bold text-#2f3f5b dark:text-#CCC">Page not found.</h1>
      <div data-fade class="mt-10 flex flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/"
          class="custom-gradient-link inline-flex relative font-medium text-#2f3f5b no-underline"
          data-fade
        >
          <span class="dark:text-gradient"
            >← Back to Home</span
          >
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-#00e699/30 to-#00e2d8/30
                  dark:hidden transition-colors duration-300"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useHead } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'

//head
useHead({
  titleTemplate: `Not Found | ${siteConfig.title}`,
  meta: [
    { name: 'description', content: `该页面不存在或已被删除。` },
    { name: 'keywords', content: `Not Found,404,不存在,${siteConfig.keywords}` },
    { property: 'og:title', content: `Not Found | ${siteConfig.title}` },
    { property: 'og:description', content: `该页面不存在或已被删除。` },
    { name: 'twitter:title', content: `Not Found | ${siteConfig.title}` },
    { name: 'twitter:description', content: `该页面不存在或已被删除。` },
  ],
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
</style>