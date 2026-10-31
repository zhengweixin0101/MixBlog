<template>
  <Teleport to="body">
    <Transition name="share-dialog" :duration="250">
      <div
        v-if="shareDialog.state.visible"
        class="share-overlay fixed inset-0 z-200 flex items-center justify-center p-4"
        @click.self="onOverlayClick"
      >
      <div class="share-backdrop absolute inset-0 bg-black/40 backdrop-blur-md" @click="onOverlayClick"></div>

      <div
        class="share-card relative w-full max-w-md rounded-xl border border-line bg-overlay
               text-ink shadow-lg
               overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div class="px-5 pt-5 pb-3">
          <div v-if="shareDialog.state.loading" class="h-5 w-36 rounded skeleton"></div>
          <div v-else class="inline-block max-w-full text-lg font-semibold break-words text-gradient">
            {{ shareDialog.state.share?.name || '资源分享' }}
          </div>
        </div>

        <div class="px-5 pb-5 max-h-[50vh] overflow-y-auto thin-scrollbar" :aria-busy="shareDialog.state.loading || undefined">
          <div v-if="shareDialog.state.loading" class="flex flex-col gap-2">
            <div
              v-for="index in skeletonRows"
              :key="index"
              class="flex items-center gap-2 p-3 rounded-lg bg-surface-2"
            >
              <div class="w-4 h-4 rounded shrink-0 skeleton"></div>
              <div class="flex-1 min-w-0 h-4 rounded skeleton"></div>
            </div>
          </div>

          <div v-else-if="shareDialog.state.error" class="py-2 flex flex-col items-center gap-3 text-sm text-red-500">
            <span>{{ shareDialog.state.error }}</span>
            <button
              class="py-2 px-3 text-sm rounded-lg border-none text-ink-muted dark:text-white/60
                     bg-surface-2 hover:bg-surface-3
                     transition-colors duration-base cursor-pointer shadow-xs"
              @click="shareDialog.retry()"
            >重新加载</button>
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              v-for="(drive, index) in drives"
              :key="index"
              class="group relative flex items-center gap-2 p-3 rounded-lg
                     bg-surface-2 hover:bg-accent-soft
                     border border-transparent hover:border-accent-line transition-all duration-base"
            >
              <AppIcon name="download" class="text-sm text-ink text-accent shrink-0" />
              <a
                :href="drive.url"
                target="_blank"
                rel="noopener noreferrer nofollow"
                data-no-confirm
                class="flex-1 min-w-0 text-sm leading-5 font-medium break-words no-underline text-ink dark:text-#CCC
                       after:absolute after:inset-0 after:content-[''] dark:group-hover:text-accent transition-colors"
              >{{ drive.driveName || '网盘链接' }}</a>

              <span
                v-if="drive.accessCode"
                class="relative z-1 shrink-0 h-5 cursor-pointer [perspective:300px]"
                :title="`复制提取码`"
                @click="copyAccessCode(drive, $event)"
              >
                <span
                  class="relative flex h-full items-center gap-1 px-2 rounded-md text-xs
                         bg-surface-3 group-hover:bg-surface-4
                         border border-transparent group-hover:border-accent-line
                         group-hover:shadow-xs
                         [transform-style:preserve-3d]
                         transition-all duration-slow"
                  :class="copiedCode === drive.accessCode ? '[transform:rotateY(180deg)]' : ''"
                >
                  <span class="leading-4 whitespace-nowrap [backface-visibility:hidden]">
                    提取码:<span class="font-mono tracking-wider group-hover:text-accent-text transition-colors">{{ drive.accessCode }}</span>
                  </span>
                  <span
                    class="absolute inset-0 flex items-center justify-center rounded-md text-accent-text
                           [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  >
                    <span class="leading-4 whitespace-nowrap"><AppIcon name="check" />复制成功</span>
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useShareDialog } from '~/composables/useShareDialog'
import { useScrollLock } from '~/composables/useScrollLock'

const shareDialog = useShareDialog()

const copiedCode = ref('')
let copiedTimer = null

const skeletonRows = 2

const drives = computed(() => {
  const list = shareDialog.state.share?.drives
  return Array.isArray(list) ? list.filter(d => d?.url) : []
})

useScrollLock(computed(() => shareDialog.state.visible))

function onOverlayClick() {
  shareDialog.close()
}

function onKeydown(e) {
  if (e.key === 'Escape' && shareDialog.state.visible) {
    shareDialog.close()
  }
}

// 事件委托：响应任意页面里由 v-html 渲染出的分享按钮
function onDocumentClick(e) {
  const trigger = e.target?.closest?.('[data-share-id]')
  if (!trigger) return
  const id = trigger.getAttribute('data-share-id')
  if (!id) return
  e.preventDefault()
  e.stopPropagation()
  shareDialog.open(id)
}

async function copyAccessCode(drive, e) {
  e.preventDefault()
  e.stopPropagation()
  const code = drive.accessCode
  let ok = false
  try {
    await navigator.clipboard.writeText(code)
    ok = true
  } catch {
    try {
      const input = document.createElement('input')
      input.value = code
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      ok = document.execCommand('copy')
      document.body.removeChild(input)
    } catch {
      ok = false
    }
  }
  if (!ok) return
  copiedCode.value = code
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copiedCode.value = '' }, 2000)
}

// 离开页面 / 页面从 bfcache 恢复时关闭，防止下次进入文章时残留弹窗
function forceClose() {
  shareDialog.close()
}

function onPageHide() {
  forceClose()
}

function onPageShow(e) {
  if (e.persisted) forceClose()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('pagehide', onPageHide)
  window.addEventListener('pageshow', onPageShow)
  forceClose()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('pagehide', onPageHide)
  window.removeEventListener('pageshow', onPageShow)
  if (copiedTimer) clearTimeout(copiedTimer)
  forceClose()
})
</script>

<style scoped>
.share-dialog-enter-active .share-backdrop,
.share-dialog-leave-active .share-backdrop {
  transition: opacity 0.2s ease;
}
.share-dialog-enter-from .share-backdrop,
.share-dialog-leave-to .share-backdrop {
  opacity: 0;
}

.share-dialog-enter-active .share-card,
.share-dialog-leave-active .share-card {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.share-dialog-enter-from .share-card,
.share-dialog-leave-to .share-card {
  transform: scale(0.92) translateY(10px);
  opacity: 0;
}

.thin-scrollbar {
  scrollbar-width: thin;
}
.thin-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.thin-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.35);
  border-radius: 3px;
}

.share-card {
  contain: paint;
}
</style>