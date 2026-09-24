/**
 * 全局弹窗
 * 调用方式（任意页面/组件）：
 *   const dialog = useDialog()
 *
 *   // 基础用法：自定义标题、内容、按钮（文字 + 点击操作）
 *   dialog.show({
 *     title: '标题',                    // 弹窗标题（可选）
 *     content: '内容文本',              // 正文内容（可选）
 *     html: false,                     // 为 true 时 content 按 HTML 渲染（可选）
 *     closable: true,                  // 是否允许 ESC / 点击遮罩关闭（可选，默认 true）
 *     showClose: false,                // 是否显示右上角关闭按钮（可选，默认 false）
 *     buttons: [                       // 底部按钮数组（可选）
 *       { text: '取消', type: 'default', onClick: () => {} },
 *       { text: '确定', type: 'primary', onClick: () => {}, close: true }
 *     ]                                // type: 'primary' | 'default'；close: 点击后是否关闭（默认 true）
 *   })
 *
 *   // Promise 用法：返回 boolean（确定 true / 取消、关闭 false）
 *   const ok = await dialog.confirm({ title: '确认', content: '确定删除？' })
 *
 *   dialog.hide()                      // 手动关闭
 */
 
<template>
  <Transition name="dialog" :duration="250">
    <div
      v-if="dialog.state.visible"
      class="fixed inset-0 z-10000 flex items-center justify-center p-4"
      @click.self="onOverlayClick"
    >
      <div class="dialog-backdrop absolute inset-0 bg-black/40 backdrop-blur-md" @click="onOverlayClick"></div>

      <div
        class="dialog-card relative w-full max-w-md rounded-xl bg-#fefefe/90 dark:bg-#1a1a1a/80 backdrop-blur-md
               text-#2f3f5b dark:text-white shadow-[0_0_12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_12px_rgba(255,255,255,0.15)]
               border border-white/40 dark:border-white/10 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          v-if="dialog.state.showClose"
          class="absolute right-3 top-3 z-1 p-0 bg-transparent border-0 text-2xl leading-none cursor-pointer
                 text-#2f3f5b/50 dark:text-white/50 hover:text-#2f3f5b dark:hover:text-white transition-colors"
          aria-label="关闭"
          @click="dialog.hide()"
        >×</button>

        <div
          v-if="dialog.state.title"
          class="px-5 pt-5 pb-2 text-center"
        >
          <div class="relative inline-block text-xl font-semibold text-#2f3f5b dark:text-gradient">
            <span class="absolute inset-0 -z-10
                  bg-gradient-to-r from-#00e699/50 to-#00e2d8/50
                  dark:hidden transition-colors duration-300"></span>
            {{ dialog.state.title }}
          </div>
        </div>

        <div
          v-if="dialog.state.content"
          class="px-5 pb-4 text-base leading-relaxed whitespace-pre-wrap break-words
                 text-#2f3f5b/90 dark:text-white/80"
          :class="{ 'pt-2': dialog.state.title }"
        >
          <span v-if="dialog.state.html" v-html="dialog.state.content"></span>
          <template v-else>{{ dialog.state.content }}</template>
        </div>

        <div
          v-if="dialog.state.buttons.length"
          class="flex gap-2 px-5 py-4 border-t border-black/5 dark:border-white/10"
        >
          <div
            v-for="(btn, index) in dialog.state.buttons"
            :key="index"
            class="flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            :class="btn.type === 'primary'
              ? `bg-[linear-gradient(rgba(0,0,0,0.08),rgba(0,0,0,0.08)),linear-gradient(90deg,#00e699,#00e2d8)]
                 dark:bg-[linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(90deg,#00e699,#00e2d8)]
                 text-white hover:brightness-90 dark:hover:opacity-75 shadow-sm`
              : 'bg-black/10 dark:bg-white/15 text-#2f3f5b dark:text-white hover:bg-black/15 dark:hover:bg-white/20'"
            @click="onBtnClick(btn)"
          >{{ btn.text }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()

function onOverlayClick() {
  if (dialog.state.closable) dialog.hide()
}

function onBtnClick(btn) {
  btn.onClick?.()
  if (btn.close !== false) dialog.hide()
}

function onKeydown(e) {
  if (e.key === 'Escape' && dialog.state.visible && dialog.state.closable) {
    dialog.hide()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.dialog-enter-active .dialog-backdrop,
.dialog-leave-active .dialog-backdrop {
  transition: opacity 0.2s ease;
}
.dialog-enter-from .dialog-backdrop,
.dialog-leave-to .dialog-backdrop {
  opacity: 0;
}

.dialog-enter-active .dialog-card,
.dialog-leave-active .dialog-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.dialog-enter-from .dialog-card,
.dialog-leave-to .dialog-card {
  transform: scale(0.92) translateY(10px);
  opacity: 0;
}
</style>
