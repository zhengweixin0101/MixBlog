<script setup>
defineProps({
  post: { type: Object, required: true },
  // 已播完一次 fade-in 的卡片：重建/归位时直接终态渲染，不重播入场动画
  settled: { type: Boolean, default: false },
  // 入场动画序位（data-fade 数字，发布会按它排进度）；0 退回 DOM 顺序
  fadeRank: { type: Number, default: 0 }
})

const emit = defineEmits(['fade-done'])

function onAnimationEnd(event) {
  if (event.target !== event.currentTarget || event.animationName !== 'fade-in') return
  emit('fade-done')
}
</script>

<template>
  <article
    :data-fade="fadeRank > 0 ? String(fadeRank) : ''"
    :data-post-id="post.slug"
    class="card-base bg-surface transition-all duration-base hover:shadow-md hover:border-accent-line"
    :class="settled && 'fade-settled'"
    @animationend="onAnimationEnd"
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

<style scoped>
/* 入场动画播过的卡片：再次被移列重建时以终态出现，压过全局的 .fade-in-start [data-fade] 重播 */
.fade-settled[data-fade] {
  animation: none;
  opacity: 1;
  transform: none;
  visibility: visible;
}
</style>
