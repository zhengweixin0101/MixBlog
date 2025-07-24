<script setup>
import Title from '@/components/PageTitle.vue'

import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const posts = import.meta.glob('/src/posts/*.md', { eager: true })

const searchTerm = ref('')

const tags = [
  'CDN', 'CloudFlare', 'OpenResty', 'Fly.io', 'mp4', 'Appnode', 'IPV6',
  'AWS', 'Alist', 'Docker', 'Web', 'PaaS', 'NextJS', 'fly.io', 'Paas'
]

// 文章列表，支持搜索
const filteredPosts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return Object.entries(posts)
    .map(([path, module]) => {
      const slug = path.split('/').pop().replace(/\.md$/, '')
      return {
        slug,
        title: module.frontmatter?.title || slug,
        date: module.frontmatter?.date || '未知日期',
        tags: module.frontmatter?.tags || []
      }
    })
    .filter(post => post.title.toLowerCase().includes(term))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})
</script>

<template>
  <main class="fade-in-start">
    <section class="layout py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Title text="Posts" />
      <p class="mt-2 text-gray-600 dark:text-gray-300" data-fade="1">
        Articles about Some of My Whimsical Ideas
      </p>

      <input
        v-model="searchTerm"
        placeholder="Search..."
        type="text"
        class="mt-4 w-full rounded-md dark:bg-dark border border-gray-300 dark:border-gray-600
               focus:border-primary-300 focus:outline-none focus:ring-0 dark:focus:border-primary-300"
        data-fade="2"
      />

      <div
        class="mt-2 flex flex-wrap items-baseline justify-start gap-2 text-sm text-gray-600 dark:text-gray-300"
        data-fade="3"
      >
        <span class="font-medium">Tag:</span>
        <a
          href="#skip-tags"
          class="inline-block rounded-md px-1.5 py-0.5 font-medium transition bg-gray-100 text-gray-700
                 hover:text-black disabled:bg-gray-200 disabled:text-gray-300 dark:bg-gray-700 dark:text-gray-200
                 dark:hover:text-white dark:disabled:bg-gray-600 dark:disabled:text-gray-500
                 focus:outline-none focus-visible:ring focus-visible:ring-primary-300
                 disabled:cursor-not-allowed pointer-events-none absolute opacity-0
                 focus:inline-block focus:translate-y-[1.4rem] focus:opacity-100"
          >Skip tag</a
        >
        <button
          v-for="tag in tags"
          :key="tag"
          disabled
          class="inline-block rounded-md px-1.5 py-0.5 font-medium transition-colors
                 bg-gray-100 text-gray-700 hover:text-black disabled:bg-gray-200 disabled:text-gray-300
                 dark:bg-gray-700 dark:text-gray-200 dark:hover:text-white dark:disabled:bg-gray-600
                 dark:disabled:text-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-primary-300
                 disabled:cursor-not-allowed"
        >
          {{ tag }}
        </button>
        <div id="skip-tags" class="hidden"></div>
      </div>

      <ul
        class="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        data-fade="5"
      >
        <li
          v-for="post in filteredPosts"
          :key="post.slug"
          class="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-dark
                 scale-100 hover:scale-[1.02] active:scale-[0.97] motion-safe:transform-gpu
                 transition duration-100 motion-reduce:hover:scale-100 animate-shadow"
        >
          <RouterLink
            :to="`/posts/${post.slug}.html`"
            class="block h-full rounded-md focus:outline-none focus-visible:ring focus-visible:ring-primary-300 p-4"
          >
            <h4 class="text-gray-800 dark:text-gray-100">{{ post.title }}</h4>
            <div
              class="mt-2 flex items-center justify-start gap-2 text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              <svg
                stroke="currentColor"
                fill="none"
                stroke-width="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                class="inline-block text-base"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <time
                class="transition-colors bg-gradient-to-tr from-primary-300/40 via-primary-300/40 to-primary-400/40
                       dark:from-primary-300 dark:to-primary-400 dark:bg-clip-text dark:text-transparent"
                :datetime="post.date !== '未知日期' ? post.date : null"
              >
                {{ post.date }}
              </time>
            </div>
          </RouterLink>
        </li>
      </ul>

      <div
        class="mt-8 flex flex-col items-start gap-4 md:flex-row-reverse md:justify-between"
      >
        <RouterLink
          to="/"
          class="animated-underline custom-link inline-flex items-center font-medium focus:outline-none
                 focus-visible:ring focus-visible:ring-primary-300 border-b border-dotted border-dark
                 hover:border-black/0"
        >
          <span
            class="dark:bg-gradient-to-tr dark:from-primary-300 dark:to-primary-400
                   dark:bg-clip-text dark:text-transparent"
            >← Back to Home</span
          >
        </RouterLink>
      </div>
    </section>
  </main>
</template>
