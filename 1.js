import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// md 文件目录
const postsDir = path.join(__dirname, 'posts');

// 获取所有 md 文件
const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

// 上传文章函数
async function uploadArticle(article) {
    try {
        const response = await fetch('http://localhost:8000/api/edit', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        });
        const result = await response.json();
        console.log(`上传 "${article.slug}" 结果:`, result);
    } catch (err) {
        console.error(`上传 "${article.slug}" 失败:`, err);
    }
}

// 遍历所有 md 文件并上传
async function uploadAll() {
    for (const file of mdFiles) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        const article = {
            ...frontmatter,
            content,
            published: true
        };

        await uploadArticle(article);
    }
}

uploadAll();