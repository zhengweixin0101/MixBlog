import { $fetch } from 'ofetch'
import { siteConfig } from '@/siteConfig/main.js'

export default defineEventHandler(async (event) => {
    if (event.req.url !== '/sitemap.xml') return

    const baseUrl = siteConfig.url

    // 从 siteConfig 获取页面配置
    const pages = siteConfig.navItems.map(item => ({
        loc: `${baseUrl}${item.href}`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: item.href === '/' ? 1.0 : 0.8
    }))

    // 文章
    const articles = await $fetch(`${siteConfig.apiUrl}/api/article/list`)
    const urls = pages.concat(
        articles.data?.filter(a => a.published).map(a => ({
            loc: `${baseUrl}/posts/${a.slug}`,
            lastmod: new Date(a.date).toISOString(),
            changefreq: 'weekly',
            priority: 0.9
        }))
    )

    // 生成 XML
    const xml =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`

    setHeader(event, 'Content-Type', 'application/xml; charset=UTF-8')
    return xml
})