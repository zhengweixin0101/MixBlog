<script setup>
import { computed } from '#imports'
import { linksConfig } from '@/siteConfig/links.js'
import { siteConfig } from '@/siteConfig/main.js'

usePageMeta('Links', `${siteConfig.description}`, '/links', '友链,推荐,应用,links')

const sections = linksConfig.sections || []

/**
 * 根据板块首条拥有的字段，推断整板块的统一布局类型。
 * 要求同一板块各项参数相同，以首条为准。
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
            <h1 data-fade class="text-3xl mt-40">
        <span
            class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient"
        >
          友链
          <span
              class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/50 to-#00e2d8/50 dark:hidden transition-colors duration-300"
          ></span>
        </span>
            </h1>
            <p data-fade class="mt-2 text-#2f3f5b dark:text-gray-300 transition-colors duration-300">
                朋友们、好工具和我部署的小玩意儿。
            </p>

            <div
                data-fade
                v-for="sl in sectionLayouts"
                :key="sl.section.title"
                class="mt-12 first:mt-8"
            >
                <h2
                    class="text-xl font-semibold text-#2f3f5b dark:text-white transition-colors duration-300"
                >
          <span class="relative inline-block">
            {{ sl.section.title }}
            <span
                class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/30 to-#00e2d8/30 dark:hidden transition-colors duration-300"
            ></span>
          </span>
                </h2>
                <p
                    v-if="sl.section.description"
                    class="mt-1 text-sm text-#2f3f5b/70 dark:text-gray-400 transition-colors duration-300"
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
                            class="relative w-full h-200px rounded-xl list-none outline-none bg-#fefefe dark:bg-white/10
                    shadow-[0_0_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]
                    transition-all duration-300 group overflow-hidden"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex flex-col h-full rounded-xl no-underline focus:outline-none cursor-pointer"
                            >
                                <div class="relative h-120px group-hover:h-80px overflow-hidden rounded-t-xl bg-#f0f0f0 dark:bg-white/5 shrink-0 transition-all duration-300 ease-in-out">
                                    <img
                                        :src="item.screenshot"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        loading="lazy"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-full h-full object-cover transition-all duration-300 ease-in-out"
                                    />
                                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 ease-in-out pointer-events-none" />
                                </div>
                                <div class="flex-1 flex items-center gap-3 px-4 py-3 transition-all duration-300 ease-in-out">
                                    <img
                                        v-if="item.avatar"
                                        :src="item.avatar"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-9 h-9 rounded-full object-cover shrink-0 border border-#e0e0e0 dark:border-white/20 transition-colors duration-300"
                                    />
                                    <div class="min-w-0 flex-1">
                                        <h4 :class="[item.description ? 'text-sm' : 'text-base', 'text-#2f3f5b dark:text-white font-semibold transition-colors duration-300 show-multiline']">
                                            {{ item.name }}
                                        </h4>
                                        <p v-if="item.description" class="mt-1 text-#2f3f5b dark:text-gray-400 text-xs transition-colors duration-300 show-multiline">
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
                            class="relative w-full h-90px rounded-xl list-none outline-none bg-#fefefe dark:bg-white/10
                    shadow-[0_0_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]
                    transition-all duration-300 group overflow-hidden"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex items-center h-full rounded-xl no-underline focus:outline-none cursor-pointer px-4 gap-3 group-hover:gap-0 transition-all duration-300"
                            >
                                <span class="avatar-fade shrink-0">
                                    <img
                                        :src="item.avatar"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-10 h-10 rounded-full object-cover border border-#e0e0e0 dark:border-white/20"
                                    />
                                </span>
                                <h4 class="min-w-0 flex-1 text-#2f3f5b dark:text-white text-base font-semibold truncate transition-colors duration-300">
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
                            class="relative w-full h-90px rounded-xl list-none outline-none bg-#fefefe dark:bg-white/10
                    shadow-[0_0_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]
                    transition-all duration-300 group overflow-hidden"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="flex items-center h-full rounded-xl no-underline focus:outline-none cursor-pointer px-4 gap-3 group-hover:gap-0 transition-all duration-300"
                            >
                                <span class="avatar-fade-md shrink-0">
                                    <img
                                        :src="item.avatar"
                                        :alt="item.name"
                                        referrerpolicy="no-referrer"
                                        onload="this.style.opacity=1"
                                        @error="$event.target.style.display='none'"
                                        class="w-11 h-11 rounded-full object-cover border border-#e0e0e0 dark:border-white/20"
                                    />
                                </span>
                                <div class="min-w-0 flex-1">
                                    <h4 class="text-#2f3f5b dark:text-white text-sm font-semibold truncate transition-colors duration-300">
                                        {{ item.name }}
                                    </h4>
                                    <p class="mt-1 text-#2f3f5b dark:text-gray-400 text-xs truncate transition-colors duration-300">
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
                            class="relative w-full rounded-xl list-none outline-none bg-#fefefe dark:bg-white/10
                    shadow-[0_0_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]
                    transition-all duration-300 group"
                        >
                            <div class="h-full box-border flex flex-col justify-center rounded-xl p-4">
                                <h4 class="text-#2f3f5b dark:text-white text-sm font-semibold truncate transition-colors duration-300">
                                    {{ item.name }}
                                </h4>
                                <p class="mt-1 text-#2f3f5b dark:text-gray-400 text-xs truncate transition-colors duration-300">
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
                            class="relative w-full rounded-xl list-none outline-none bg-#fefefe dark:bg-white/10
                    shadow-[0_0_2px_rgba(0,0,0,0.2)] hover:shadow-[0_0_2px_rgba(0,0,0,0.2),0_0_0_1px_#00e699]
                    transition-all duration-300 group"
                        >
                            <a
                                :href="item.link"
                                target="_blank"
                                rel="noopener"
                                class="rounded-xl no-underline focus:outline-none cursor-pointer"
                            >
                                <div class="rounded-xl p-4 no-underline">
                                    <h4 class="text-#2f3f5b dark:text-white text-sm font-semibold truncate transition-colors duration-300">
                                        {{ item.name }}
                                    </h4>
                                    <p class="mt-1 text-#2f3f5b dark:text-gray-400 text-xs truncate transition-colors duration-300">
                                        {{ item.description }}
                                    </p>
                                </div>
                            </a>
                        </li>
                    </template>
                </ul>
                </template>
                <p v-else data-fade class="mt-4 text-sm text-#2f3f5b/50 dark:text-gray-500 transition-colors duration-300">
                    暂无友链
                </p>
            </div>

            <div data-fade class="mt-16">
                <h2 class="text-xl font-semibold text-#2f3f5b dark:text-white transition-colors duration-300">
                    <span class="relative inline-block">
                        友链申请
                        <span class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/30 to-#00e2d8/30 dark:hidden transition-colors duration-300"></span>
                    </span>
                </h2>
                <div class="mt-4 text-sm text-#2f3f5b/80 dark:text-gray-300 transition-colors duration-300 space-y-1.5">
                    <p class="text-#2f3f5b dark:text-white font-semibold">请确保您的网站：</p>
                    <p>1. 可以在1分钟内加载完成首屏。</p>
                    <p>2. 内容符合中国大陆法律法规。</p>
                    <p>3. 已添加本站友链。</p>
                    <p>4. 在评论区留下你的站点信息（名称、链接、头像、描述）。</p>
                    <div class="!mt-4 p-4 rounded-lg bg-#fefefe/50 dark:bg-white/5 text-xs font-mono">
                        <p class="text-#2f3f5b dark:text-white font-semibold !mb-2">本站信息</p>
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
