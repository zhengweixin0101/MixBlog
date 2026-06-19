import { useHead } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'

export function usePageMeta(title, description, path, extraKeywords = '') {
  const fullTitle = `${title} | ${siteConfig.title}`
  const keywords = extraKeywords ? `${siteConfig.keywords},${extraKeywords}` : siteConfig.keywords
  useHead({
    titleTemplate: fullTitle,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `${siteConfig.url}${path}` },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
    ],
  })
}
