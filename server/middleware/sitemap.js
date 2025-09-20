import { $fetch } from 'ofetch'
import { siteConfig } from '@/siteConfig/main.js'

export default defineEventHandler(async (event) => {
    if (event.req.url !== '/sitemap.xml') return

    const baseUrl = siteConfig.url

    // 页面
    const pages = [
        { loc: baseUrl, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 1.0 },
        { loc: `${baseUrl}/posts`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
        { loc: `${baseUrl}/talks`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
        { loc: `${baseUrl}/apps`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
        { loc: `${baseUrl}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
    ];

    // 文章
    const articles = await $fetch(siteConfig.postsData.postsList);
    const urls = pages.concat(
        articles.filter(a => a.published).map(a => ({
            loc: `${baseUrl}/posts/${a.slug}`,
            lastmod: new Date(a.date).toISOString(),
            changefreq: 'weekly',
            priority: 0.9
        }))
    );

    // 生成
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('')}
</urlset>`;

    setHeader(event, 'Content-Type', 'application/xml');
    return xml;
});
