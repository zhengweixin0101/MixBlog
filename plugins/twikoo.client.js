import { siteConfig } from '~/siteConfig/main'

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  return new Promise((resolve) => {
    // 检查是否已加载
    if (window.twikoo) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = siteConfig.thirdParty.twikoo.script
    script.async = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      console.error('Twikoo 加载失败')
      resolve()
    }

    document.body.appendChild(script)
  })
})