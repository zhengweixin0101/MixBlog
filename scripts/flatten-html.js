import fs from 'fs'
import path from 'path'

const distDir = path.resolve('./dist')

fs.readdirSync(distDir).forEach(item => {
    const itemPath = path.join(distDir, item)
    const stat = fs.statSync(itemPath)

    if (stat.isDirectory()) {
        const indexHtml = path.join(itemPath, 'index.html')

        if (fs.existsSync(indexHtml)) {
            const newHtml = path.join(distDir, `${item}.html`)
            fs.renameSync(indexHtml, newHtml)
            console.log(`✅ 已扁平化 ${item}/index.html → ${item}.html`)
        }

        if (item === 'posts') {
            fs.readdirSync(itemPath).forEach(post => {
                const postPath = path.join(itemPath, post)
                const postStat = fs.statSync(postPath)
                if (postStat.isDirectory()) {
                    const postIndex = path.join(postPath, 'index.html')
                    if (fs.existsSync(postIndex)) {
                        const newPostHtml = path.join(itemPath, `${post}.html`)
                        fs.renameSync(postIndex, newPostHtml)
                        console.log(`✅ 已扁平化 posts/${post}/index.html → posts/${post}.html`)
                    }
                }
            })
        }
    }
})

console.log('🎉 所有页面全部扁平化完成。')
