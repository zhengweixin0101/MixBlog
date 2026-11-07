/**
 * 返回链接
 *   <BackLink />                                  // 默认：跳转 /，文字「← 返回首页」
 *   <BackLink to="/posts" text="← 返回文章列表" /> // 自定义跳转地址与文字
 */

<template>
  <NuxtLink
    :to="to"
    class="custom-gradient-link inline-flex relative font-medium text-ink no-underline"
  >
    <span class="dark:text-gradient">{{ text }}</span>
  </NuxtLink>
</template>

<script setup>
defineProps({
  to: { type: String, default: '/' },
  text: { type: String, default: '← 返回首页' },
})
</script>

<style>
.custom-gradient-link {
  position: relative;
  /* 点线颜色走 token */
  border-bottom: 1.5px dotted var(--line-strong);
  transition: border-bottom-color 0.5s ease;
  --underline-width: 0%;
}
.custom-gradient-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--accent-gradient);
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
