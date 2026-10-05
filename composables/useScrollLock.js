import { watch, onBeforeUnmount } from 'vue'

let lockCount = 0
let prevOverflow = null
let prevScrollbarWidth = null

function lock() {
  if (typeof document === 'undefined') return
  if (lockCount++ > 0) return
  const html = document.documentElement
  prevOverflow = html.style.overflow
  prevScrollbarWidth = html.style.scrollbarWidth
  html.style.overflow = 'hidden'
  html.style.scrollbarWidth = 'none'
}

function unlock() {
  if (typeof document === 'undefined') return
  if (lockCount === 0) return
  if (--lockCount > 0) return
  const html = document.documentElement
  html.style.overflow = prevOverflow ?? ''
  html.style.scrollbarWidth = prevScrollbarWidth ?? ''
  prevOverflow = null
  prevScrollbarWidth = null
}

/**
 * 弹窗打开时锁定 body 滚动，关闭后还原
 * 用法：useScrollLock(computed(() => dialog.state.visible))
 */
export function useScrollLock(visible) {
  let held = false

  watch(visible, (value) => {
    if (value && !held) {
      lock()
      held = true
    } else if (!value && held) {
      unlock()
      held = false
    }
  }, { immediate: true, flush: 'sync' })

  onBeforeUnmount(() => {
    if (!held) return
    unlock()
    held = false
  })
}
