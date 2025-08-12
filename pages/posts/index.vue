<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索和筛选相关状态
const searchTerm = ref('')
const selectedTag = ref('')
const revealedPosts = ref({})

// 调用API获取Posts数据
const { data: postsRaw } = await useAsyncData('post', () =>
  $fetch('https://blog-backend.zhengweixin0101.workers.dev/posts-list'),
  { server: true, immediate: false }
)

const posts = computed(() => postsRaw.value || [])

const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(post => {
    (post.tags || []).forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

function toggleTag(tag) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}

// 标记动画完成的文章
function markRevealed(slug) {
  if (!revealedPosts.value[slug]) {
    revealedPosts.value[slug] = true
  }
}

const filteredPosts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return posts.value
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(term)
      const matchesTag = !selectedTag.value || (post.tags || []).includes(selectedTag.value)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

function delayedNavigate(path) {
  setTimeout(() => {
    router.push(path)
  }, 200)
}
</script>

<template>
  <main v-fade-in>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <h1 data-fade class="text-3xl mt-40">
        <span
          class="relative inline-block transition-colors duration-300
                text-#2f3f5b
                dark:text-transparent
                dark:bg-gradient-to-r dark:from-[#00e699] dark:to-[#00e2d8]
                dark:bg-clip-text dark:-webkit-bg-clip-text
                dark:-webkit-text-fill-color-transparent"
        >
          Posts
          <span
            class="absolute inset-0 -z-10
                  bg-gradient-to-r from-[#00e69980] to-[#00e2d850]
                  dark:hidden"
          />
        </span>
      </h1>
      <p data-fade class="mt-2 text-#2f3f5b dark:text-gray-300 transition-colors duration-300">
        Articles about Some of My Whimsical Ideas.
      </p>

      <div data-fade class="relative mt-6 sm:mt-8 w-full">
        <i class="iconfont icon-sousuo absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
        <input
          v-model="searchTerm"
          placeholder="Search..."
          type="text"
          id="search"
          class="w-full h-12 pl-10 pr-4 rounded-xl border-none backdrop-blur
                bg-gray-200/50 text-#2f3f5b placeholder-gray-500
                dark:bg-white/10 dark:text-white dark:placeholder-gray-500
                transition-colors transition-shadow duration-300 
                focus:outline-none shadow-[0_0_0_0.5px_#00e699] dark:shadow-none focus:shadow-[0_0_0_1.5px_#00e699] dark:focus:shadow-[0_0_0_1px_#00e699]"
        />
      </div>

      <div data-fade class="mt-4 flex flex-wrap items-baseline justify-start gap-2 text-sm text-#2f3f5b dark:text-gray-400 transition-colors duration-300">
        <span class="font-bold">Tag:</span>
        <button
          v-for="tag in allTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="{
            'bg-black/15 text-#2f3f5b dark:bg-white/30 dark:text-white': selectedTag === tag,
            'bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80': selectedTag !== tag
          }"
          class="inline-block px-2 py-1 text-xs rounded-full transition-colors duration-300 cursor-pointer shadow-none border-none"
        >
          {{ tag }}
        </button>
      </div>

      <ul class="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
        <li
          v-for="post in filteredPosts"
          :key="post.slug + selectedTag + searchTerm"
          @animationend="() => markRevealed(post.slug)"
          :class="[
            'relative w-full h-160px rounded-xl list-none will-change-transform motion-safe:transform-gpu transition duration-300 animate-shadow',
            revealedPosts[post.slug]
              ? 'hover:shadow-[0_0_0_1px_#00e699] hover:scale-[1.02] active:scale-[0.97] cursor-pointer'
              : 'pointer-events-none opacity-80'
          ].join(' ')"
          @click="revealedPosts[post.slug] && delayedNavigate(`/posts/${post.slug}`)"
        >
          <div data-fade
            class="bg-black/3 dark:bg-white/10 block h-full rounded-xl p-4 no-underline focus:outline-none focus-visible:ring focus-visible:ring-[#00e699] transition-transform duration-300 active:scale-95 hover:scale-102"
          >
            <h4 class="text-#2f3f5b dark:text-white text-xl transition-colors duration-300">{{ post.title }}</h4>
            <p class="mt-1 text-#2f3f5b dark:text-gray-400 text-sm transition-colors duration-300">{{ post.description || '暂无描述' }}</p>
            <div
              class="absolute left-4 bottom-4 text-sm text-gray-400 pointer-events-none flex items-center gap-2"
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
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <time
                :datetime="post.date !== '' ? post.date : null"
                class="text-#2f3f5b dark:bg-gradient-to-r dark:from-[#00e699] dark:to-[#00e2d8] dark:bg-clip-text dark:text-transparent dark:-webkit-bg-clip-text"
              >
                {{ post.date || '未知日期' }}
              </time>
            </div>
            <div v-if="post.tags?.length" class="absolute right-4 bottom-4 flex flex-wrap gap-1">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="px-2 py-1 text-xs rounded-full bg-black/5 text-#2f3f5b dark:bg-white/10 dark:text-white/80 transition-colors duration-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </li>
      </ul>

      <div data-fade class="mt-8 flex flex-row items-center justify-end gap-4">
        <NuxtLink
          :key="$route.path + selectedTag + searchTerm"
          to="/"
          class="custom-gradient-link inline-flex relative font-medium text-#2f3f5b dark:bg-gradient-to-r dark:from-[#00e699] dark:to-[#00e2d8] dark:bg-clip-text dark:text-transparent dark:-webkit-bg-clip-text no-underline"
          data-fade
        >
          <span class="dark:bg-gradient-to-tr dark:from-primary-300 dark:to-primary-400 dark:bg-clip-text dark:text-transparent"
            >← Back to Home</span
          >
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style>
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