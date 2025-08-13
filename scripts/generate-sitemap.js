import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const baseUrl = 'https://zhengweixin.top'

// 路由到 Vue 页面文件的映射
const pageFilesMap = {
  '/': '/pages/index.vue',
  '/posts': '/pages/posts/index.vue',
  '/about': '/pages/about.vue',
}

// 获取文件最后修改时间
function getLastMod(filepath) {
  try {
    const stats = fs.statSync(filepath)
    return stats.mtime.toISOString().slice(0, 10)
  } catch {
    // 读不到就用今天
    return new Date().toISOString().slice(0, 10)
  }
}

const routes = []

// 处理普通页面
for (const [route, filepath] of Object.entries(pageFilesMap)) {
  const absPath = path.resolve(filepath)
  const lastmod = getLastMod(absPath)
  routes.push({ url: route, lastmod })
}

// 处理 Markdown 文件
const postsDir = path.resolve('./posts')
if (fs.existsSync(postsDir)) {
  const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  postFiles.forEach(filename => {
    const filePath = path.join(postsDir, filename)
    const lastmod = getLastMod(filePath)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter } = matter(fileContent)
    const slug = frontmatter.slug || filename.replace(/\.md$/, '')
    const route = `/posts/${slug}`
    routes.push({ url: route, lastmod })
  })
}

// 生成 sitemap XML
function generateSitemap(routes) {
  const urls = routes.map(({ url, lastmod }) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml')
const relativePath = path.relative(process.cwd(), sitemapPath)

try {
  const sitemapContent = generateSitemap(routes)
  fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8')
  console.log(`✅ sitemap 生成成功`)
} catch (error) {
  console.error(`❌ sitemap 生成失败：`)
  console.error(error)
}