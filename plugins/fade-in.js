import { defineNuxtPlugin } from '#app'

// 浮现节奏（秒）
// 首屏首个元素的起步延迟、相邻元素之间的间隔
const BASE_DELAY = 0.15
const STAGGER = 0.07
// 视口外元素滚入视口时同一批的间隔与上限
const REVEAL_STAGGER = 0.06
const REVEAL_MAX = 0.24
// 滚入判定的提前量：元素还没进视口就开播，屏幕底部不会留一条空白带
const REVEAL_MARGIN = '7%'
// 首屏期间接管时的级联上限
const TAKEOVER_MAX = 0.36
// 接管/补播时等待时长
const TAKEOVER_WAIT_MAX = 0.6
// 接管时加速收尾倍率
const TAKEOVER_SPEED = 3
// 真实滚动判断阈值
const TAKEOVER_THRESHOLD = 60
// 与 --dur-fade 一致，只用于 settled 计时
const FADE_DURATION = 0.28

// 状态一律挂在属性上，不用 class。
// Vue 的 :class 绑定（PostCard/TalkCard 的 `settled && 'fade-settled'`）在值变化时
// 会整个重写 el.className，把 JS 加上的 class 一起抹掉；属性不会被 Vue 覆盖。
// 已排进队列
const ATTR_ANIM = 'data-fade-anim'
// 在首屏之外，等滚进视口再播
const ATTR_AWAIT = 'data-fade-await'
// 播完落定成静态样式清掉 forwards 动画，避免成为 backdrop root
const ATTR_DONE = 'data-fade-done'

function parseIndex(raw) {
  if (raw == null) return NaN
  const cleaned = String(raw).normalize('NFKC').replace(/[^\d]/g, '')
  if (!cleaned) return NaN
  const n = parseInt(cleaned, 10)
  return n > 0 ? n : NaN
}

function keyOf(el) {
  return el.getAttribute('data-post-id') || el.getAttribute('data-fade-key') || null
}

function resetAnimationClock(el) {
  if (typeof el.getAnimations !== 'function') return
  for (const a of el.getAnimations()) {
    if (a.animationName === 'fade-in') a.currentTime = 0
  }
}

//
// 按 data-fade 的序号排进度；没写数字的按 DOM 顺序插队。
// 没写数字的用 `i + 0.5` 而不是 `i + 1`：后者会和显式写下的数字撞车
function orderByRank(items) {
  return items
    .map((el, i) => ({ el, i, rank: parseIndex(el.getAttribute('data-fade')) }))
    .sort((a, b) => {
      const ra = Number.isNaN(a.rank) ? a.i + 0.5 : a.rank
      const rb = Number.isNaN(b.rank) ? b.i + 0.5 : b.rank
      return ra - rb || a.i - b.i
    })
    .map((item) => item.el)
}

function reducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function currentPath() {
  return window.location.pathname + window.location.search
}

function toTop() {
  window.scrollTo(0, 0)
}

// 等布局落定再判首屏
function whenStable(fn, maxFrames = 14) {
  let lastH = -1
  let stable = 0
  let frames = 0
  const tick = () => {
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    if (h > 0 && h === lastH) stable++
    else {
      lastH = h
      stable = 0
    }
    frames++
    if (stable >= 2 || frames >= maxFrames) fn()
    else requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
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
  const liveStates = new Set()
  let booted = false
  let lastPath = ''
  let userScrolled = false

  function stateOf(root) {
    let s = states.get(root)
    if (!s) {
      s = {
        root,
        ready: false,        // 首轮判定是否已完成（避免分列前的布局被当成首屏）
        measuring: false,    // 正在等布局落定，期间的 updated 不许抢跑
        settled: false,      // 首屏入场是否已结束，结束后新节点不再排队
        tookOver: false,     // 用户已经滚动过，本页不再按原队列走
        slots: 0,            // 已占用的延迟槽位
        maxDelay: 0,         // 本页最大的延迟，用于 settled 计时
        entryY: 0,           // 判定首屏时的滚动位置，用来量滚了多远
        tailAt: 0,           // 已排队元素最晚的预计收尾时刻，新元素接在它后面，保证顺序
        memo: new Map(),     // 稳定 id -> { delay, phase }，节点被重建时复原判定
        startAt: new WeakMap(), // 元素 -> 预计开播时间戳，用来判断还没开始播
        io: null,
        mo: null,
        scanFrame: 0,
        routePending: false, // 路由变了但新页面的 DOM 还没进来
        routeTimer: 0,
        doneTimer: 0
      }
      states.set(root, s)
      liveStates.add(s)
    }
    return s
  }

  function memoOf(s, el) {
    const key = keyOf(el)
    return key ? s.memo.get(key) : null
  }

  function markDone(s, el) {
    const key = keyOf(el)
    if (key) s.memo.set(key, { delay: 0, phase: 'done' })
    el.setAttribute(ATTR_DONE, '')
  }

  // 视口外的元素共用一个观察器，滚进来才播
  function revealObserver(s) {
    if (s.io) return s.io
    s.io = new IntersectionObserver((entries) => {
      const hits = new Set()
      for (const entry of entries) {
        if (entry.isIntersecting) hits.add(entry.target)
      }
      if (!hits.size) return

      // 一次性跳转会让中间元素既不触发也不可见，
      // 顺手把已经翻过去的元素一起落定
      for (const el of s.root.querySelectorAll(`[${ATTR_AWAIT}]`)) {
        if (el.getBoundingClientRect().top < window.innerHeight) hits.add(el)
      }

      // 按视觉位置从上到下排
      const ordered = [...hits].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)

      let i = 0
      for (const el of ordered) {
        if (!el.hasAttribute(ATTR_AWAIT)) continue
        s.io.unobserve(el)
        el.removeAttribute(ATTR_AWAIT)
        let delay
        const now = performance.now()
        if (!s.settled && s.tookOver) {
          // takeover 已接管，新滚入元素接在当前视口内动画尾部；
          // 视口内无播放中的元素时不等待离屏尾巴，避免快速下滑出现短暂空白
          let base = Math.min(Math.max(0, s.tailAt - now) / 1000, TAKEOVER_WAIT_MAX)
          if (base > 0.05) {
            const vh = window.innerHeight || 0
            let hasOnScreenBlocking = false
            for (const p of s.root.querySelectorAll(`[${ATTR_ANIM}]:not([${ATTR_DONE}])`)) {
              const at = s.startAt.get(p)
              if (at === undefined) continue
              const dur = (parseFloat(p.style.animationDuration) || FADE_DURATION) * 1000
              if (at + dur <= now) continue
              const r = p.getBoundingClientRect()
              if (r.bottom > 0 && r.top < vh) { hasOnScreenBlocking = true; break }
            }
            if (!hasOnScreenBlocking) base = 0
          }
          delay = base + Math.min(i * STAGGER, TAKEOVER_MAX)
          // 首屏动画期间保持与首屏一致的浮现效果
          el.style.animationDuration = ''
        } else if (!s.settled) {
          // 首屏入场还没被 takeover 接管：继续按原队列往下排，保持与首屏动画一致
          delay = BASE_DELAY + s.slots * STAGGER
          s.slots++
          if (delay > s.maxDelay) s.maxDelay = delay
        } else {
          delay = Math.min(i * REVEAL_STAGGER, REVEAL_MAX)
        }
        el.style.animationDelay = `${delay.toFixed(3)}s`
        el.setAttribute(ATTR_ANIM, '')
        // 延迟从现在起算，CSS 动画的 delay 是从首次拿到 animation 那刻算的
        resetAnimationClock(el)
        s.startAt.set(el, now + delay * 1000)
        if (!s.settled) {
          // 记下这批的预计收尾时刻，后面接管的元素要排在它之后
          const dur = parseFloat(el.style.animationDuration) || FADE_DURATION
          s.tailAt = Math.max(s.tailAt, now + delay * 1000 + dur * 1000)
        }
        const key = keyOf(el)
        if (key) s.memo.set(key, { delay: 0, phase: 'anim' })
        i++
      }
    }, { rootMargin: `0px 0px ${REVEAL_MARGIN} 0px` })
    return s.io
  }

  function awaitReveal(s, el) {
    const key = keyOf(el)
    if (key) s.memo.set(key, { delay: 0, phase: 'await' })
    el.setAttribute(ATTR_AWAIT, '')
    revealObserver(s).observe(el)
  }

// [data-fade-children]：容器先整体藏着
// 挂载后拆成每个块各自浮现。长文正文用这个，不然 5000px 的内容是一大坨一起出现
  function expandGroups(root) {
    for (const group of root.querySelectorAll('[data-fade-children]')) {
      // 容器自己正在播/在等的时候不动它，否则会把它的判定冲掉
      if (group.hasAttribute(ATTR_ANIM) || group.hasAttribute(ATTR_AWAIT)) continue
      let added = false
      for (const child of group.children) {
        if (child.hasAttribute('data-fade')) continue
        child.setAttribute('data-fade', '')
        added = true
      }
      // 同一轮里先让子块变隐藏态、再把容器放开，中间不会闪出内容。
      // 容器已落定但正文被换掉时，新子块也要补标记
      if (added || !group.hasAttribute(ATTR_DONE)) group.setAttribute(ATTR_DONE, '')
    }
  }

  // 新节点不一定会触发 updated，用 MutationObserver 兜住
  function watchMutations(s) {
    if (s.mo || typeof MutationObserver === 'undefined') return
    s.mo = new MutationObserver((records) => {
      let hit = false
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue
          if (node.hasAttribute('data-fade') || node.hasAttribute('data-fade-children') || node.querySelector?.('[data-fade],[data-fade-children]')) {
            hit = true
            break
          }
        }
        if (hit) break
      }
      if (!hit) return
      if (s.routePending) {
        s.routePending = false
        if (s.routeTimer) {
          clearTimeout(s.routeTimer)
          s.routeTimer = 0
        }
        enter(s.root, s, false)
        return
      }
      if (s.scanFrame) return
      s.scanFrame = requestAnimationFrame(() => {
        s.scanFrame = 0
        if (s.ready && !s.measuring) pass(s.root, s)
      })
    })
    s.mo.observe(s.root, { childList: true, subtree: true })
  }

  function pass(root, s) {
    expandGroups(root)
    const fresh = []
    for (const el of root.querySelectorAll('[data-fade]')) {
      if (el.hasAttribute(ATTR_ANIM) || el.hasAttribute(ATTR_AWAIT) || el.hasAttribute(ATTR_DONE)) continue
      fresh.push(el)
    }
    if (!fresh.length) return

    const vh = window.innerHeight || 0

    // 首屏入场已结束，新出现的元素不再排队
    if (s.settled) {
      for (const el of fresh) {
        const memo = memoOf(s, el)
        if (memo?.phase === 'await') awaitReveal(s, el)
        else if (memo) markDone(s, el)
        else if (el.getBoundingClientRect().top < vh) markDone(s, el)
        else awaitReveal(s, el)
      }
      return
    }

    const inView = []
    const below = []
    const above = []
    for (const el of fresh) {
      const rect = el.getBoundingClientRect()
      // 已经在视口上方直接落定，别在看不见的地方空跑动画
      if (rect.bottom <= 0) above.push(el)
      else if (rect.top < vh) inView.push(el)
      else below.push(el)
    }
    for (const el of above) markDone(s, el)

    let slot = s.slots
    let lastRank = null
    let lastDelay = 0
    let roundMax = 0
    for (const el of orderByRank(inView)) {
      const key = keyOf(el)
      const rank = parseIndex(el.getAttribute('data-fade'))
      let delay = memoOf(s, el)?.delay
      if (delay === undefined) {
        // 同一个数字视为同一步，几个元素一起出场
        if (!Number.isNaN(rank) && rank === lastRank) {
          delay = lastDelay
        } else {
          delay = BASE_DELAY + slot * STAGGER
          slot++
        }
      }
      lastRank = rank
      lastDelay = delay
      if (key) s.memo.set(key, { delay, phase: 'anim' })
      el.style.animationDelay = `${delay.toFixed(3)}s`
      el.style.animationDuration = ''
      el.setAttribute(ATTR_ANIM, '')
      s.startAt.set(el, performance.now() + delay * 1000)
      if (delay > s.maxDelay) s.maxDelay = delay
      if (delay > roundMax) roundMax = delay
    }
    s.slots = slot
    // 本轮队列的预计收尾时刻，后面接管/补播的元素要排在它之后
    if (roundMax > 0) {
      s.tailAt = Math.max(s.tailAt, performance.now() + (roundMax + FADE_DURATION) * 1000)
    }

    for (const el of below) awaitReveal(s, el)
  }

  function takeover(s) {
    if (!s.ready || s.settled || s.tookOver || !s.root.isConnected) return
    if (Math.abs(window.scrollY - s.entryY) < TAKEOVER_THRESHOLD) return
    const now = performance.now()
    const vh = window.innerHeight || 0
    const pending = []
    let playingEnd = now
    for (const el of s.root.querySelectorAll('[data-fade]')) {
      if (el.hasAttribute(ATTR_DONE)) continue
      const at = s.startAt.get(el)
      if (at !== undefined) {
        const dur = (parseFloat(el.style.animationDuration) || FADE_DURATION) * 1000
        const endAt = at + dur
        if (endAt <= now) continue
        const rect = el.getBoundingClientRect()
        const onScreen = rect.bottom > 0 && rect.top < vh
        if (at <= now + 16) {
          let remain = endAt - now
          if (remain > 0 && typeof el.getAnimations === 'function') {
            let sped = false
            for (const a of el.getAnimations()) {
              if (a.animationName === 'fade-in') { a.playbackRate = TAKEOVER_SPEED; sped = true }
            }
            if (sped) remain = remain / TAKEOVER_SPEED
          }
          if (onScreen && now + remain > playingEnd) playingEnd = now + remain
        } else {
          pending.push(el)
        }
        continue
      }
      if (el.hasAttribute(ATTR_AWAIT) && el.getBoundingClientRect().top < vh) pending.push(el)
    }
    if (!pending.length) return

    s.tookOver = true
    pending.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
    const base = Math.min(Math.max(0, playingEnd - now) / 1000, TAKEOVER_WAIT_MAX)
    let end = now
    let maxDelay = 0
    pending.forEach((el, i) => {
      const delay = base + Math.min(i * STAGGER, TAKEOVER_MAX)
      if (delay > maxDelay) maxDelay = delay
      s.io?.unobserve(el)
      el.removeAttribute(ATTR_AWAIT)
      el.style.animationDelay = `${delay.toFixed(3)}s`
      el.style.animationDuration = ''
      el.setAttribute(ATTR_ANIM, '')
      resetAnimationClock(el)
      s.startAt.set(el, now + delay * 1000)
      end = Math.max(end, now + delay * 1000 + FADE_DURATION * 1000)
    })
    s.tailAt = Math.max(s.tailAt, end)
    if (maxDelay > s.maxDelay) s.maxDelay = maxDelay
  }

  function enter(root, s, first) {
    s.ready = false
    s.measuring = true
    s.settled = false
    s.tookOver = false
    s.routePending = false
    s.slots = 0
    s.maxDelay = 0
    s.tailAt = 0
    if (s.routeTimer) {
      clearTimeout(s.routeTimer)
      s.routeTimer = 0
    }
    if (s.doneTimer) {
      clearTimeout(s.doneTimer)
      s.doneTimer = 0
    }

    const hasHash = !!window.location.hash
    const restored = !first && !!window.history.state?.scroll
    const shouldTop = !hasHash && !restored
    const startY = window.scrollY

    if (first && !userScrolled) {
      // 浏览器可能在水合之后才恢复滚动位置，加载完再钉一次
      window.addEventListener('load', () => { if (!userScrolled) toTop() }, { once: true })
    }

    whenStable(() => {
      s.measuring = false
      if (!root.isConnected) return
      const userMoved = Math.abs(window.scrollY - startY) >= TAKEOVER_THRESHOLD
      if (shouldTop && window.scrollY > 0 && !userMoved) toTop()
      s.ready = true
      s.entryY = userMoved ? startY : window.scrollY

      pass(root, s)
      if (userMoved) takeover(s)
      s.doneTimer = setTimeout(() => { s.settled = true }, (s.maxDelay + FADE_DURATION) * 1000 + 200)
    })
  }

  // 滚动监听只挂一次，rAF 合并，滚动再快也只在每帧算一次
  let scrollFrame = 0
  window.addEventListener('scroll', () => {
    if (scrollFrame) return
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0
      for (const s of liveStates) takeover(s)
    })
  }, { passive: true })
  window.addEventListener('wheel', () => { userScrolled = true }, { passive: true })
  window.addEventListener('touchmove', () => { userScrolled = true }, { passive: true })

  function mounted(root) {
    const s = stateOf(root)
    if (s.ready || s.measuring) return
    watchMutations(s)
    const first = !booted
    booted = true
    lastPath = currentPath()
    if (reducedMotion()) {
      s.ready = true
      s.settled = true
      return
    }
    enter(root, s, first)
  }

  function updated(root) {
    const s = states.get(root)
    if (!s) return
    if (reducedMotion()) return

    const path = currentPath()
    if (path !== lastPath) {
      lastPath = path
      s.routePending = true
      if (s.routeTimer) clearTimeout(s.routeTimer)
      s.routeTimer = setTimeout(() => {
        s.routeTimer = 0
        s.routePending = false
      }, 2000)
      return
    }

    if (s.ready && !s.measuring) pass(root, s)
  }

  function unmounted(root) {
    const s = states.get(root)
    if (!s) return
    s.io?.disconnect()
    s.mo?.disconnect()
    if (s.scanFrame) cancelAnimationFrame(s.scanFrame)
    if (s.routeTimer) clearTimeout(s.routeTimer)
    if (s.doneTimer) clearTimeout(s.doneTimer)
    states.delete(root)
    liveStates.delete(s)
  }

  nuxtApp.vueApp.directive('fade-in', { mounted, updated, unmounted })
})
