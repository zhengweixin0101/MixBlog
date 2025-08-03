<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import StarTrails from './StarTrails.vue'

const starKey = ref(0)

function handleResize() {
  // 每次窗口大小变化就改变 key，强制重载 StarTrails
  starKey.value++
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div
    id="background"
    class="fixed inset-0 -z-10 pointer-events-none"
  >
    <!-- 强制重载 -->
    <StarTrails :key="starKey" class="absolute inset-0" />

    <div
      class="absolute bottom-0 left-0 w-full h-40vh pointer-events-none"
      style="background: linear-gradient(to top, #0e1111, transparent)"
    />
  </div>
</template>
