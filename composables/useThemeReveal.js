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
  return typeof document.startViewTransition === 'function'
    && !prefersReducedMotion()
}

/** 触发源：优先取点击点的 clientX/clientY
 *  键盘（detail===0）/非坐标源退回元素的视口中心
 *  拿不到元素时用右上角兜底 */
function resolveOrigin(trigger) {
  if (
    trigger
    && typeof trigger.clientX === 'number'
    && typeof trigger.clientY === 'number'
    && !(trigger.clientX === 0 && trigger.clientY === 0 && trigger.detail === 0)
  ) {
    return { x: trigger.clientX, y: trigger.clientY }
  }
  const el = trigger?.nodeType === 1 ? trigger : trigger?.currentTarget
  const rect = el?.getBoundingClientRect?.()
  if (!rect || !rect.width || !rect.height) {
    return { x: window.innerWidth - 40, y: 40 }
  }
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function resolveRadiusPercent(x, y, vw, vh) {
  const corner = Math.hypot(
    Math.max(x, vw - x),
    Math.max(y, vh - y),
  )
  const base = Math.hypot(vw, vh) / Math.SQRT2
  return Math.ceil((corner / base) * 100 * 1.15)
}

/** 圆心换算成盒子尺寸的百分比，避免绝对像素在快照坐标系错位 */
function resolveOriginPercent(x, y, vw, vh) {
  return {
    xPct: (x / vw) * 100,
    yPct: (y / vh) * 100,
  }
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
   * @param {Element|MouseEvent} [options.origin] 圆形扩散起点，传点击事件取点击点，传元素取其中心
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
    const vw = Math.max(window.innerWidth, document.documentElement.clientWidth || 0)
    const vh = Math.max(window.innerHeight, document.documentElement.clientHeight || 0)
    const { x, y } = resolveOrigin(origin)
    const { xPct, yPct } = resolveOriginPercent(x, y, vw, vh)
    const mode = expanding ? CLS_FORTH : CLS_BACK
    expanding = !expanding

    root.style.setProperty('--reveal-x', `${xPct}%`)
    root.style.setProperty('--reveal-y', `${yPct}%`)
    root.style.setProperty('--reveal-r', `${resolveRadiusPercent(x, y, vw, vh)}%`)
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
