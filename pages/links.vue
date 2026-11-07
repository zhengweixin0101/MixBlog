<script setup>
import { computed, onMounted, onBeforeUnmount } from '#imports'
import { linksConfig } from '@/siteConfig/links.js'
import { siteConfig } from '@/siteConfig/main.js'

const DESC_LINE_HEIGHT = 1.375

// 判定描述是否超出单行，用于控制省略号与右端渐隐
function markDescOverflow(el) {
    const style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * DESC_LINE_HEIGHT
    const overflow = el.scrollHeight > lineHeight + 1
    const wrap = el.parentElement
    wrap?.classList.toggle('has-desc-overflow', overflow)
    if (!overflow || !wrap) return

    // 量出第一行文字的结尾，让省略号跟在其后
    const range = document.createRange()
    range.selectNodeContents(el.firstChild || el)
    const firstLineRight = range.getClientRects()[0]?.right
    if (!firstLineRight) return
    const gap = el.getBoundingClientRect().right - firstLineRight
    wrap.style.setProperty('--ell-gap', `${Math.max(0, gap)}px`)
}

function refreshDescOverflow() {
    document.querySelectorAll('.desc-expand').forEach(markDescOverflow)
}

let descObserver = null

function expandDesc(e) {
    const el = e.currentTarget.querySelector('.desc-expand')
    if (!el) return
    el.style.maxHeight = `${el.scrollHeight}px`
}

function collapseDesc(e) {
    const el = e.currentTarget.querySelector('.desc-expand')
    if (!el) return
    el.style.maxHeight = `${DESC_LINE_HEIGHT}em`
}

onMounted(() => {
    refreshDescOverflow()
    if (typeof ResizeObserver !== 'undefined') {
        descObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => markDescOverflow(entry.target))
        })
        document.querySelectorAll('.desc-expand').forEach((el) => descObserver.observe(el))
    }
    document.fonts?.ready.then(refreshDescOverflow)
})

onBeforeUnmount(() => {
    descObserver?.disconnect()
    descObserver = null
})

usePageMeta('Links', `${siteConfig.description}`, '/links', '友链,推荐,应用,links')

const sections = linksConfig.sections || []

/**
 * 按板块首条拥有的字段推断整板块的布局类型（要求同板块各项字段一致）
 */
function detectLayout(section) {
    if (!section.items || section.items.length === 0) return 'no-avatar'
    const first = section.items[0]

    if (first.screenshot) return 'full'           // 截图 + 名称 + 描述 + 链接
    if (first.avatar && !first.description) return 'avatar-only' // 仅头像 + 名称
    if (first.avatar && first.description) return 'avatar-desc' // 头像 + 名称 + 描述
    if (first.description && !first.link) return 'desc-only'    // 仅名称 + 描述
    return 'no-avatar'                            // 名称 + 描述 + 链接
}

const sectionLayouts = computed(() =>
    sections.map((s) => ({ section: s, layout: detectLayout(s) })),
)
</script>

<template>
    <main>
        <section class="py-12 w-full max-w-screen-xl mx-auto">
            <h1 data-fade class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">友链</span>
            </h1>
            <p data-fade class="mt-2 text-ink-muted transition-colors duration-base">
                与你同行，发现更广阔的世界。
            </p>

            <div
                data-fade
                v-for="sl in sectionLayouts"
                :key="sl.section.title"
                class="mt-8"
            >
                <h2
                    class="text-xl font-display font-semibold text-ink"
                >
                    {{ sl.section.title }}
                </h2>
                <p
                    v-if="sl.section.description"
                    class="mt-1 text-sm text-ink-muted leading-relaxed transition-colors duration-base"
                >
                    {{ sl.section.description }}
                </p>

                <template v-if="sl.section.items && sl.section.items.length > 0">
                <ul
                    class="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
                >
                    <template v-if="sl.layout === 'full'">
                        <li
                            data-fade
                            v-for="item in sl.section.items"
                            :key="item.link"
                            class="card-base relative w-full h-180px list-none outline-none bg-surface
                    hover:shadow-md hover:border-accent-line
                    transition-all duration-base group overflow-hidden"
                            @mouseenter="expandDesc"
                            @mouseleave="collapseDesc"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex flex-col h-full rounded-xl no-underline focus:outline-none cursor-pointer"
                            >
                                <div class="relative h-108px group-hover:h-72px overflow-hidden rounded-t-xl bg-surface-2 shrink-0 transition-all duration-base ease-in-out">
                                    <img
                                        :src="item.screenshot"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        loading="lazy"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-full h-full object-cover transition-all duration-base ease-in-out"
                                    />
                                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-base ease-in-out pointer-events-none" />
                                </div>
                                <div class="flex-1 flex items-center gap-2 px-4 py-3 transition-all duration-base ease-in-out group-hover:-translate-y-[18px]">
                                    <img
                                        v-if="item.avatar"
                                        :src="item.avatar"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-9 h-9 rounded-full object-cover shrink-0 border border-line transition-colors duration-base"
                                    />
                                    <div class="min-w-0 flex-1">
                                        <h4 :class="[item.description ? 'text-sm' : 'text-base', 'text-ink font-semibold transition-colors duration-base show-multiline']">
                                            {{ item.name }}
                                        </h4>
                                        <div v-if="item.description" class="desc-wrap mt-0.5 text-ink-muted text-xs leading-snug transition-colors duration-base">
                                            <p class="desc-expand">
                                                {{ item.description }}
                                                <span class="desc-ellipsis" aria-hidden="true">…</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                    </template>

                    <template v-if="sl.layout === 'avatar-only'">
                        <li
                            data-fade
                            v-for="item in sl.section.items"
                            :key="item.link"
                            class="card-base relative w-full h-90px list-none outline-none bg-surface
                    border border-line shadow-xs hover:shadow-md hover:border-accent-line
                    transition-all duration-base group overflow-hidden"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex items-center h-full rounded-xl no-underline focus:outline-none cursor-pointer px-4 gap-3 group-hover:gap-0 transition-all duration-base"
                            >
                                <span class="avatar-fade shrink-0">
                                    <img
                                        :src="item.avatar"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-10 h-10 rounded-full object-cover border border-line"
                                    />
                                </span>
                                <h4 class="min-w-0 flex-1 text-ink text-base font-semibold truncate transition-colors duration-base">
                                    {{ item.name }}
                                </h4>
                            </a>
                        </li>
                    </template>

                    <template v-if="sl.layout === 'avatar-desc'">
                        <li
                            data-fade
                            v-for="item in sl.section.items"
                            :key="item.link"
                            class="card-base relative w-full h-90px list-none outline-none bg-surface
                    border border-line shadow-xs hover:shadow-md hover:border-accent-line
                    transition-all duration-base group overflow-hidden"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex items-center h-full rounded-xl no-underline focus:outline-none cursor-pointer px-4 gap-3 group-hover:gap-0 transition-all duration-base"
                            >
                                <span class="avatar-fade-md shrink-0">
                                    <img
                                        :src="item.avatar"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-11 h-11 rounded-full object-cover border border-line"
                                    />
                                </span>
                                <div class="min-w-0 flex-1">
                                    <h4 class="text-ink text-sm font-semibold truncate transition-colors duration-base">
                                        {{ item.name }}
                                    </h4>
                                    <p class="mt-1 text-ink-muted text-xs truncate transition-colors duration-base">
                                        {{ item.description }}
                                    </p>
                                </div>
                            </a>
                        </li>
                    </template>

                    <template v-if="sl.layout === 'desc-only'">
                        <li
                            data-fade
                            v-for="item in sl.section.items"
                            :key="item.name"
                            class="card-base relative w-full list-none outline-none bg-surface
                    border border-line shadow-xs hover:shadow-md hover:border-accent-line
                    transition-all duration-base group"
                        >
                            <div class="h-full box-border flex flex-col justify-center rounded-xl p-4">
                                <h4 class="text-ink text-sm font-semibold truncate transition-colors duration-base">
                                    {{ item.name }}
                                </h4>
                                <p class="mt-1 text-ink-muted text-xs truncate transition-colors duration-base">
                                    {{ item.description }}
                                </p>
                            </div>
                        </li>
                    </template>

                    <template v-if="sl.layout === 'no-avatar'">
                        <li
                            data-fade
                            v-for="item in sl.section.items"
                            :key="item.link"
                            class="card-base relative w-full list-none outline-none bg-surface
                    border border-line shadow-xs hover:shadow-md hover:border-accent-line
                    transition-all duration-base group"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="rounded-xl no-underline focus:outline-none cursor-pointer"
                            >
                                <div class="rounded-xl p-4 no-underline">
                                    <h4 class="text-ink text-sm font-semibold truncate transition-colors duration-base">
                                        {{ item.name }}
                                    </h4>
                                    <p class="mt-1 text-ink-muted text-xs truncate transition-colors duration-base">
                                        {{ item.description }}
                                    </p>
                                </div>
                            </a>
                        </li>
                    </template>
                </ul>
                </template>
                <p v-else data-fade class="mt-4 rounded-lg border border-dashed border-line bg-surface-4 px-4 py-6 text-center text-sm text-ink-subtle transition-colors duration-base">
                    暂无友链，欢迎在下方留言交换～
                </p>
            </div>

            <div data-fade class="mt-8">
                <h2 class="text-xl font-display font-semibold text-ink">
                    友链申请
                </h2>
                <p class="mt-1 text-sm text-ink-muted leading-relaxed transition-colors duration-base">
                    请在评论区留下你的站点信息（名称、链接、头像、描述等）
                </p>
            </div>
            <div data-fade class="mt-4 bg-surface border border-line p-4 md:p-5 rounded-card shadow-xs min-w-full relative transition-colors duration-base">
                <div class="text-sm text-ink-muted space-y-1.5">
                    <p class="text-ink font-semibold">请确保您的网站：</p>
                    <div class="!mt-3 space-y-1.5">
                        <p>1. 可以在1分钟内加载完成首屏</p>
                        <p>2. 内容符合中国大陆法律法规</p>
                        <p>3. 已添加本站友链</p>
                    </div>
                    <div class="!mt-4 p-4 rounded-lg bg-surface-4 text-xs font-mono leading-tight">
                        <p class="text-ink font-semibold !mb-2">本站信息</p>
                        <p>名称：ShinX</p>
                        <p>链接：https://zhengweixin.top/</p>
                        <p>头像：https://cdn.zhengweixin.top/avatar.jpg</p>
                        <p>描述：往日不悔，未来可期。</p>
                    </div>
                </div>
            </div>

            <div data-fade class="mt-8">
                <Comment />
            </div>
        </section>
    </main>
</template>

<style scoped>
.avatar-fade {
    max-width: 40px;
    overflow: hidden;
    transition: max-width 0.3s ease-in-out, opacity 0.15s ease-in-out;
}
.group:hover .avatar-fade {
    max-width: 0;
    opacity: 0;
}
.avatar-fade-md {
    max-width: 44px;
    overflow: hidden;
    transition: max-width 0.3s ease-in-out, opacity 0.15s ease-in-out;
}
.group:hover .avatar-fade-md {
    max-width: 0;
    opacity: 0;
}
.show-multiline {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
}
.group:hover .show-multiline {
    -webkit-line-clamp: 3;
    line-clamp: 3;
}
.desc-expand {
    position: relative;
    overflow: hidden;
    max-height: 1.375em;
    transition: max-height 320ms var(--ease-fade);
}

/* 文字与省略号共用同一条渐隐遮罩 */
.desc-wrap.has-desc-overflow .desc-expand {
    --desc-fade: 48px;
    --desc-end: 0.35;
    padding-right: 10px;
    margin-right: -8px;
    -webkit-mask-image: linear-gradient(to right, #000 calc(100% - var(--desc-fade)), rgba(0, 0, 0, var(--desc-end)) 100%);
    mask-image: linear-gradient(to right, #000 calc(100% - var(--desc-fade)), rgba(0, 0, 0, var(--desc-end)) 100%);
    transition: max-height 320ms var(--ease-fade),
        --desc-fade 320ms var(--ease-fade),
        --desc-end 320ms var(--ease-fade);
}

.group:hover .desc-wrap.has-desc-overflow .desc-expand {
    --desc-fade: 0px;
    --desc-end: 1;
}

.desc-wrap.has-desc-overflow .desc-ellipsis {
    opacity: 1;
}

.group:hover .desc-wrap.has-desc-overflow .desc-ellipsis {
    opacity: 0;
}

.desc-ellipsis {
    position: absolute;
    top: 0;
    right: max(0px, calc(var(--ell-gap, 0px) - 12px));
    pointer-events: none;
    user-select: none;
    line-height: inherit;
    opacity: 0;
    transition: opacity 320ms var(--ease-fade);
}

@property --desc-fade {
    syntax: '<length>';
    inherits: false;
    initial-value: 48px;
}

@property --desc-end {
    syntax: '<number>';
    inherits: false;
    initial-value: 0.35;
}
</style>
