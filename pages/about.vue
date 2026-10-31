<script setup>
import { onMounted, ref, onBeforeUnmount, useRouter, useColorMode, nextTick } from '#imports'
import gsap from 'gsap'

import { aboutConfig } from '@/siteConfig/about.js'
import { siteConfig } from '@/siteConfig/main.js'
import { useUmami } from '~/composables/useUmami'

const colorMode = useColorMode()
const { getStats } = useUmami()

usePageMeta('关于', `${siteConfig.description}`, '/about', `about,about me,自我介绍,个人简介,个人介绍,${aboutConfig.author.name}`)

function leftTagPosition(index) {
  return ['top-12 left-14','top-25 left-10','bottom-10 left-14'][index] || ''
}
function rightTagPosition(index) {
  return ['top-12 right-14','top-25 right-10','bottom-12 right-14'][index] || ''
}

const tips = aboutConfig.author.tips
const current = ref(0)

let tipsInterval = null
onMounted(() => {
  tipsInterval = setInterval(() => {
    current.value = (current.value + 1) % tips.length
  }, 1500)
})
onBeforeUnmount(() => {
  clearInterval(tipsInterval)
})

const helloAboutEl = ref(null)
const cursorEl = ref(null)
const shapeEls = ref([])
const helloTextEl = ref(null)

const colors = aboutConfig.helloCard.colors || ['#66c6ba', '#a4e5d9', '#c8f4de']
const shapesConfig = ref([])
const ringPositions = ref([])
const helloCardRings = computed(() => [
  ...shapesConfig.value.map((shape, index) => ({ shape, index })).reverse().map(({ shape, index }) =>
    `radial-gradient(circle ${shape.size / 2}px at var(--ring-x-${index}, 50%) var(--ring-y-${index}, 50%), ${shape.color} 99%, transparent 100%)`
  ),
  'var(--accent-gradient)'
].join(', '))

let mouseMoveHandler = null

function updateShapes() {
  if (!helloAboutEl.value) return
  const container = helloAboutEl.value
  const width = container.offsetWidth
  const maxSize = width / 1.5

  let size = maxSize
  const decayFactor = 0.7
  shapesConfig.value = colors.map(color => {
    const shape = { color, size }
    size *= decayFactor
    return shape
  })
  ringPositions.value = shapesConfig.value.map(() => ({ x: 0, y: 0 }))

  nextTick(() => {
    shapeEls.value = container.querySelectorAll('.shape')

    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2 - cursorEl.value.offsetWidth / 2
    const centerY = rect.height / 2 - cursorEl.value.offsetHeight / 2

    gsap.set(cursorEl.value, { x: centerX, y: centerY })
    gsap.set(shapeEls.value, { x: centerX, y: centerY })
    const textRect = helloTextEl.value.getBoundingClientRect()
    const textCenterX = textRect.width / 2
    const textCenterY = textRect.height / 2
    ringPositions.value.forEach((position, index) => {
      position.x = textCenterX
      position.y = textCenterY
      helloTextEl.value.style.setProperty(`--ring-x-${index}`, `${textCenterX}px`)
      helloTextEl.value.style.setProperty(`--ring-y-${index}`, `${textCenterY}px`)
    })
  })
}

onMounted(() => {
  updateShapes()
  window.addEventListener('resize', updateShapes)

  const container = helloAboutEl.value
  const cursor = cursorEl.value

  mouseMoveHandler = evt => {
    const rect = container.getBoundingClientRect()
    const mouseX = evt.clientX - rect.left - cursor.offsetWidth / 2
    const mouseY = evt.clientY - rect.top - cursor.offsetHeight / 2

    gsap.set(cursor, { x: mouseX, y: mouseY })
    const textRect = helloTextEl.value.getBoundingClientRect()
    const ringX = evt.clientX - textRect.left
    const ringY = evt.clientY - textRect.top
    gsap.to(shapeEls.value, {
      x: mouseX,
      y: mouseY,
      stagger: -0.1,
      overwrite: 'auto',
      ease: 'power3.out'
    })
    gsap.to(ringPositions.value, {
      x: ringX,
      y: ringY,
      stagger: -0.1,
      overwrite: 'auto',
      ease: 'power3.out',
      onUpdate: () => ringPositions.value.forEach((position, index) => {
        helloTextEl.value.style.setProperty(`--ring-x-${index}`, `${position.x}px`)
        helloTextEl.value.style.setProperty(`--ring-y-${index}`, `${position.y}px`)
      })
    })
  }

  container.addEventListener('mousemove', mouseMoveHandler)
})

onBeforeUnmount(() => {
  const container = helloAboutEl.value
  if (container && mouseMoveHandler) {
    container.removeEventListener('mousemove', mouseMoveHandler)
  }
  window.removeEventListener('resize', updateShapes)
})

const skills = aboutConfig.author.skills
const mid = Math.ceil(skills.length / 2)
const firstHalf = skills.slice(0, mid)
const secondHalf = skills.slice(mid)

const UMAMI_SHARE_URL = aboutConfig.umami.shareUrl

const { data: stats } = useAsyncData(
  'statsAll',
  async () => {
    const [today, yesterday, month, total] = await Promise.all([
      getStats('today'),
      getStats('yesterday'),
      getStats('month'),
      getStats('total'),
    ])
    return { today, yesterday, month, total }
  },
  { lazy: true, server: false }
)

const statItems = [
  { label: '今日人数', valueKey: 'visitors', source: computed(() => stats.value?.today) },
  { label: '昨日人数', valueKey: 'visitors', source: computed(() => stats.value?.yesterday) },
  { label: '本月访问', valueKey: 'pageviews', source: computed(() => stats.value?.month) },
  { label: '今日访问', valueKey: 'pageviews', source: computed(() => stats.value?.today) },
  { label: '昨日访问', valueKey: 'pageviews', source: computed(() => stats.value?.yesterday) },
  { label: '总访问量', valueKey: 'pageviews', source: computed(() => stats.value?.total) },
]

const getValue = (stat) => {
  const raw = stat?.source?.value
  if (!raw) return ''
  const val = raw[stat.valueKey]
  if (val === undefined || val === null) return ''

  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'
  }
  if (val >= 10000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1) + 'k'
  }
  return val
}

const isLoaded = (stat) => {
  const raw = stat?.source?.value
  if (!raw) return false
  const val = raw[stat.valueKey]
  return val !== undefined && val !== null
}

const hoverHero = ref(null)
const hoveredIndex = ref(null)
</script>

<template>
  <main v-fade-in class="mt-17 md:mt-15">
    <div class="relative flex justify-center items-center transition-colors duration-base">
      <!-- 左侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.left"
          :key="'left-' + i"
          class="author-tag absolute rounded-full bg-surface-2 py-1 px-2 shadow transition-colors duration-base"
          :class="leftTagPosition(i)"
        >
        <span class="mb-1 mr-1">{{ tag }}</span>
        </span>
      </div>
      <!-- 中间头像 -->
      <div data-fade class="w-35 h-35 md:w-40 md:h-40 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <img
          :src="siteConfig.author.avatar"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover transition-transform duration-base md:hover:rotate-360 fade-in-image"
          draggable="false"
          loading="lazy"
        />
      </div>
      <!-- 右侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.right"
          :key="'right-' + i"
          class="author-tag absolute rounded-full bg-surface-2 py-1 px-2 shadow transition-colors duration-base"
          :class="rightTagPosition(i)"
        >
        <span class="mb-1 ml-1">{{ tag }}</span>
        </span>
      </div>
    </div>

    <h1 data-fade class="text-3xl flex justify-center mt-5 md:mt--5">
      <span class="text-gradient">关于我</span>
    </h1>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <div class="card-base flex-1 md:flex-[3_3_0%] bg-surface transition-colors duration-base
                  p-5 min-w-full md:min-w-[300px] flex flex-col justify-center gap-2 -z-20"
      >
        <div class="text-sm opacity-90">Hi，很高兴认识你！<span class="text-xl">👋</span></div>
        <h2 class="text-3xl font-bold">我叫
          <span class="text-gradient">{{ aboutConfig.author.name }}</span>
        </h2>
        <div class="text-sm opacity-90">{{ aboutConfig.author.description }}</div>
      </div>
      <div class="card-base flex-1 md:flex-[2_2_0%] bg-surface p-5
                  min-w-full md:min-w-[200px] relative transition-colors duration-base"
      >
        <div class="text-xs absolute text-ink-subtle">追求</div>
        <h2 class="text-3xl font-bold mt-5">
          源于<br>
          热爱而去 感受<br>
          <div class="mask relative inline-block overflow-hidden mt-2 mb--4" style="height:3rem">
            <transition name="slide" mode="out-in">
              <div
                :key="current"
                :style="{ color: tips[current].color }"
                class="text-3xl font-bold"
              >
                {{ tips[current].text }}
              </div>
            </transition>
          </div>
        </h2>
      </div>
    </div>
    <!-- 欢迎卡片 -->
    <div data-fade ref="helloAboutEl" class="hidden md:block card-base bg-surface relative overflow-hidden select-none auto [isolation:isolate]">
      <!-- 小圆点 -->
      <div ref="cursorEl" class="absolute w-5 h-5 rounded-full bg-accent pointer-events-none z-30"></div>
      <!-- 圆形 -->
      <div class="relative w-full h-[245px] overflow-hidden">
        <div
          v-for="(shape, index) in shapesConfig"
          :key="index"
          class="shape absolute hidden rounded-full dark:block"
          :style="{
            width: shape.size + 'px',
            height: shape.size + 'px',
            margin: (-shape.size / 2) + 'px 0 0 ' + (-shape.size / 2) + 'px',
            background: shape.color
          }"
          ref="shapeEls"
        ></div>
      </div>
      <!-- 内容 -->
      <div class="absolute top-0 left-0 w-full h-[250px] flex justify-center items-center bg-transparent dark:bg-accent-soft dark:mix-blend-screen transition-colors duration-base">
        <h2 ref="helloTextEl" :style="{ '--hello-card-rings': helloCardRings }" class="hello-card-text text-10vw 2xl:text-35 text-gradient dark:text-white relative z-10 flex items-center justify-center">{{ aboutConfig.helloCard.text }}</h2>
      </div>
    </div>

    <div data-fade class="flex flex-col md:flex-row gap-4 w-full mx-auto m-5">
      <!-- 技能 -->
      <div class="card-base flex-1 md:flex-[11_11_0%] overflow-hidden bg-surface min-w-full md:min-w-[200px] relative transition-colors duration-base">
        <div class="text-xs absolute text-ink-subtle p-5">技能</div>
        <h2 class="text-3xl font-bold mt-5 p-5">开启创造力</h2>

        <!-- 第一行 -->
        <div class="skill-row-wrapper mt-2">
          <div class="skill-row">
            <div v-for="(skill, i) in firstHalf" :key="'row1-' + i" class="skill-item" :style="{ backgroundColor: skill.color }">
              <img :src="skill.icon" class="w-12 h-12 object-contain fade-in-image" draggable="false" loading="lazy" />
            </div>
            <div v-for="(skill, i) in firstHalf" :key="'row1-copy-' + i" class="skill-item" :style="{ backgroundColor: skill.color }">
              <img :src="skill.icon" class="w-12 h-12 object-contain fade-in-image" draggable="false" loading="lazy" />
            </div>
          </div>
        </div>

        <!-- 第二行反向滚动 -->
        <div class="skill-row-wrapper mt-4 mb-6">
          <div class="skill-row skill-row-reverse">
            <div v-for="(skill, i) in secondHalf" :key="'row2-' + i" class="skill-item" :style="{ backgroundColor: skill.color }">
              <img :src="skill.icon" class="w-12 h-12 object-contain fade-in-image" draggable="false" loading="lazy" />
            </div>
            <div v-for="(skill, i) in secondHalf" :key="'row2-copy-' + i" class="skill-item" :style="{ backgroundColor: skill.color }">
              <img :src="skill.icon" class="w-12 h-12 object-contain fade-in-image" draggable="false" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      <!-- 偏好 -->
      <div
        class="card-base flex-1 md:flex-[10_10_0%] p-5 bg-cover min-w-full md:min-w-[200px] relative transition-colors duration-base"
        :style="{ backgroundImage: `url(${aboutConfig.author.preference.img})` }"
      >
        <div class="text-xs absolute text-ink-subtle">关注偏好</div>
        <h2 class="text-3xl font-bold mt-5 text-white">{{ aboutConfig.author.preference.category }}</h2>
        <p class="text-white/90 mt-50">{{ aboutConfig.author.preference.description }}</p>
      </div>
    </div>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <!-- 访问统计 -->
      <div
        class="card-base flex-1 md:flex-[2_2_0%] p-5 min-w-full md:min-w-200px h-300px relative text-white overflow-hidden transition-colors duration-base"
        :style="{ background: `url(${aboutConfig.umami.cover}) top / cover no-repeat` }"
      >
        <!-- 蒙版层 -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c1c2c]/90 to-transparent z-0"></div>
        <div class="relative z-10">
          <div class="text-xs text-gray-300">数据</div>
          <h2 class="text-3xl font-bold mt-1 text-white">访问统计</h2>
          <!-- 统计信息 -->
          <div class="grid grid-cols-3 text-2xl mt-8 mb-5 gap-y-4">
            <div v-for="stat in statItems" :key="stat.label">
              <div class="text-sm text-gray-300">{{ stat.label }}</div>
              <div class="font-extrabold h-10 relative overflow-hidden">
                <span class="opacity-0 select-none">0000</span>
                <div
                  class="absolute left-0 top-1/2 -translate-y-1/2 rounded w-16 h-6 transition-opacity duration-base skeleton skeleton-on-dark"
                  :class="{ 'opacity-100': !isLoaded(stat), 'opacity-0': isLoaded(stat) }"
                ></div>
                <span
                  class="absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-base"
                  :class="{ 'opacity-0': !isLoaded(stat), 'opacity-100': isLoaded(stat) }"
                >
                  {{ getValue(stat) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 来源信息 -->
          <p class="text-sm text-white/50">
            统计信息来自 
            <a :href="UMAMI_SHARE_URL" target="_blank" rel="noopener nofollow"
              class="text-sm text-white/50 underline hover:text-white transition-colors duration-base">
              Umami
            </a>
          </p>

          <!-- 底部跳转 -->
          <div class="absolute right-0 -bottom-1 text-white rounded-full bg-white/20 hover:bg-white/30 px-2 py-1 transition-colors duration-base">
            <NuxtLink to="/posts" class="no-underline flex items-center">
              <AppIcon name="circle-arrow-right" class="color-white" />
              <span class="text-white ml-1">文章列表</span>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col flex-1 md:flex-[3_3_0%] gap-4">
        <div class="card-base h-1/3 flex items-center justify-between w-full text-sm bg-surface p-5 md:p-8
                    min-h-25 min-w-full md:min-w-[200px] relative transition-colors duration-base"
        >
          <div class="flex flex-col">
            <span class="text-ink-subtle">生于</span>
            <span class="text-xl lg:text-3xl text-#ff9a00 font-bold">{{ aboutConfig.author.birthday }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-ink-subtle">就读学校</span>
            <span class="text-xl lg:text-3xl text-#f07b3f font-bold">{{ aboutConfig.author.school }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-ink-subtle">现在是</span>
            <span class="text-xl lg:text-3xl text-#ea5455 font-bold">{{ aboutConfig.author.work }}</span>
          </div>
        </div>
        <div class="card-base h-2/3 flex justify-between bg-surface p-5
                    min-h-200px md:min-h-0 min-w-full md:min-w-200px relative transition-colors duration-base
                    group"
        >
          <div class="text-xs absolute text-ink-subtle">性格</div>
          <h2 class="text-2xl font-bold mt-5">{{ aboutConfig.author.personality.name }}<br/><span class="text-#e4ae3a text-4xl">{{ aboutConfig.author.personality.code }}</span></h2>
          <div class="absolute bottom-4 text-sm text-#999999">
            在 
            <a class="text-#999999 underline hover:text-ink dark:hover:text-white transition-colors duration-base" :href="aboutConfig.author.personality.learnMore" target="_blank" rel="noopener nofollow">16personalities</a>
            上了解更多
          </div>
          <div class="absolute justify-center right-0 md:top-3 transition-transform duration-800 group-hover:-rotate-8">
            <img :src="aboutConfig.author.personality.img" width="160" height="160" class="fade-in-image" loading="lazy" />
          </div>
        </div>
      </div>
    </div>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <div class="card-base flex-1 md:flex-[3_3_0%] bg-surface p-5
                  min-w-full md:min-w-[200px] relative transition-colors duration-base"
      >
        <div class="text-xs absolute text-ink-subtle">特长</div>
        <h2 class="text-2xl sm:text-3xl font-bold mt-5">
          <span class="text-#aa96da dark:text-#ffe2e2 transition-colors duration-base">脑回路新奇的 酸菜鱼</span>
          <br/>
          <span class="mt-3 transition-colors duration-base opacity-70 dark:opacity-100">行动力指数<span class="ml-3 inline-block animate-MAX">MAX</span></span>
        </h2>
      </div>
      <div class="card-base flex-1 md:flex-[2_2_0%] bg-surface p-5
                  min-w-full md:min-w-[200px] relative transition-colors duration-base overflow-hidden group"
      >
        <div class="text-xs absolute text-ink-subtle">座右铭</div>
        <h2 class="text-3xl font-bold mt-5">
          <span>往日不悔，</span>
          <br/>
          <span class="mt-3 opacity-70">未来可期。</span>
        </h2>
        <AppIcon name="dice" class="text-9xl opacity-10
                  absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3
                  transition-transform duration-10000 group-hover:rotate-360" />
      </div>
    </div>

    <div data-fade class="flex flex-wrap md:flex-row gap-4 w-full mx-auto m-5">
      <!-- 番剧 -->
      <div class="card-base flex-1 md:flex-[2_2_0%] p-5 min-w-full md:min-w-300px min-h-300px relative transition-colors duration-base overflow-hidden">
        <div class="absolute left-5 top-5 text-xs text-gray-300 pointer-events-none z-20" style="text-shadow: 0px 0px 5px rgba(0,0,0,1);">番剧</div>
        <h2 class="absolute left-5 top-10 text-3xl font-bold text-white pointer-events-none z-20" style="text-shadow: 0px 0px 5px rgba(0,0,0,1);">爱好番剧</h2>

        <div class="absolute inset-0 -m-5 z-10">
          <div class="absolute inset-0 flex w-[120%] left-1/2 -translate-x-1/2">
            <a
              v-for="(anime, index) in aboutConfig.author.animes"
              :key="index"
              :href="anime.href"
              :title="anime.name"
              target="_blank"
              rel="external nofollow noreferrer"
              class="relative flex-none h-full overflow-hidden transition-all duration-800 ease-out skew-x-[-10deg] cursor-pointer"
              :style="{
                width:
                  aboutConfig.author.animes.length <= 1
                    ? '100%'
                    : (hoveredIndex === null
                        ? (100 / aboutConfig.author.animes.length)
                        : (hoveredIndex === index ? 46 : (100 - 46) / (aboutConfig.author.animes.length - 1)
                      )) + '%'
              }"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
            >
              <div
                class="absolute inset-0 transition-transform duration-800 ease-out"
                :class="hoveredIndex === index ? 'scale-125' : 'scale-115'"
                :style="{
                  background:
                    colorMode.value === 'dark'
                      ? `linear-gradient(rgba(0,0,0,0.15)), url(${anime.img}) center / cover no-repeat`
                      : `url(${anime.img}) center / cover no-repeat`
                }"
              ></div>
            </a>
          </div>
        </div>
      </div>
      <!-- 游戏 -->
      <div 
        class="card-base flex-1 md:flex-[3_3_0%] p-5 min-w-full md:min-w-200px relative text-white overflow-hidden transition-colors duration-base"
        :style="{ background: `url(${aboutConfig.author.game.img}) top / cover no-repeat` }"
      >
        <div class="absolute inset-0 z-0 hidden dark:block bg-gradient-to-t from-#000/99 to-#000/0"></div>
        <div class="absolute inset-0 z-0 block dark:hidden bg-gradient-to-t from-#000/50 to-#000/0"></div>
        <div class="relative z-10">
          <div class="text-xs text-gray-300" style="text-shadow: 0px 0px 5px rgba(0,0,0,1);">爱好游戏</div>
          <h2 class="text-4xl font-bold mt-1 mb-50" style="text-shadow: 0px 0px 5px rgba(0,0,0,1);">{{ aboutConfig.author.game.name }}</h2>
        </div>
        <div class="absolute right-5 bottom-5 text-base text-white/90 z-10" >
          {{ aboutConfig.author.game.id }}
        </div>
        <div class="absolute left-5 bottom-5 flex -space-x-3 z-10">
          <div
            v-for="(hero, idx) in aboutConfig.author.game.heroes"
            :key="idx"
            class="relative"
            @mouseenter="hoverHero = hero.name"
            @mouseleave="hoverHero = null"
            :style="{ zIndex: hoverHero === hero.name ? aboutConfig.author.game.heroes.length + 1 : idx }"
          >
            <img
              :src="hero.img"
              :alt="hero.name"
              :style="{
                border: '2px solid rgba(255,0,0,0.4)',
                borderRadius: '9999px',
                opacity: hoverHero === hero.name ? 1 : (hoverHero ? 0.3 : 1)
              }"
              class="w-10 h-10 object-cover transition-all duration-base fade-in-image hero-icon"
              loading="lazy"
            />
            <transition
              name="fade"
              enter-active-class="transition-opacity duration-base"
              leave-active-class="transition-opacity duration-base"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="hoverHero === hero.name"
                class="absolute bottom-full left-1/2 -translate-x-1/3 mb-1 ml-5 px-2 py-1 text-ink text-xs bg-white/90 rounded whitespace-nowrap z-50"
              >
                擅长英雄：{{ hero.name }}
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 标签动画 */
.author-tag {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

.author-tag:nth-child(1) { animation-delay: 0s; }
.author-tag:nth-child(2) { animation-delay: 0.5s; }
.author-tag:nth-child(3) { animation-delay: 1s; }
.author-tag:nth-child(4) { animation-delay: 1.5s; }
.author-tag:nth-child(5) { animation-delay: 2s; }
.author-tag:nth-child(6) { animation-delay: 2.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* tips动画 */
.slide-enter-from { transform: translateY(100%); opacity:0; }
.slide-enter-to   { transform: translateY(0%);   opacity:1; }
.slide-leave-from { transform: translateY(0%);   opacity:1; }
.slide-leave-to   { transform: translateY(-100%); opacity:0; }
.slide-enter-active,
.slide-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }

.hello-card-text {
  background-image: var(--hello-card-rings);
}

:global(html.dark) .hello-card-text {
  background-image: none;
  background-clip: border-box;
  -webkit-background-clip: border-box;
  color: white;
  -webkit-text-fill-color: white;
}

/* 技能卡片动画 */
.skill-row-wrapper {
  overflow: hidden;
  width: 100%;
}

.skill-row {
  padding: 1px;
  display: flex;
  gap: 12px;
  width: max-content;
  animation: scroll-left 30s linear infinite;
  will-change: transform;
}

.skill-row-reverse {
  animation: scroll-right 30s linear infinite;
}

.skill-item {
  flex: 0 0 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  box-shadow: 0 0 2px rgba(0,0,0,0.2);
}

@keyframes scroll-left {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scroll-right {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

@media (max-width: 768px) {
  .skill-row, .skill-row-reverse {
    animation-duration: 60s;
  }
}

/* MAX动画 */
@keyframes MAX {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.2); }
  50%  { transform: scale(1); }
  100% { transform: scale(1); }
}

.animate-MAX {
  animation: MAX 2s infinite;
  transform-origin: center;
  animation-timing-function: ease-in-out;
}
</style>