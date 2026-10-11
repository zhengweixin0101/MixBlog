import { siteConfig } from '@/siteConfig/main.js'

/**
 * Umami 统计
 * 全站访问量统一走自建 Umami
 *
 * 接口统一是 GET /api/websites/{siteId}/stats，一次返回
 * pageviews / visitors / visits / bounces / totaltime 五个指标，
 * 以时间范围切分 today / yesterday / month / total，
 * 第二个参数 path 是可选的页面过滤。
 *
 * 全部在浏览器端请求，命中 localStorage 缓存则不发请求；
 * 缓存条目带 TTL，跨页面共享同一份 key（页脚与关于页的「今日」共用），
 * 并发同 key 请求自动去重。请求失败时降级回落到过期缓存，避免数字变空。
 */

const { url: UMAMI_URL, siteId: UMAMI_SITE_ID, token: UMAMI_TOKEN, createTime: UMAMI_CREATE_TIME } = siteConfig.thirdParty.umami

const CACHE_KEY = 'umami_cache'
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const TOTAL_START_AT = new Date(UMAMI_CREATE_TIME).getTime()

function dayRange(date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    return { startAt: start.getTime(), endAt: end.getTime() }
}

// 时间范围即数据分片，startAt 为该分片的唯一标识（日/月的起点、当天的零点、固定的建站时间）
const RANGES = {
    today: {
        ttl: 5 * 60 * 1000,
        resolve: () => dayRange(new Date())
    },
    yesterday: {
        ttl: 30 * 60 * 1000,
        resolve: () => {
            const date = new Date()
            date.setDate(date.getDate() - 1)
            return dayRange(date)
        }
    },
    month: {
        ttl: 30 * 60 * 1000,
        resolve: () => {
            const now = new Date()
            return {
                startAt: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
                endAt: now.getTime()
            }
        }
    },
    total: {
        ttl: 30 * 60 * 1000,
        resolve: () => ({ startAt: TOTAL_START_AT, endAt: Date.now() })
    }
}

const inflight = new Map()
let memoryStore = null

function loadStore() {
    if (typeof window === 'undefined') return null
    if (memoryStore) return memoryStore
    try {
        const raw = window.localStorage.getItem(CACHE_KEY)
        memoryStore = raw ? JSON.parse(raw) : {}
    } catch {
        memoryStore = {}
    }
    if (typeof memoryStore !== 'object' || memoryStore === null) memoryStore = {}
    return memoryStore
}

function saveStore() {
    if (typeof window === 'undefined') return
    const now = Date.now()
    for (const key of Object.keys(memoryStore)) {
        if (now - memoryStore[key].ts > CACHE_MAX_AGE) delete memoryStore[key]
    }
    try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(memoryStore))
    } catch {
        // 配额超限等情况下放弃持久化，内存缓存仍可用
    }
}

function readEntry(key) {
    const store = loadStore()
    const entry = store?.[key]
    if (!entry || typeof entry.ts !== 'number') return null
    return entry
}

function writeEntry(key, data) {
    const store = loadStore()
    if (!store) return
    store[key] = { ts: Date.now(), data }
    saveStore()
}

async function requestStats({ startAt, endAt, path }) {
    return await $fetch(`${UMAMI_URL}/api/websites/${UMAMI_SITE_ID}/stats`, {
        headers: { Authorization: `Bearer ${UMAMI_TOKEN}` },
        query: {
            startAt,
            endAt,
            ...(path ? { path } : {})
        }
    })
}

async function getStats(range = 'today', path = '') {
    if (typeof window === 'undefined') return null

    const preset = RANGES[range]
    if (!preset) return null

    const { startAt, endAt } = preset.resolve()
    const key = `stats:${range}:${startAt}${path ? `:${path}` : ''}`

    const cached = readEntry(key)
    if (cached && Date.now() - cached.ts < preset.ttl) return cached.data

    if (inflight.has(key)) return inflight.get(key)

    const task = requestStats({ startAt, endAt, path })
        .then((data) => {
            writeEntry(key, data)
            return data
        })
        .catch((err) => {
            console.error('获取 Umami 统计失败:', err)
            const stale = readEntry(key)
            return stale ? stale.data : null
        })
        .finally(() => {
            inflight.delete(key)
        })

    inflight.set(key, task)
    return task
}

export function useUmami() {
    return {
        ranges: RANGES,
        getStats
    }
}