<template>
  <div class="fixed bottom-2 right-4 z-50 flex-col gap-4">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in notification.state.toasts"
        :key="toast.id"
        class="relative px-4 py-2 rounded-lg flex items-center justify-between min-w-50 min-h-10 mb-2 overflow-hidden transition-all duration-300"
        :class="{
          'bg-#fefefe dark:bg-white/10 text-#2f3f5b dark:text-white font-medium dark:backdrop-blur-md shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)]': toast.type === 'info',
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
          'bg-yellow-500 text-white': toast.type === 'warning'
        }"
      >
        <span class="z-1">{{ toast.message }}</span>

        <span
          v-if="toast.closable"
          class="z-1 ml-5 text-white font-bold hover:text-gray-200 cursor-pointer"
          @click="notification.remove(toast.id)"
        >×</span>

        <div
          class="absolute inset-0 origin-left animate-progress"
          :class="{
            'bg-black/5 dark:bg-white/20': toast.type === 'info',
            'bg-green-400': toast.type === 'success',
            'bg-red-400': toast.type === 'error',
            'bg-yellow-400': toast.type === 'warning'
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