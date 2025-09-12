<script setup>
import { computed } from 'vue'
import { useHead } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import { appsConfig } from '@/siteConfig/apps.js'

// head 信息
useHead({
  titleTemplate: `Apps | ${siteConfig.title}`,
  meta: [
    { name: 'description', content: `This is a list of applications developed or deployed by ${siteConfig.author.name}.` },
    { name: 'keywords', content: `${siteConfig.keywords},应用列表,apps,list` },
    { property: 'og:title', content: `Apps | ${siteConfig.title}` },
    { property: 'og:description', content: `This is a list of applications developed or deployed by ${siteConfig.author.name}.` },
    { property: 'og:url', content: `${siteConfig.url}/apps` },
    { name: 'twitter:title', content: `Apps | ${siteConfig.title}` },
    { name: 'twitter:description', content: `This is a list of applications developed or deployed by ${siteConfig.author.name}.` },
  ],
})

const apps = computed(() => appsConfig.appsData || [])
</script>

<template>
  <main v-fade-in>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <!-- 标题 -->
      <h1 data-fade class="text-3xl mt-40">
        <span class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient">
          Apps
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-#00e699/50 to-#00e2d8/50
                  dark:hidden transition-colors duration-300"
          ></span>
        </span>
      </h1>
      <p data-fade class="mt-2 text-#2f3f5b dark:text-gray-300 transition-colors duration-300">
        Some of my deployed projects.
      </p>

      <!-- 卡片列表 -->
      <ul class="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
        <li data-fade
          v-for="app in apps"
          :key="app.link"
          class="relative w-full h-120px rounded-xl list-none outline-none bg-#fefefe dark:bg-white/10 
                 shadow-[0_0_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_0_1px_#00e699] hover:scale-102 active:scale-98 transition-all duration-300"
        >
          <a
            :href="app.link"
            target="_blank"
            class="block h-full rounded-xl no-underline focus:outline-none cursor-pointer"
          >
            <div class="h-full rounded-xl p-4 no-underline">
              <h4 class="text-#2f3f5b dark:text-white text-base font-semibold truncate transition-colors duration-300">
                {{ app.name }}
              </h4>
              <p class="mt-1 text-#2f3f5b dark:text-gray-400 text-sm truncate transition-colors duration-300">
                {{ app.description }}
              </p>
            </div>
            <div class="-mt-9 ml-4 text-#2f3f5b dark:text-white transition-colors duration-300">
                <span class="dark:text-gradient">Go to →</span>
            </div>
          </a>
        </li>
      </ul>

      <!-- 返回首页 -->
      <div data-fade class="mt-8 flex flex-row items-center justify-end gap-4">
        <NuxtLink
          to="/"
          class="custom-gradient-link inline-flex relative font-medium text-#2f3f5b no-underline"
          data-fade
        >
          <span class="dark:text-gradient">← Back to Home</span>
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-#00e699/30 to-#00e2d8/30
                  dark:hidden transition-colors duration-300"
          ></span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>