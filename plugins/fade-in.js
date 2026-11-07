import { defineNuxtPlugin } from '#app'

const ATTR_ANIM = 'data-fade-anim'
const ATTR_AWAIT = 'data-fade-await'
const ATTR_DONE = 'data-fade-done'

// 滚入判定的提前量
const REVEAL_MARGIN = '7%'
const STAGGER = 0.14
const STAGGER_MAX = 0.7

function reducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function parseRank(el) {
  const raw = el.getAttribute('data-fade')
  if (raw == null || raw === '') return NaN
  const n = parseInt(String(raw).replace(/[^\d]/g, ''), 10)
  return n > 0 ? n : NaN
}

function orderByRank(items) {
  // 有显式序号的按序号排；同序号同批；无序号保持传入的相对顺序
  return items
    .map((el, i) => ({ el, i, rank: parseRank(el) }))
    .sort((a, b) => {
      const aN = !Number.isNaN(a.rank)
      const bN = !Number.isNaN(b.rank)
      if (aN && bN) return a.rank - b.rank || a.i - b.i
      if (aN) return a.rank - (b.i + 0.5)
      if (bN) return (a.i + 0.5) - b.rank
      return 0
    })
    .map((item) => item.el)
}

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    nuxtApp.vueApp.directive('fade-in', {})
    return
  }

  // 播完清掉 forwards 动画，避免元素成为 backdrop root
  document.addEventListener('animationend', (e) => {
    if (e.animationName === 'fade-in') e.target.setAttribute(ATTR_DONE, '')
  })

  const states = new WeakMap()
  const live = new Set()

  function stateOf(root) {
    let s = states.get(root)
    if (!s) {
      s = { root, io: null, mo: null, scanFrame: 0 }
      states.set(root, s)
      live.add(s)
    }
    return s
  }

  function reveal(el, delay = 0) {
    if (el.hasAttribute(ATTR_ANIM) || el.hasAttribute(ATTR_DONE)) return
    el.removeAttribute(ATTR_AWAIT)
    el.style.animationDelay = delay > 0 ? `${delay.toFixed(3)}s` : ''
    el.setAttribute(ATTR_ANIM, '')
  }

  function settle(el) {
    el.removeAttribute(ATTR_AWAIT)
    el.removeAttribute(ATTR_ANIM)
    el.style.animationDelay = ''
    el.setAttribute(ATTR_DONE, '')
  }

  function staggerReveal(els) {
    const ordered = orderByRank(els)
    let slot = 0
    let lastRank = null
    let lastDelay = 0
    for (const el of ordered) {
      const rank = parseRank(el)
      let delay
      if (!Number.isNaN(rank) && rank === lastRank) {
        delay = lastDelay
      } else {
        delay = Math.min(slot * STAGGER, STAGGER_MAX)
        slot++
      }
      lastRank = rank
      lastDelay = delay
      reveal(el, delay)
    }
  }

  function revealObserver(s) {
    if (s.io) return s.io
    s.io = new IntersectionObserver((entries) => {
      const hits = []
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target
        s.io.unobserve(el)
        if (el.hasAttribute(ATTR_AWAIT)) hits.push(el)
      }
      if (!hits.length) return
      // 按视觉位置从上到下排（同有显式序号时尊重序号），滚入时按顺序浮现
      hits.sort((a, b) => {
        const ra = parseRank(a)
        const rb = parseRank(b)
        if (!Number.isNaN(ra) || !Number.isNaN(rb)) {
          return (Number.isNaN(ra) ? Infinity : ra) - (Number.isNaN(rb) ? Infinity : rb)
        }
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top
      })
      staggerReveal(hits)
    }, { rootMargin: `0px 0px ${REVEAL_MARGIN} 0px` })
    return s.io
  }

  function pass(root, s) {
    if (reducedMotion()) {
      for (const el of root.querySelectorAll('[data-fade]')) settle(el)
      return
    }
    const vh = window.innerHeight || 0
    const io = revealObserver(s)
    const ready = []
    for (const el of root.querySelectorAll('[data-fade]')) {
      const awaiting = el.hasAttribute(ATTR_AWAIT)
      if (!awaiting && (el.hasAttribute(ATTR_ANIM) || el.hasAttribute(ATTR_DONE))) continue
      const rect = el.getBoundingClientRect()
      if (rect.bottom <= 0 || rect.top < vh) {
        // 已在视口内或视口上方：直接播（含一次性跳过的等待元素）
        if (awaiting) io.unobserve(el)
        ready.push(el)
      } else if (!awaiting) {
        el.setAttribute(ATTR_AWAIT, '')
        io.observe(el)
      }
    }
    if (ready.length) staggerReveal(ready)
  }

  function scheduleScan(root, s) {
    if (s.scanFrame) return
    s.scanFrame = requestAnimationFrame(() => {
      s.scanFrame = 0
      pass(root, s)
    })
  }

  function watchMutations(root, s) {
    if (s.mo || typeof MutationObserver === 'undefined') return
    s.mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue
          if (node.hasAttribute?.('data-fade') || node.querySelector?.('[data-fade]')) {
            scheduleScan(root, s)
            return
          }
        }
      }
    })
    s.mo.observe(root, { childList: true, subtree: true })
  }

  // rAF 合并的滚动兜底：一次性跳转时把翻过去的等待元素直接播出
  let scrollFrame = 0
  window.addEventListener('scroll', () => {
    if (scrollFrame) return
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0
      for (const s of live) {
        if (!s.root.isConnected) continue
        pass(s.root, s)
      }
    })
  }, { passive: true })

  function mounted(root) {
    const s = stateOf(root)
    watchMutations(root, s)
    // 等一帧让首屏 DOM/布局落定
    requestAnimationFrame(() => pass(root, s))
  }

  function updated(root) {
    const s = states.get(root)
    if (s) scheduleScan(root, s)
  }

  function unmounted(root) {
    const s = states.get(root)
    if (!s) return
    s.io?.disconnect()
    s.mo?.disconnect()
    if (s.scanFrame) cancelAnimationFrame(s.scanFrame)
    live.delete(s)
    states.delete(root)
  }

  nuxtApp.vueApp.directive('fade-in', { mounted, updated, unmounted })
})
