<script setup>
import { ref, computed, watch, nextTick } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import { usePostsMasonry } from '@/composables/usePostsMasonry'

usePageMeta('文章', `${siteConfig.description}`, '/posts', '文章,列表,posts,list')

const searchTerm = ref('')
const selectedTag = ref('')

const { data: postsRaw } = await useAsyncData('posts-list', () =>
  $fetch(`${siteConfig.apiUrl}/api/articles`),
  { server: true }
)

const posts = computed(() => postsRaw.value?.data || [])

const allTags = computed(() => {
  const tags = new Set()
  posts.value.forEach(post => {
    (post.tags || []).forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

// 筛选切换的整体换页容器
// 纯平移，方向由 --dir 控制：
// dir=1 新面板从右进、旧面板往左出；dir=-1 反之。
const panelWrap = ref(null)
// 面板实例 key 独立于 selectedTag：只有手动点标签才 ++
// 搜索词打字自动清空标签时不 ++，面板不重建，列表直接在原子树上变更，走浮现动画
const panelKey = ref(0)
let oldHeight = 0

// 滑动方向由点击位置决定，用标签在列表里的序号比较
// 未筛选锚在最左侧，各标签依次向右排。
// 目标位置在参照位置右边 → 新内容从右进、旧内容往左出；反之从左进。
function toggleTag(tag) {
  const next = selectedTag.value === tag ? '' : tag
  const refIndex = selectedTag.value ? allTags.value.indexOf(selectedTag.value) : -1
  const targetIndex = next === '' ? -1 : allTags.value.indexOf(tag)
  const dir = targetIndex > refIndex ? 1 : -1

  panelKey.value++ // 仅手动点标签才重建面板平移换页；搜索自动清空不走这条路
  panelWrap.value?.style.setProperty('--dir', dir)
  selectedTag.value = next
}

// 出场前记下旧面板高度，切换期间把容器高度撑住，
// 避免列表塌陷时页脚乱跳；同时给容器加上 is-sliding，栏边缘走渐隐过渡
function onBeforeLeave(el) {
  oldHeight = el.offsetHeight
  panelWrap.value?.classList.add('is-sliding')
}

function onBeforeEnter(el) {
  const wrap = panelWrap.value
  if (!wrap) return
  wrap.style.height = `${oldHeight}px`
  requestAnimationFrame(() => {
    const h = Math.max(oldHeight, el.offsetHeight)
    if (Math.abs(wrap.offsetHeight - h) > 1) wrap.style.height = `${h}px`
  })
}

function onAfterEnter() {
  const wrap = panelWrap.value
  if (!wrap) return
  wrap.style.height = ''
  wrap.classList.remove('is-sliding')
}

const filteredPosts = computed(() => {
  const term = searchTerm.value.toLowerCase()
  return posts.value
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(term)
      const matchesTag = !selectedTag.value || (post.tags || []).includes(selectedTag.value)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// 双列瀑布流
const { setListEl, columns, twoCols } = usePostsMasonry(filteredPosts)
let searchRevealClearTimer = null

watch(searchTerm, async () => {
  // 搜索输入时自动清空标签筛选
  if (searchTerm.value.trim() && selectedTag.value) {
    selectedTag.value = ''
  }
  const el = panelWrap.value
  if (!el) return
  const oldH = el.offsetHeight
  await nextTick()
  const newH = el.offsetHeight
  if (Math.abs(newH - oldH) > 1) {
    el.style.height = `${oldH}px`
    el.style.transition = 'height var(--dur-slow) var(--ease-fade)'
    requestAnimationFrame(() => {
      el.style.height = `${newH}px`
    })
    // 过渡结束后清掉内联样式，还原 auto
    clearTimeout(searchRevealClearTimer)
    const clear = () => {
      el.style.height = ''
      el.style.transition = ''
      el.removeEventListener('transitionend', clear)
    }
    el.addEventListener('transitionend', clear)
    searchRevealClearTimer = setTimeout(clear, 600)
  }
  el.classList.remove('search-reveal')
  void el.offsetWidth
  el.classList.add('search-reveal')
})
</script>

<template>
  <main>
    <section class="py-12 w-full max-w-[65rem] mx-auto">
      <h1 data-fade class="text-3xl mt-40 font-display font-semibold tracking-tight text-balance">
        <span class="text-gradient">文章</span>
      </h1>
      <p data-fade="2" class="mt-2 text-ink-muted transition-colors duration-base">
        一些奇思妙想的文章。
      </p>

      <div data-fade>
        <div class="relative mt-6 sm:mt-8 w-full">
          <AppIcon name="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            v-model="searchTerm"
            placeholder="Search..."
            type="text"
            id="search"
            class="field-base appearance-none w-full h-12 pl-12 pr-4 rounded-xl
                  border border-line hover:border-line-field
                  focus:border-accent-line focus-visible:field-ring
                  transition-all duration-base
                  text-ink placeholder-ink-subtle outline-none"
          />
        </div>

        <div class="mt-4 flex flex-wrap items-baseline justify-start gap-2 text-sm text-ink-muted transition-colors duration-base">
          <span class="font-bold">Tag:</span>
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="{
              'is-active text-ink': selectedTag === tag,
              'bg-surface-2 text-ink-muted hover:text-ink': selectedTag !== tag
            }"
            class="tag-btn appearance-none inline-block px-2 py-1 text-xs rounded-full transition duration-base ease-spring cursor-pointer shadow-none border-none active:scale-95"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <div data-fade>
        <!-- 整体换页容器 -->
        <div ref="panelWrap" class="panel-wrap">
          <Transition
            name="panel"
            @before-leave="onBeforeLeave"
            @before-enter="onBeforeEnter"
            @after-enter="onAfterEnter"
            @after-leave="onAfterEnter"
          >
            <div :key="panelKey" class="panel">
              <!-- 桌面端双列瀑布流 -->
              <div v-if="twoCols" :ref="setListEl" class="flex items-start gap-[18px]">
                <div
                  v-for="(colPosts, ci) in columns"
                  :key="ci"
                  class="flex flex-1 min-w-0 flex-col gap-[18px]"
                >
                  <PostCard
                    v-for="post in colPosts"
                    :key="post.slug"
                    :post="post"
                  />
                </div>
              </div>

              <!-- 移动端单列 -->
              <ul v-else class="grid grid-cols-1 gap-4 list-none">
                <li v-for="post in filteredPosts" :key="post.slug">
                  <PostCard :post="post" />
                </li>
              </ul>

              <div class="mt-8 flex flex-row items-center justify-end gap-4">
                <BackLink to="/" text="← 返回首页" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* 搜索时列表整体浮现，与全站 data-fade 同款*/
.search-reveal {
  animation: search-reveal 580ms var(--ease-fade);
}

@keyframes search-reveal {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 筛选切换：旧面板向左平移出、新面板从右侧同时平移入
   裁剪只做左右，边界是列表栏本身的左右缘而不是窗口边缘；
   时长走 --dur-slow（380ms），缓动 --ease-in-out；
   方向由 --dir 控制（1=右进左出，-1 反向） */
.panel-wrap {
  position: relative;
  overflow-x: clip;
  overflow-y: visible;
}

/* 滑动过程中给栏边缘加一段渐隐过渡 */
.panel-wrap.is-sliding {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%);
}

/* 新旧两块之间留一道缝 */
.panel-wrap {
  --panel-gap: 24px;
}

.panel {
  padding-top: 2rem;
}

.tag-btn {
  position: relative;
}

.tag-btn.is-active {
  background-color: var(--accent-soft);
}

.tag-btn::before {
  content: '';
  position: absolute;
  inset: -3px -2px;
  border-radius: inherit;
}

.panel-enter-active {
  transition: transform var(--dur-slow) var(--ease-in-out);
  z-index: 1;
}

.panel-leave-active {
  transition: transform var(--dur-slow) var(--ease-in-out);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.panel-enter-from {
  transform: translateX(calc(var(--dir, 1) * (100% + var(--panel-gap))));
}

.panel-leave-to {
  transform: translateX(calc(var(--dir, 1) * -1 * (100% + var(--panel-gap))));
}
</style>
