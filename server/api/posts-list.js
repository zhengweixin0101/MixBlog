import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import dayjs from 'dayjs'

export default defineEventHandler(async () => {
    const postsDir = path.resolve(process.cwd(), 'posts')
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))

    const posts = files.map(fileName => {
        const filePath = path.join(postsDir, fileName)
        const rawContent = fs.readFileSync(filePath, 'utf-8')
        const { data: frontmatter, content: body } = matter(rawContent)

        const dateFormatted = frontmatter.date ? dayjs(frontmatter.date).format('YYYY-MM-DD') : ''

        let description = frontmatter.description && frontmatter.description.trim()
        if (!description) {
            const excerptRaw = body.trim().slice(0, 50)
            description = excerptRaw + (body.trim().length > 50 ? '……' : '')
        }

        // 优先使用 frontmatter.slug，没有则用文件名
        const slug = frontmatter.slug && frontmatter.slug.trim() !== ''
            ? frontmatter.slug.trim()
            : fileName.replace(/\.md$/, '')

        return {
            slug,
            title: frontmatter.title || '',
            date: dateFormatted,
            description,
            tags: frontmatter.tags || []
        }
    })

    posts.sort((a, b) => new Date(b.date) - new Date(a.date))

    return posts
})