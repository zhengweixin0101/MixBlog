<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// 直接批量导入所有 Markdown 文件（必须配置了 vite-plugin-md）
const posts = import.meta.glob('../posts/*.md', { eager: true })

// 处理成数组并读取 frontmatter
const postList = computed(() =>
  Object.entries(posts).map(([path, module]) => {
    const slug = path.split('/').pop().replace('.md', '')
    return {
      slug,
      title: module.frontmatter?.title || slug,
      date: module.frontmatter?.date || '未知日期',
    }
  }).sort((a, b) => (a.date < b.date ? 1 : -1))
)
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-6">文章列表</h1>
    <ul>
      <li v-for="post in postList" :key="post.slug" class="mb-3">
        <RouterLink
          :to="`/posts/${post.slug}.html`"
          class="text-xl text-[#00e699] hover:underline"
        >
          {{ post.title }}
        </RouterLink>
        <span class="text-gray-400 ml-3 text-sm">{{ post.date }}</span>
      </li>
    </ul>
  </div>
</template>