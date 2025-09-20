import { $fetch } from 'ofetch'
import { siteConfig } from '@/siteConfig/main.js'

export default defineEventHandler(async (event) => {
    if (event.req.url !== '/rss.xml') return

    const baseUrl = siteConfig.url
    const feedUrl = `${baseUrl}/rss.xml`

    const articles = await $fetch(siteConfig.postsData.postsList)

    const items = articles
        .filter((a) => a.published)
        .map((a) => `
      <item>
        <title><![CDATA[${a.title}]]></title>
        <link>${baseUrl}/article/${a.slug}</link>
        <guid isPermaLink="true">${baseUrl}/article/${a.slug}</guid>
        <pubDate>${new Date(a.date).toUTCString()}</pubDate>
        <description><![CDATA[${a.description}]]></description>
        ${a.tags?.length
                ? a.tags.map((tag) => `<category><![CDATA[${tag}]]></category>`).join('')
                : ''
            }
      </item>
    `)
        .join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteConfig.title} RSS]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${siteConfig.title} 最新文章订阅]]></description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

    event.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    return rss
})