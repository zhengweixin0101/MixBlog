<script setup>
/**
 * 全站统一图标：morphicons/vue 渲染 lucide IconNode
 * name 变化时自动播放形变动画
 */
import { MorphIcon } from 'morphicons/vue'
import { getIcon } from '@/utils/icons'

const props = defineProps({
  // utils/icons 里的键；siteConfig 的 navItems/socialLinks 存的也是这里的键
  name: { type: String, required: true },
  size: { type: [Number, String], default: '1em' },
  strokeWidth: { type: [Number, String], default: 2 },
  // 传入则是 role="img" + <title>；不传保持 aria-hidden
  label: { type: String, default: undefined },
})

const icon = computed(() => getIcon(props.name))
</script>

<template>
  <MorphIcon
    :icon="icon"
    :size="size"
    :stroke-width="strokeWidth"
    :label="label"
  />
</template>

<style scoped>
/* 默认尺寸走字号（1em）；下移一点对齐字体 em 框 */
svg {
  display: inline-block;
  vertical-align: -0.15em;
  flex-shrink: 0;
}
</style>
