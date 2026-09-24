import { useDialog } from '~/composables/useDialog'
import { siteConfig } from '~/siteConfig/main'

function isWhitelisted(host, whitelist = []) {
    return whitelist.some(rule => {
        if (!rule) return false
        if (rule.startsWith('*.')) {
            const base = rule.slice(2)
            return host === base || host.endsWith('.' + base)
        }
        return host === rule
    })
}

export default defineNuxtPlugin(() => {
    const { enabled, whitelist } = siteConfig.externalLinkConfirm

    if (enabled === false) return

    const dialog = useDialog()

    document.addEventListener('click', async (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return

        const link = e.target.closest?.('a[href]')
        if (!link) return

        const href = link.getAttribute('href')
        if (!href) return

        let url
        try {
            url = new URL(href, location.href)
        } catch {
            return
        }

        if (!/^https?:$/.test(url.protocol) || url.host === location.host) return
        if (isWhitelisted(url.host, whitelist)) return

    e.preventDefault()

    const displayUrl = url.href
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    const openLink = () => {
      if (link.target === '_blank') {
        window.open(url.href, '_blank', 'noopener,noreferrer')
      } else {
        location.href = url.href
      }
    }

    dialog.show({
      title: '即将前往',
      html: true,
      content: `<span class="block my-2.5 mx-auto max-w-full rounded-lg bg-black/5 dark:bg-white/10 px-3 py-2 font-mono text-sm break-all text-#2f3f5b dark:text-#CCC">${displayUrl}</span>`,
      buttons: [
        { text: '取消', type: 'default' },
        { text: '继续', type: 'primary', onClick: openLink }
      ]
    })
  })
})
