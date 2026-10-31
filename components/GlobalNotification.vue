/**
 * 全局右下角 Toast 通知
 *   const notification = useNotification()
 *   notification.show('消息内容')
 *   notification.show('保存成功', 'success', 3000, true)  // 消息 / 类型 / 时长(ms，0 不自动关) / 可手动关
 *   notification.remove(id)                              // type: info | success | error | warning
 */

<template>
  <div class="fixed bottom-4 right-4 z-650 flex flex-col items-end">
    <transition-group name="toast" tag="div" class="flex flex-col items-end gap-2">
      <div
        v-for="toast in notification.state.toasts"
        :key="toast.id"
        class="relative px-4 py-2 rounded-lg flex items-center justify-between min-w-50 min-h-10 max-w-[min(80vw,40rem)] overflow-hidden transition-all duration-base"
        :class="{
          'border border-line bg-overlay text-ink shadow-lg': toast.type === 'info',
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
          'bg-yellow-500 text-white': toast.type === 'warning'
        }"
      >
        <span class="z-1 font-semibold">{{ toast.message }}</span>

        <span
          v-if="toast.closable"
          class="z-1 ml-5 font-medium opacity-60 hover:opacity-100 transition-all cursor-pointer select-none"
          :class="toast.type === 'info' ? 'text-ink-muted hover:text-ink' : 'text-white font-bold hover:text-gray-200'"
          @click="notification.remove(toast.id)"
        >×</span>

        <div
          class="absolute inset-0 origin-left animate-progress"
          :class="{
            'bg-progress-fill opacity-70': toast.type === 'info',
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
/* 进出场动画 */
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