import { defineNuxtPlugin } from '#app'

// 全局图片加载动画的统一开关
// 在 document 上用捕获阶段监听 load/error，命中后统一打上 onload-fade
// 缓存命中的图在 hydration 前就 load 完，若提前改 DOM 会造成 hydration
export default defineNuxtPlugin((nuxtApp) => {
  const mark = (img) => {
    if (!img.classList.contains('onload-fade')) img.classList.add('onload-fade')
  }
  const onEvent = (e) => {
    const t = e.target
    if (t && t.tagName === 'IMG') mark(t)
  }
  nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
    document.addEventListener('load', onEvent, true)
    document.addEventListener('error', onEvent, true)
    // eslint-disable-next-line no-restricted-syntax
    for (const img of document.images) {
      if (img.complete) mark(img)
    }
  })
})
