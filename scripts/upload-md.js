import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { siteConfig } from '../siteConfig/main.js';

// 获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// md 文件目录
const postsDir = path.join(__dirname, '../posts');
const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

// 创建 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 提示用户输入 token
function askToken() {
    return new Promise((resolve) => {
        rl.question('请输入密钥: ', (answer) => {
            resolve(answer.trim());
        });
    });
}

// 上传文章函数
async function uploadArticle(article, token) {
    try {
        const uploadUrl = siteConfig.postsData.postsList.replace('/list', '/edit');
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': token
            },
            body: JSON.stringify(article)
        });
        const result = await response.json();
        console.log(`上传 "${article.slug}" 结果:`, result);
    } catch (err) {
        console.error(`上传 "${article.slug}" 失败:`, err);
    }
}

// 遍历所有 md 文件并上传
async function uploadAll(token) {
    for (const file of mdFiles) {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);

        const article = {
            ...frontmatter,
            content,
            published: true
        };

        await uploadArticle(article, token);
    }
}

// 主程序
async function main() {
    const token = await askToken();
    await uploadAll(token);
    rl.close();
}

main();