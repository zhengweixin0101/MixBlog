<script setup>
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

const props = defineProps({
  talk: { type: Object, required: true },
  // 已播完一次 fade-in 的卡片：重建/归位时直接终态渲染，不重播入场动画
  settled: { type: Boolean, default: false },
  // 入场动画序位（data-fade 数字，发布会按它排进度）；0 表示不参与全局交错浮现
  fadeRank: { type: Number, default: 0 }
})

const emit = defineEmits(['fade-done'])

function onAnimationEnd(event) {
  if (event.target !== event.currentTarget || event.animationName !== 'fade-in') return
  emit('fade-done')
}

dayjs.extend(utc)
dayjs.extend(timezone)
const formatDate = (date) => dayjs(date).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm')

// 转义 HTML 防止 XSS
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getImgBlocks(talk) {
  if (!talk.content) return []
  const matches = [...talk.content.matchAll(/<talkImg>(.*?)<\/talkImg>/g)]
  return matches.map(match => {
    const alt = match[1]
    const imgObj = talk.imgs.find(i => i.alt === alt)
    return imgObj || { url: '', alt }
  })
}

function renderContent(talk) {
  let html = talk.content

  // 图片/链接占位标签由 getImgBlocks / talk.links 单独渲染，正文里要移除
  html = html.replace(/\n*<talkImg>.*?<\/talkImg>/g, '')
  html = html.replace(/\n*<talkLink>.*?<\/talkLink>/g, '')

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    lang = lang || 'text';
    return `<pre class="my-1 bg-surface-4 border border-line rounded-lg p-3 text-sm font-mono text-ink overflow-x-auto" style="white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;"><code>${escapeHtml(code)}</code></pre>`
  })

  // 任务列表 整块匹配连续的 `- [ ] / - [x]` 行，转成禁用的 checkbox
  let taskIdCounter = 1;
  html = html.replace(
    /((?:- \[(?: |x)\] .+\n?)+)/g,
    (match) => {
      const items = match.trim().split('\n').map(line => {
        const [, status, task] = /- \[( |x)\] (.+)/.exec(line)
        const checked = status === 'x' ? 'checked' : ''
        const id = `task-${talk.id}-${taskIdCounter++}`
        return `<li class="flex items-center gap-1"><label for="${id}" class="leading-snug flex items-center"><input id="${id}" type="checkbox" class="custom-checkbox mr-1 mt-0.5" disabled ${checked} /><span ${checked ? 'class="line-through opacity-70"' : ''}>${task}</span></label></li>`
      }).join('')
      return `<ul class="list-none my-1">${items}</ul>`
    }
  )

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>')

  return html
}
</script>

<template>
  <article
    v-bind="fadeRank > 0 ? { 'data-fade': String(fadeRank) } : null"
    :data-post-id="talk.id"
    class="card-base bg-surface transition-colors duration-base"
    :class="settled && 'fade-settled'"
    @animationend="onAnimationEnd"
  >
    <div class="p-4">
      <div class="text-ink text-base whitespace-pre-line leading-relaxed">
        <!-- 内容 -->
        <span v-html="renderContent(talk)"></span>

        <div v-if="talk.location?.length || talk.links?.length" class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted transition-colors duration-base">
          <span v-if="talk.location?.length" class="flex items-center">
            <AppIcon name="map-pin" /><span class="ml-1">{{ talk.location }}</span>
          </span>
          <a
            v-for="(link, idx) in talk.links"
            :key="idx"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="flex items-center px-2 py-1 rounded-full bg-surface-4 text-accent-text no-underline transition-opacity duration-base hover:opacity-70 [will-change:opacity]"
          >
            <AppIcon name="link" class="text-12px" /><span class="ml-1">{{ link.text }}</span>
          </a>
        </div>

        <!-- 图片 -->
        <div v-if="talk.imgs?.length" class="flex flex-wrap gap-4 mt-3">
          <a
            v-for="(img, idx) in getImgBlocks(talk)"
            :key="idx"
            :href="img.url"
            :data-fancybox="`gallery-${talk.id}`"
          >
            <img
              :src="img.url"
              :alt="img.alt"
              class="w-16 h-16 object-cover rounded-lg cursor-pointer shadow-[0_0_8px_0_rgba(0,0,0,0.2)] fade-in-image"
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      </div>

      <!-- 底栏 -->
      <div class="mt-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-dashed border-line pt-2.5 text-sm text-ink-subtle">
        <time :datetime="talk.created_at || null">{{ formatDate(talk.created_at) }}</time>

        <span v-if="talk.tags?.length" class="flex flex-wrap gap-x-2.5 gap-y-1 text-xs">
          <span
            v-for="(tag, idx) in talk.tags"
            :key="idx"
            class="text-ink-subtle"
          >
            #{{ tag }}
          </span>
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.fade-settled[data-fade] {
  animation: none;
  opacity: 1;
  transform: none;
  visibility: visible;
}
</style>
