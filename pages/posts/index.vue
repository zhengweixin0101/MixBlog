<script setup>
import { ref, computed } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'

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
</script>

<template>
  <main v-fade-in>
    <section class="py-12 w-full max-w-screen-xl mx-auto">
      <h1 data-fade class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">文章</span>
      </h1>
      <p data-fade class="mt-2 text-ink-muted transition-colors duration-base">
        一些奇思妙想的文章。
      </p>

      <div data-fade class="relative mt-6 sm:mt-8 w-full">
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

      <div data-fade class="mt-4 flex flex-wrap items-baseline justify-start gap-2 text-sm text-ink-muted transition-colors duration-base">
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

      <ul :key="selectedTag + '-' + searchTerm" class="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3">
        <li data-fade
          v-for="post in filteredPosts"
          class="card-base relative w-full h-160px list-none bg-surface hover:shadow-md hover:border-accent-line
                 transition-all duration-base"
        >
          <NuxtLink
            :to="`/posts/${post.slug}`"
            class="block h-full no-underline cursor-pointer"
          >
            <div class="h-full p-4 no-underline" >
              <h4 class="text-ink text-base font-semibold leading-snug transition-colors duration-base">{{ post.title }}</h4>
              <p class="mt-1.5 text-ink-muted text-sm leading-relaxed transition-colors duration-base">
                {{ post.description || '暂无描述' }}
              </p>

              <div class="absolute left-4 bottom-4 text-sm text-ink-subtle pointer-events-none flex items-center">
                <AppIcon name="clock" />
                <time
                  :datetime="post.date !== '' ? post.date : null"
                  class="ml-0.5"
                >
                  {{ post.date || '未知日期' }}
                </time>
              </div>

              <div v-if="post.tags?.length" class="absolute right-4 bottom-4 flex flex-wrap gap-1">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="px-2 py-1 text-xs rounded-full bg-surface-4 text-ink-muted"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <div data-fade class="mt-8 flex flex-row items-center justify-end gap-4">
        <BackLink to="/" text="← 返回首页" />
      </div>
    </section>
  </main>
</template>

