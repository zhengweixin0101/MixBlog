import fs from 'fs'
import path from 'path'

const postsDir = path.resolve('./dist/posts')
fs.readdirSync(postsDir).forEach(item => {
    const itemPath = path.join(postsDir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
        const indexHtml = path.join(itemPath, 'index.html')
        const newHtml = path.join(postsDir, `${item}.html`)
        if (fs.existsSync(indexHtml)) {
            fs.renameSync(indexHtml, newHtml)
        }
    } else if (item === 'index.html') {
        const newHtml = path.resolve('./dist/posts.html')
        fs.renameSync(itemPath, newHtml)
    }
})

console.log('✅ 文章 HTML 文件已扁平化。')
