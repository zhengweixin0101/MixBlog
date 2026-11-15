import { useState } from '#imports'

/**
 * 顶栏显隐状态（全局共享）
 *
 * 顶栏的滚动显隐逻辑在 Header.vue 里维护，这里把状态共享出去，
 * 供页面内的吸顶元素（如文章目录）跟着顶栏同步上下位移
 */
export function useHeaderVisibility() {
  const hidden = useState('header-hidden', () => false)

  return { hidden }
}
