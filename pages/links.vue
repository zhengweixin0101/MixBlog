<script setup>
import { computed } from '#imports'
import { linksConfig } from '@/siteConfig/links.js'
import { siteConfig } from '@/siteConfig/main.js'

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
    <main v-fade-in>
        <section class="py-12 w-full max-w-screen-xl mx-auto">
            <h1 data-fade class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">友链</span>
            </h1>

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
                            class="card-base relative w-full h-200px list-none outline-none bg-surface
                    hover:shadow-md hover:border-accent-line
                    transition-all duration-base group overflow-hidden"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex flex-col h-full rounded-xl no-underline focus:outline-none cursor-pointer"
                            >
                                <div class="relative h-120px group-hover:h-80px overflow-hidden rounded-t-xl bg-surface-2 shrink-0 transition-all duration-base ease-in-out">
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
                                <div class="flex-1 flex items-center gap-3 px-4 py-3 transition-all duration-base ease-in-out">
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
                                        <p v-if="item.description" class="mt-1 text-ink-muted text-xs leading-relaxed transition-colors duration-base show-multiline">
                                            {{ item.description }}
                                        </p>
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
                <p v-else data-fade class="mt-4 text-sm text-ink-subtle transition-colors duration-base">
                    暂无友链
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
</style>
