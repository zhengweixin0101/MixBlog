<script setup>
defineProps({
  post: { type: Object, required: true },
})
</script>

<template>
  <article
    :data-post-id="post.slug"
    class="card-base bg-surface transition-all duration-base hover:shadow-md hover:border-accent-line"
  >
    <NuxtLink
      :to="`/posts/${post.slug}`"
      class="block p-4 no-underline cursor-pointer"
    >
      <h4 class="text-ink text-lg font-semibold leading-snug break-words transition-colors duration-base">
        {{ post.title }}
      </h4>
      <p class="mt-2.5 text-ink-muted text-sm leading-relaxed break-words transition-colors duration-base">
        {{ post.description || '暂无描述' }}
      </p>

      <!-- 卡片底栏 -->
      <div class="mt-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-dashed border-line pt-2.5 text-sm text-ink-subtle">
        <time :datetime="post.date || null">{{ '发布于 ' + (post.date) || '未知日期' }}</time>

        <span v-if="post.tags?.length" class="flex flex-wrap gap-x-2.5 gap-y-1 text-xs">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="text-ink-subtle"
          >
            #{{ tag }}
          </span>
        </span>
      </div>
    </NuxtLink>
  </article>
</template>
