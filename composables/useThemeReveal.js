/**
 * 主题切换的圆形过渡
 *
 * - 扩散：新主题从触发点圆形扩散铺满全屏
 * - 收回：下一次切换原路收回，圆形缩回触发点，露出新主题
 */
import { nextTick, useColorMode } from '#imports'

const CLS_FORTH = 'theme-reveal-forth'
const CLS_BACK = 'theme-reveal-back'
const CLS_SWAP = 'theme-swap'

let expanding = true
let animating = false

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function supportsReveal() {
  return typeof document.startViewTransition === 'function' && !prefersReducedMotion()
}

function resolveOrigin(trigger) {
  const rect = trigger?.getBoundingClientRect?.()
  if (!rect || !rect.width || !rect.height) {
    return { x: window.innerWidth - 40, y: 40 }
  }
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function resolveRadius(x, y) {
  const corner = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )
  return Math.ceil(corner * 1.12)
}

export function useThemeReveal() {
  const colorMode = useColorMode()

  /** 换主题本身；不动画时也走这里，保证行为一致 */
  async function applyTheme(next, onSwap) {
    colorMode.preference = next
    onSwap?.()
    await nextTick()
  }

  /**
   * @param {'light'|'dark'} next 目标主题
   * @param {object} [options]
   * @param {Element} [options.origin] 圆形扩散的起点元素
   * @param {Function} [options.onSwap] 与主题同时发生的收尾
   */
  async function revealTheme(next, options = {}) {
    const { origin, onSwap } = options

    if (!supportsReveal() || animating) {
      await applyTheme(next, onSwap)
      return
    }

    animating = true
    const root = document.documentElement
    const { x, y } = resolveOrigin(origin)
    const mode = expanding ? CLS_FORTH : CLS_BACK
    expanding = !expanding

    root.style.setProperty('--reveal-x', `${x}px`)
    root.style.setProperty('--reveal-y', `${y}px`)
    root.style.setProperty('--reveal-r', `${resolveRadius(x, y)}px`)
    root.classList.add(CLS_SWAP, mode)

    let transition
    try {
      transition = document.startViewTransition(() => applyTheme(next, onSwap))
    } catch {
      root.classList.remove(CLS_SWAP, mode)
      animating = false
      await applyTheme(next, onSwap)
      return
    }

    try {
      // 新快照已生成，可以恢复各元素自己的颜色过渡
      await transition.ready
    } catch {
      // 被下一次切换打断，快照不会生成
    }
    root.classList.remove(CLS_SWAP)

    try {
      await transition.finished
    } catch {
      // 同上
    }
    root.classList.remove(CLS_FORTH, CLS_BACK)
    ;['--reveal-x', '--reveal-y', '--reveal-r'].forEach(v => root.style.removeProperty(v))
    animating = false
  }

  /** 在明暗之间切换，返回切换后的主题 */
  async function toggleTheme(options) {
    const next = colorMode.value === 'dark' ? 'light' : 'dark'
    await revealTheme(next, options)
    return next
  }

  return { revealTheme, toggleTheme }
}
