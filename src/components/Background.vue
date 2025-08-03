<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import StarTrails from './StarTrails.vue'

const starKey = ref(0)
const showStarTrails = ref(false)

function handleResize() {
  if (showStarTrails.value) {
    starKey.value++
  }
}

function checkModeAndMount() {
  const pure = localStorage.getItem('usePureBackground') === 'true'
  showStarTrails.value = !pure
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  checkModeAndMount()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// 提供给外部调用重新启用星轨
window.__enableStarTrails = () => {
  showStarTrails.value = true
  starKey.value++ // 强制重载
}
</script>

<template>
  <div
    id="star-canvas"
    class="fixed inset-0 -z-10 pointer-events-none"
  >
    <StarTrails
      v-if="showStarTrails"
      :key="starKey"
      class="absolute inset-0"
    />

    <div
      class="absolute bottom-0 left-0 w-full h-40vh pointer-events-none"
      style="background: linear-gradient(to top, #0e1111, transparent)"
    />
  </div>
</template>
