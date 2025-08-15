import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { siteConfig } from '../siteConfig/main.js'

const TITLE = siteConfig.title
const SITE_URL = siteConfig.url
const RSS_PATH = 'public/rss.xml'
const POSTS_PATH = './posts'
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// 格式化日期
function formatDate(date) {
  return new Date(date).toUTCString()
}

async function generateRSS() {
  try {
    const files = await fs.readdir(POSTS_PATH)

    const items = []

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      const fullPath = path.join(POSTS_PATH, file)
      const raw = await fs.readFile(fullPath, 'utf-8')
      const { data: frontmatter, content } = matter(raw)

      const slug = frontmatter.slug || file.replace(/\.md$/, '')
      const title = frontmatter.title || slug
      const description = frontmatter.description || content.trim().slice(0, 100)
      const date = frontmatter.date || new Date().toISOString()

      items.push({
        title: escapeHtml(title),
        link: `${SITE_URL}/posts/${slug}`,
        guid: `${SITE_URL}/posts/${slug}`,
        pubDate: formatDate(date),
        description,
        rawDescription: description
      })
    }

    items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

    const itemsXml = items.map(item => `
      <item>
        <title>${item.title}</title>
        <link>${item.link}</link>
        <guid isPermaLink="true">${item.guid}</guid>
        <pubDate>${item.pubDate}</pubDate>
        <description><![CDATA[${item.rawDescription}]]></description>
      </item>
    `).join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${TITLE}</title>
    <link>${SITE_URL}</link>
    <description>博客更新订阅</description>
    <language>zh-cn</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`

    await fs.mkdir(path.dirname(RSS_PATH), { recursive: true })
    await fs.writeFile(RSS_PATH, rss.trim())

    console.log(`✅ RSS 生成成功`)
  } catch (error) {
    console.error('❌ RSS 生成失败', error)
  }
}

export default generateRSS

if (process.argv[1].endsWith('generate-rss.js')) {
  generateRSS()
}
