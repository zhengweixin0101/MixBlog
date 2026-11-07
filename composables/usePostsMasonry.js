import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

/**
 * 双列瀑布流布局引擎
 *
 * 核心规则：
 *   1. 按原序依次遍历，不重排数据；
 *   2. 第 1 篇进左列；此后每篇放进当前累计高度较小的一列，两列同高优先左列；
 *   3. 卡片高度来自真实渲染后的实测（offsetHeight），不用固定值估算，
 *      列累计高度 = Σ卡片高 + 行间距。
 *
 * 测量与分配全部在浏览器端进行，SSR 用左列/右列交替这一确定性兜底分发
 */
export function usePostsMasonry(posts, { minWidth = 768, fallbackGap = 18, getId = (item) => item.slug } = {}) {
  const listEl = ref(null)      // 桌面端双列容器
  const twoCols = ref(false)    // 是否启用双列（≥ min-width；移动端单列，不跑分配算法）
  const assignment = ref([])    // 每篇文章落在 0=左列 / 1=右列
  const columnWidth = ref(0)    // 最近一次实测列宽，高度缓存按宽度失效

  /** 高度缓存：getId(item) -> { w, h }。实例级，缓存随 composable 生命周期；服务端不写入 */
  const heightCache = new Map()

  let mq = null
  let ro = null
  let lastListWidth = -1
  let rowGapValue = fallbackGap
  let pendingFrame = 0
  let measureSeq = 0
  let disposed = false

  /** 双列模式下的视觉分列结果 */
  const columns = computed(() => {
    if (!twoCols.value) return [posts.value]
    const cols = [[], []]
    const assign = assignment.value || []
    posts.value.forEach((post, i) => {
      const ci = assign[i] ?? (i & 1)
      cols[ci === 1 ? 1 : 0].push(post)
    })
    return cols
  })

  /** 每次放入当前较短的一列，同高优先左列；列高含卡片之间的行间距 */
  function greedyAssign(heights, gap) {
    const totals = [0, 0]
    const counts = [0, 0]
    const out = []
    for (const h of heights) {
      const target = totals[0] <= totals[1] ? 0 : 1
      out.push(target)
      counts[target]++
      totals[target] += h + (counts[target] > 1 ? gap : 0)
    }
    return out
  }

  /** 依据已有的实测缓存重算分列 */
  function applyAssignment() {
    if (import.meta.server || disposed) return
    const list = posts.value
    if (!twoCols.value) {
      assignment.value = []
      return
    }
    const w = columnWidth.value
    const known = list.map((post) => {
      // data-post-id 读回来必是字符串，键统一转 String，避免 id 为数字时 get 永远 miss
      const entry = heightCache.get(String(getId(post)))
      return entry && entry.w === w && entry.h > 0 ? entry.h : 0
    })
    if (w <= 0 || known.every((h) => !h)) {
      assignment.value = list.map((_, i) => i & 1)
      scheduleMeasure()
      return
    }
    const hasUnknown = known.some((h) => !h)
    if (hasUnknown) {
      const sum = known.reduce((a, b) => a + b, 0)
      const mean = sum / known.filter(Boolean).length
      const heights = known.map((h) => h || mean)
      assignment.value = greedyAssign(heights, rowGapValue)
      scheduleMeasure()
      return
    }
    assignment.value = greedyAssign(known, rowGapValue)
  }

  /**
   * 逐张实测当前渲染出的卡片
   * 只有当某张卡片的实测值确实变化时才标记 dirty，dirty 才会重算分列
   */
  async function measure() {
    if (import.meta.server || disposed || !twoCols.value) return
    const seq = ++measureSeq
    await nextTick()
    if (seq !== measureSeq || disposed || !twoCols.value) return
    const root = listEl.value
    if (!root) return
    const nodes = root.querySelectorAll('[data-post-id]')
    if (!nodes.length) return
    const w = nodes[0].offsetWidth
    if (!w) return
    const gap = parseFloat(getComputedStyle(nodes[0].parentElement).rowGap)
    if (!Number.isNaN(gap) && gap > 0) rowGapValue = gap

    let dirty = false
    for (const node of nodes) {
      const id = String(node.getAttribute('data-post-id'))
      const h = node.offsetHeight
      const prev = heightCache.get(id)
      if (!prev || prev.w !== w || prev.h !== h) {
        heightCache.set(id, { w, h })
        dirty = true
      }
    }
    columnWidth.value = w
    if (dirty) applyAssignment()
  }

  /** rAF 合并触发，避免重复测量 */
  function scheduleMeasure() {
    if (import.meta.server || disposed || pendingFrame) return
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0
      measure()
    })
  }

  function onResize(entries) {
    for (const entry of entries) {
      if (entry.target === listEl.value) {
        // 只有宽度真正变化才重测（高度变化是归位补丁自身造成的，忽略）
        const w = entry.contentRect.width
        if (Math.abs(w - lastListWidth) > 0.5) {
          lastListWidth = w
          scheduleMeasure()
        }
      } else {
        scheduleMeasure()
      }
    }
  }

  /** 观察双列容器与其两列 */
  function observeTargets() {
    if (typeof ResizeObserver === 'undefined') return
    if (!ro) ro = new ResizeObserver(onResize)
    ro.disconnect()
    if (!listEl.value) return
    ro.observe(listEl.value)
    for (const el of Array.from(listEl.value.children)) ro.observe(el)
  }

  function handleMediaChange(event) {
    twoCols.value = event.matches
  }

  watch(posts, () => {
    // flush: pre（默认）—— 分列结果与筛选结果在同一轮渲染里落地，
    // 搜索/标签/分页等任何数据变化都走这里重排；
    // 说说「加载更多」是 push 追加，需要 deep 才能观察到
    applyAssignment()
  }, { deep: true })

  watch(twoCols, async (on) => {
    await nextTick()
    if (disposed) return
    if (on) {
      lastListWidth = -1
      observeTargets()
      applyAssignment()
    } else if (ro) {
      ro.disconnect()
      assignment.value = []
    }
  })

  onMounted(() => {
    if (typeof window === 'undefined') return
    mq = window.matchMedia(`(min-width: ${minWidth}px)`)
    twoCols.value = mq.matches
    try {
      mq.addEventListener('change', handleMediaChange)
    } catch {
      mq.addListener?.(handleMediaChange)
    }
    document.fonts?.ready?.then(() => {
      if (!disposed) scheduleMeasure()
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    if (pendingFrame) {
      cancelAnimationFrame(pendingFrame)
      pendingFrame = 0
    }
    ro?.disconnect()
    if (mq) {
      try {
        mq.removeEventListener('change', handleMediaChange)
      } catch {
        mq.removeListener?.(handleMediaChange)
      }
    }
  })

  return { listEl, columns, twoCols }
}
