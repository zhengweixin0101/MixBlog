import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dayjs from 'dayjs';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.resolve(__dirname, '../posts');
const outDir = path.resolve(__dirname, '../public/data/posts');
const listFile = path.resolve(__dirname, '../public/data/posts-list.json');
const mdFileListFile = path.resolve(__dirname, '../public/data/md-list.json');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const postList = [];
const mdFileList = [];

files.forEach(filename => {
    const slugFromFile = filename.replace(/\.md$/, '');
    const fullPath = path.join(postsDir, filename);
    const mdText = fs.readFileSync(fullPath, 'utf-8');

    const { data: frontmatter, content } = matter(mdText);

    // 处理 description 字段
    let description = '';
    if (frontmatter.description) {
        if (Array.isArray(frontmatter.description)) {
            description = frontmatter.description.join(' ');
        } else {
            description = frontmatter.description;
        }
        description = description.replace(/^['"]+|['"]+$/g, '').trim();
    }
    if (!description) {
        const excerptRaw = content.trim().slice(0, 50);
        description = excerptRaw + (content.trim().length > 50 ? '……' : '');
    }

    // 优先用 frontmatter.slug，没有则用文件名
    const slugUsed = frontmatter.slug ? frontmatter.slug.trim() : slugFromFile;

    // 文章列表
    postList.push({
        slug: slugUsed,
        title: frontmatter.title || '',
        date: formatDate(frontmatter.date),
        description,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    });

    // 文章内容
    const postData = {
        frontmatter: {
            slug: slugUsed,
            title: frontmatter.title || '',
            date: formatDate(frontmatter.date),
            description: frontmatter.description || '',
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        },
        content,
    };

    // 输出 /posts/{slug}.json
    const outFile = path.join(outDir, `${slugUsed}.json`);
    const newContent = JSON.stringify(postData, null, 2);

    let needWrite = true;
    if (fs.existsSync(outFile)) {
        const oldContent = fs.readFileSync(outFile, 'utf-8');
        if (oldContent === newContent) {
            needWrite = false; // 内容没变，跳过写入
        }
    }
    if (needWrite) {
        fs.writeFileSync(outFile, newContent, 'utf-8');
    }

    mdFileList.push({
        filename,
        slug: slugUsed
    });
});

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = dayjs(dateStr);
    return d.isValid() ? d.format('YYYY-MM-DD') : '';
}

// 输出posts-list.json
const postListContent = JSON.stringify(postList, null, 2);
let needWriteList = true;
if (fs.existsSync(listFile)) {
    const oldList = fs.readFileSync(listFile, 'utf-8');
    if (oldList === postListContent) {
        needWriteList = false;
    }
}
if (needWriteList) {
    fs.writeFileSync(listFile, postListContent, 'utf-8');
}

// 输出md-file.json
const mdFileListContent = JSON.stringify(mdFileList, null, 2);
let needWriteMdFile = true;
if (fs.existsSync(mdFileListFile)) {
    const oldMdFile = fs.readFileSync(mdFileListFile, 'utf-8');
    if (oldMdFile === mdFileListContent) {
        needWriteMdFile = false;
    }
}
if (needWriteMdFile) {
    fs.writeFileSync(mdFileListFile, mdFileListContent, 'utf-8');
}

console.log('✅ 文章数据生成完毕 ');