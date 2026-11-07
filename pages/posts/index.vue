<script setup>
import { ref, computed } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import { usePostsMasonry } from '@/composables/usePostsMasonry'

usePageMeta('文章', `${siteConfig.description}`, '/posts', '文章,列表,posts,list')

const searchTerm = ref('')
const selectedTag = ref('')

const { data: postsRaw } = await useAsyncData('posts-list', () =>
  $fetch(`${siteConfig.apiUrl}/api/articles`),
  { server: true }
)

const posts = computed(() => postsRaw.value?.data || [])

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

// 双列瀑布流
const { listEl, columns, twoCols } = usePostsMasonry(filteredPosts)
</script>

<template>
  <main>
    <section class="py-12 w-full max-w-[65rem] mx-auto">
      <h1 data-fade class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">文章</span>
      </h1>
      <p data-fade="2" class="mt-2 text-ink-muted transition-colors duration-base">
        一些奇思妙想的文章。
      </p>

      <div data-fade>
        <div class="relative mt-6 sm:mt-8 w-full">
          <AppIcon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            v-model="searchTerm"
            placeholder="Search..."
            type="text"
            id="search"
            class="field-base appearance-none w-full h-12 pl-12 pr-4 rounded-xl
                  border border-line hover:border-line-field
                  focus:border-accent-line focus-visible:field-ring
                  transition-all duration-base
                  text-ink placeholder-ink-subtle outline-none"
          />
        </div>

        <div class="mt-4 flex flex-wrap items-baseline justify-start gap-2 text-sm text-ink-muted transition-colors duration-base">
          <span class="font-bold">Tag:</span>
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="{
              'bg-accent-soft text-ink border-accent-line': selectedTag === tag,
              'bg-surface-2 text-ink-muted hover:text-ink': selectedTag !== tag
            }"
            class="inline-block px-2 py-1 text-xs rounded-full transition duration-base ease-spring cursor-pointer shadow-none border-none active:scale-95"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <div data-fade>
        <!-- 桌面端双列瀑布流 -->
        <div v-if="twoCols" ref="listEl" class="mt-8 flex items-start gap-[18px]">
          <div
            v-for="(colPosts, ci) in columns"
            :key="ci"
            class="flex flex-1 min-w-0 flex-col gap-[18px]"
          >
            <PostCard
              v-for="post in colPosts"
              :key="post.slug"
              :post="post"
            />
          </div>
        </div>

        <!-- 移动端单列 -->
        <ul v-else class="mt-8 grid grid-cols-1 gap-4 list-none">
          <li v-for="post in filteredPosts" :key="post.slug">
            <PostCard :post="post" />
          </li>
        </ul>

        <div class="mt-8 flex flex-row items-center justify-end gap-4">
          <BackLink to="/" text="← 返回首页" />
        </div>
      </div>
    </section>
  </main>
</template>
