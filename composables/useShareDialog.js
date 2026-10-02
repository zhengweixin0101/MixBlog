import { reactive } from 'vue'
import { siteConfig } from '@/siteConfig/main.js'

/**
 * 资源分享弹窗
 * 文章里写 [资源链接](https://blog.api.zhengweixin.top/api/shares?id=xxx&type=redirect)
 * 渲染时由 replaceShareLinks() 换成 <button data-share-id="xxx">，
 * 点击后由 ShareDialog 事件委托调用 open() 请求 JSON 并弹窗展示全部网盘。
 */

const state = reactive({
    visible: false,
    loading: false,
    error: '',
    shareId: '',
    share: null
})

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000
let requestToken = 0

async function open(shareId) {
    if (!shareId) return
    const token = ++requestToken
    state.visible = true
    state.loading = true
    state.error = ''
    state.shareId = shareId
    state.share = null

    const cached = cache.get(shareId)
    if (cached && Date.now() - cached.time < CACHE_TTL) {
        state.share = cached.share
        state.loading = false
        return
    }

    try {
        const res = await $fetch(`${siteConfig.apiUrl}/api/shares`, {
            query: { id: shareId }
        })
        if (token !== requestToken) return
        const share = res?.data
        if (!share || !Array.isArray(share.drives) || share.drives.length === 0) {
            state.error = '该分享暂无可用网盘'
            return
        }
        cache.set(shareId, { time: Date.now(), share })
        state.share = share
    } catch {
        if (token !== requestToken) return
        state.error = '分享加载失败, 请稍后重试'
    } finally {
        if (token === requestToken) state.loading = false
    }
}

function close() {
    requestToken++
    state.visible = false
    state.loading = false
    state.error = ''
    state.shareId = ''
    state.share = null
}

function retry() {
    const id = state.shareId
    if (!id) return
    cache.delete(id)
    open(id)
}

// 分享 id 规则
const SHARE_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/

function decodeEntities(str) {
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&')
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

// 从 href 中解析分享 id，非本站分享接口的链接返回 null
function parseShareId(href) {
    if (!href) return null
    let parsed
    try {
        parsed = new URL(href, siteConfig.url)
    } catch {
        return null
    }
    // 相对路径 或 与 apiUrl 同源才认为是分享链接
    const isApi = parsed.origin === new URL(siteConfig.apiUrl).origin
    const isRelative = !/^https?:\/\//i.test(href)
    if (!isApi && !isRelative) return null
    if (!parsed.pathname.replace(/\/+$/, '').endsWith('/api/shares')) return null
    const id = parsed.searchParams.get('id')
    return id && SHARE_ID_REGEX.test(id) ? id : null
}

// 把文章里的分享直链替换成触发弹窗的按钮
function replaceShareLinks(html) {
    if (!html || !html.includes('/api/shares')) return html
    return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (match, attrs, inner) => {
        const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
        if (!hrefMatch) return match
        const id = parseShareId(decodeEntities(hrefMatch[1] ?? hrefMatch[2] ?? ''))
        if (!id) return match
        const label = decodeEntities(inner.replace(/<[^>]+>/g, '')).trim()
        return `<button type="button" class="share-btn" data-share-id="${id}" title="点击选择网盘"><i class="iconfont icon-download"></i>${escapeHtml(label || '资源下载')}</button>`
    })
}

export function useShareDialog() {
    return { state, open, close, retry, replaceShareLinks }
}