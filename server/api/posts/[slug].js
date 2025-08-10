import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { defineEventHandler, createError } from 'h3'
import dayjs from 'dayjs'

const postsDir = path.resolve(process.cwd(), 'posts')

let slugToFileMap = null

function loadSlugMap() {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
    const map = {}

    files.forEach(file => {
        const fullPath = path.join(postsDir, file)
        const raw = fs.readFileSync(fullPath, 'utf-8')
        const { data } = matter(raw)
        const key = (data.slug && data.slug.trim() !== '') ? data.slug.trim() : file.replace(/\.md$/, '')

        if (map[key]) {
            throw new Error(`重复的 slug: "${key}"，请确保 slug 唯一。冲突文件：${file} 和 ${path.basename(map[key])}`)
        }

        map[key] = fullPath
    })

    return map
}

slugToFileMap = loadSlugMap()

export default defineEventHandler(async (event) => {
    const { slug } = event.context.params

    if (!slugToFileMap) {
        slugToFileMap = loadSlugMap()
    }

    const filePath = slugToFileMap[slug]

    if (!filePath || !fs.existsSync(filePath)) {
        throw createError({ statusCode: 404, statusMessage: '文章未找到' })
    }

    try {
        const rawContent = fs.readFileSync(filePath, 'utf-8')
        const { data: frontmatter, content } = matter(rawContent)

        // 计算格式化日期
        if (frontmatter.date) {
            frontmatter.date = dayjs(frontmatter.date).format('YYYY-MM-DD')
        }

        // 计算 slug（优先 frontmatter.slug，否则用文件名）
        frontmatter.slug = (frontmatter.slug && frontmatter.slug.trim() !== '') ? frontmatter.slug.trim() : path.basename(filePath, '.md')

        if (!frontmatter.description || frontmatter.description.trim() === '') {
            const plainContent = content.replace(/\s+/g, ' ').trim()
            frontmatter.description = plainContent.length > 50
                ? plainContent.slice(0, 50) + '……'
                : plainContent
        }

        return { frontmatter, content }
    } catch (err) {
        throw createError({ statusCode: 500, statusMessage: '服务器读取文章失败' })
    }
})