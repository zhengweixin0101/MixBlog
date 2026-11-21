<template>
  <Transition name="page-loader" @after-leave="onAfterLeave">
    <div v-if="visible" class="page-loader" role="status" aria-live="polite" aria-label="页面加载中">
      <div class="page-loader-bg-light"></div>
      <div class="page-loader-bg-dark"></div>
      <div class="page-loader-content">
        <div class="page-loader-dots">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const visible = ref(true)

onMounted(async () => {
  // 至少展示一小段时间，避免首屏瞬间闪过；同时等页面内容渲染稳定后再淡出
  const minShow = new Promise(resolve => setTimeout(resolve, 450))
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve()))
  await minShow
  visible.value = false
})

// 遮罩彻底淡出后才放行页面的浮现动画，避免两者交叠
function onAfterLeave() {
  window.dispatchEvent(new Event('page-loader-done'))
}
</script>

<style scoped>
.page-loader {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 与 Background.vue 一样的双层渐变，和页面底色完全一致，不割裂 */
.page-loader-bg-light,
.page-loader-bg-dark {
  position: absolute;
  inset: 0;
  transition: opacity var(--dur-slow) var(--ease-out);
}
.page-loader-bg-light {
  background-image: var(--bg-grad-light);
  opacity: 1;
}
.page-loader-bg-dark {
  background-image: var(--bg-grad-dark);
  opacity: 0;
}
html.dark .page-loader-bg-light {
  opacity: 0;
}
html.dark .page-loader-bg-dark {
  opacity: 1;
}

.page-loader-content {
  position: relative;
}

/* 圆点波浪 */
.page-loader-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 28px;
  --dot-ease: cubic-bezier(0.37, 0, 0.63, 1);
}
.page-loader-dots span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--accent);
  animation: page-loader-dot 1s var(--dot-ease) infinite backwards;
  will-change: transform, opacity;
}
.page-loader-dots span:nth-child(1) { animation-delay: 0s; }
.page-loader-dots span:nth-child(2) { animation-delay: 0.1s; }
.page-loader-dots span:nth-child(3) { animation-delay: 0.2s; }
.page-loader-dots span:nth-child(4) { animation-delay: 0.3s; }
.page-loader-dots span:nth-child(5) { animation-delay: 0.4s; }
@keyframes page-loader-dot {
  0% {
    transform: scale(0.45);
    opacity: 0.35;
  }
  30% {
    transform: scale(1);
    opacity: 1;
  }
  60%, 100% {
    transform: scale(0.45);
    opacity: 0.35;
  }
}

/* 淡出后整层消失，不再遮挡页面交互 */
.page-loader-leave-active {
  transition: opacity var(--dur-slow) var(--ease-out);
}
.page-loader-leave-to {
  opacity: 0;
}
</style>
