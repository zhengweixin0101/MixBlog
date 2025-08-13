import fs from 'fs'
import path from 'path'

const postsDir = path.resolve('./dist/posts')
const slugs = fs.readdirSync(postsDir)

slugs.forEach(slug => {
    const postPath = path.join(postsDir, slug)
    const indexPath = path.join(postPath, 'index.html')
    const newPath = path.join(postsDir, `${slug}.html`)

    if (fs.existsSync(indexPath)) {
        fs.renameSync(indexPath, newPath)
        fs.rmSync(postPath, { recursive: true, force: true })
    }
})

console.log('✅ 文章 HTML 文件已扁平化。')
