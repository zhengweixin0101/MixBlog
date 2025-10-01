<template>
  <div class="fixed bottom-2 right-4 z-50 flex-col gap-4">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in notification.state.toasts"
        :key="toast.id"
        class="relative px-4 py-2 rounded-lg flex items-center justify-between min-w-50 min-h-10 mb-2 overflow-hidden transition-all duration-300"
        :class="{
          'bg-#fefefe dark:bg-white/20 text-#2f3f5b dark:text-white font-medium shadow-[0_0_2px_rgba(0,0,0,0.2)]': toast.type === 'info',
          'bg-green-500': toast.type === 'success',
          'bg-red-500': toast.type === 'error',
          'bg-yellow-500': toast.type === 'warning'
        }"
      >
        <span>{{ toast.message }}</span>

        <span
          v-if="toast.closable"
          class="ml-2 text-white font-bold hover:text-gray-200 cursor-pointer"
          @click="notification.remove(toast.id)"
        >×</span>

        <div
          class="absolute inset-0 origin-left animate-progress"
          :class="{
            'bg-black/5 dark:bg-white/20': toast.type === 'info',
            'bg-green-300': toast.type === 'success',
            'bg-red-300': toast.type === 'error',
            'bg-yellow-300': toast.type === 'warning'
          }"
          :style="{ animationDuration: toast.duration + 'ms' }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotification } from '~/composables/useNotification'

const notification = useNotification()
</script>

<style>
.toast-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
.toast-leave-active {
  transition: all 0.4s ease;
}

@keyframes progress {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.animate-progress {
  transform-origin: left;
  transform: scaleX(0);
  animation-name: progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
</style>