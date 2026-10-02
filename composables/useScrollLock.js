import { watch, onBeforeUnmount } from 'vue'

let lockCount = 0
let prevOverflow = null

function lock() {
  if (typeof document === 'undefined') return
  if (lockCount++ > 0) return
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlock() {
  if (typeof document === 'undefined') return
  if (lockCount === 0) return
  if (--lockCount > 0) return
  document.body.style.overflow = prevOverflow ?? ''
  prevOverflow = null
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
