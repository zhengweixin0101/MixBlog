<script setup>
import Title from '@/components/PageTitle.vue'
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import matter from 'gray-matter'
import dayjs from 'dayjs'

// 读取原始 Markdown 内容
const rawPosts = import.meta.glob('/src/posts/*.md', { as: 'raw', eager: true })

const posts = Object.entries(rawPosts).map(([path, rawContent]) => {
  const { data: frontmatter, content } = matter(rawContent)
  const slug = path.split('/').pop().replace(/\.md$/, '')
  return {
    slug,
    title: frontmatter.title || slug,
    date: frontmatter.date || '未知日期',
    tags: frontmatter.tags || [],
    description: frontmatter.description || content.trim().slice(0, 20),
  }
})

const searchTerm = ref('')
const filteredPosts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return posts
    .filter((post) => post.title.toLowerCase().includes(term))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const router = useRouter()
function delayedNavigate(path) {
  setTimeout(() => {
    router.push(path)
  }, 200)
}

function formatDate(date) {
  if (!date || date === '未知日期') return '未知日期'
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<template>
  <main v-fade-in>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <Title data-fade text="Posts" />
      <p data-fade class="mt-2 text-gray-300">
        Articles about Some of My Whimsical Ideas
      </p>

      <div data-fade class="relative mt-6 sm:mt-8 w-full">
        <i class="iconfont icon-sousuo absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
        <input
          v-model="searchTerm"
          placeholder="Search..."
          type="text"
          class="w-full h-12 pl-10 pr-4 rounded-xl border-none
                 backdrop-blur bg-white/10 placeholder-gray-500 text-white
                 transition-shadow duration-300 focus:outline-none focus:shadow-[0_0_0_1px_#00e699]"
        />
      </div>

      <ul class="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
        <li
          v-for="post in filteredPosts"
          :key="post.slug"
          data-fade
          class="relative w-full h-160px rounded-xl list-none will-change-transform
                 scale-100 hover:scale-[1.02] active:scale-[0.97]
                 motion-safe:transform-gpu motion-reduce:hover:scale-100 transition duration-200
                 animate-shadow backdrop-blur bg-white/10"
        >
          <div
            class="block h-full rounded-md p-4 no-underline
                   focus:outline-none focus-visible:ring focus-visible:ring-[#00e699]
                   transition-transform duration-200 active:scale-95 cursor-pointer"
            @click="delayedNavigate(`/posts/${post.slug}.html`)"
          >
            <h4 class="text-white text-xl">{{ post.title }}</h4>
            <p class="mt-1 text-gray-400 text-sm">{{ post.description }}</p>

            <div class="absolute left-4 bottom-4 text-sm text-gray-400 pointer-events-none flex items-center gap-2">
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
              <time :datetime="post.date !== '未知日期' ? post.date : null"
                    class="bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent -webkit-bg-clip-text"
              >
                {{ formatDate(post.date) }}
              </time>
            </div>
          </div>
        </li>
      </ul>

      <div data-fade class="mt-8 flex flex-row items-center justify-end gap-4">
        <RouterLink
          to="/"
          class="custom-gradient-link inline-flex relative font-medium
                  bg-gradient-to-r from-[#00e699] to-[#00e2d8]
                  bg-clip-text text-transparent -webkit-bg-clip-text
                  no-underline"
        >
          <span
            class="dark:bg-gradient-to-tr dark:from-primary-300 dark:to-primary-400 dark:bg-clip-text dark:text-transparent">
            ← Back to Home
          </span>
        </RouterLink>
      </div>
    </section>
  </main>
  <div class="mb-50"></div>
</template>

<style>
.custom-gradient-link {
  position: relative;
  border-bottom: 1.5px dotted white;
  transition: border-bottom-color 0.5s ease;
  --underline-width: 0%;
}
.custom-gradient-link::after {
  content: "";
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
