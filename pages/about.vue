<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

import { aboutConfig } from '@/siteConfig/about.js'
import { siteConfig } from '@/siteConfig/main.js'

// 标签位置
function leftTagPosition(index) {
  return ['top-12 left-14','top-25 left-10','bottom-10 left-14'][index] || ''
}
function rightTagPosition(index) {
  return ['top-12 right-14','top-25 right-10','bottom-12 right-14'][index] || ''
}

// tips切换动画
const tips = aboutConfig.author.tips
const current = ref(0)

onMounted(() => {
  setInterval(() => {
    current.value = (current.value + 1) % tips.length
  }, 2000)
})

// 欢迎卡片
const helloAboutEl = ref(null)
const cursorEl = ref(null)
const shapeEls = ref([])

const colors = aboutConfig.helloCard.colors || ['#66c6ba', '#a4e5d9', '#c8f4de']
const shapesConfig = ref([])

let mouseMoveHandler = null

//动态计算圆圈直径
function updateShapes() {
  if (!helloAboutEl.value) return
  const container = helloAboutEl.value
  const width = container.offsetWidth
  const maxSize = width / 1.5

  // 按比例递减
  let size = maxSize
  const decayFactor = 0.7
  shapesConfig.value = colors.map(color => {
    const shape = { color, size }
    size *= decayFactor
    return shape
  })

  nextTick(() => {
    shapeEls.value = container.querySelectorAll('.shape')

    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2 - cursorEl.value.offsetWidth / 2
    const centerY = rect.height / 2 - cursorEl.value.offsetHeight / 2

    // 初始化位置
    gsap.set(cursorEl.value, { x: centerX, y: centerY })
    gsap.set(shapeEls.value, { x: centerX, y: centerY })
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
    gsap.to(shapeEls.value, {
      x: mouseX,
      y: mouseY,
      stagger: -0.1,
      overwrite: 'auto',
      ease: 'power3.out'
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

// 技能
const skills = aboutConfig.author.skills
const mid = Math.ceil(skills.length / 2)
const firstHalf = skills.slice(0, mid)
const secondHalf = skills.slice(mid)

// 访问数据
const cover = aboutConfig.umami.cover
// 配置
const UMAMI_URL = aboutConfig.umami.url
const UMAMI_SHARE_URL =  aboutConfig.umami.shareUrl
const WEBSITE_ID = aboutConfig.umami.siteId
const TOKEN = aboutConfig.umami.token
const CREATED_AT = aboutConfig.umami.createTime

// 缓存相关
function getDayTimestamps(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
}

const statsToday = ref(null)
const statsYesterday = ref(null)
const statsTotal = ref(null)
const error = ref(null)

const CACHE_KEY = 'umami_stats'
const CACHE_DURATION = aboutConfig.cacheDuration || 10 * 60 * 1000

// 获取统计数据
async function fetchStats() {
  const now = Date.now()
  let cached = null

  try {
    cached = JSON.parse(localStorage.getItem(CACHE_KEY))
  } catch (e) {
    cached = null
  }

  if (cached && now - Number(cached.timestamp) < CACHE_DURATION) {
    statsToday.value = cached.statsToday
    statsYesterday.value = cached.statsYesterday
    statsTotal.value = cached.statsTotal
    return
  }

  try {
    const createdAtTs = new Date(CREATED_AT).getTime()

    // 今日
    const { start: startToday, end: endToday } = getDayTimestamps()
    const todayData = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startToday}&endAt=${endToday}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json())

    // 昨日
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const { start: startYesterday, end: endYesterday } = getDayTimestamps(yesterday)
    const yesterdayData = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startYesterday}&endAt=${endYesterday}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json())

    // 总量
    const totalData = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${createdAtTs}&endAt=${now}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json())

    statsToday.value = todayData
    statsYesterday.value = yesterdayData
    statsTotal.value = totalData
    error.value = null

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      statsToday: todayData,
      statsYesterday: yesterdayData,
      statsTotal: totalData,
      timestamp: now,
    }))
  } catch (e) {
    console.error('API fetch error:', e)
    error.value = e.message
  }
}

onMounted(async () => {
  try {
    await fetchStats()
  } catch (e) {
    console.error('fetchStats error:', e)
  }
})
</script>

<template>
  <main v-fade-in class="mt-17 md:mt-15">
    <div class="relative flex justify-center items-center transition-colors duration-300">
      <!-- 左侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.left"
          :key="'left-' + i"
          class="author-tag absolute rounded-full bg-white dark:bg-white/15 py-1 px-2 shadow transition-colors duration-300"
          :class="leftTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
      <!-- 中间头像 -->
      <div data-fade class="w-35 h-35 md:w-40 md:h-40 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <img
          :src="siteConfig.author.avatar"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover transition-transform duration-300 md:hover:rotate-360"
          draggable="false"
        />
      </div>
      <!-- 右侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.right"
          :key="'right-' + i"
          class="author-tag absolute rounded-full bg-white dark:bg-white/15 py-1 px-2 shadow transition-colors duration-300"
          :class="rightTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <h1 data-fade class="text-3xl flex justify-center mt-5 md:mt--5">
      <span class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient">
        关于我
        <span class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/40 to-#00e2d8/40 dark:hidden transition-colors duration-300"></span>
      </span>
    </h1>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <div class="flex-1 md:flex-[3_3_0%] bg-white dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] transition-colors duration-300
                  p-5 rounded-2xl min-w-full md:min-w-[300px] flex flex-col justify-center gap-2 -z-20"
      >
        <div class="text-sm opacity-90">Hi，很高兴认识你！<span class="text-xl">👋</span></div>
        <h2 class="text-3xl font-bold">我叫
          <span class="relative inline-block">
            <span class="dark:text-gradient">
              {{ aboutConfig.author.name }}
              <span class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/40 to-#00e2d8/40 dark:hidden transition-colors duration-300"></span>
            </span>
          </span>
        </h2>
        <div class="text-sm opacity-90">{{ aboutConfig.author.description }}</div>
      </div>
      <div class="flex-1 md:flex-[2_2_0%] bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)]
                  min-w-full md:min-w-[200px] relative transition-colors duration-300"
      >
        <div class="text-xs absolute text-gray-400">追求</div>
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
    <div data-fade ref="helloAboutEl" class="hidden md:block relative overflow-hidden select-none rounded-2xl auto shadow-[0_0_2px_rgba(0,0,0,0.2)]">
      <!-- 小圆点 -->
      <div ref="cursorEl" class="absolute w-5 h-5 rounded-full bg-#70a1d7 pointer-events-none z-10"></div>
      <!-- 圆形 -->
      <div class="relative w-full h-[245px] overflow-hidden">
        <div
          v-for="(shape, index) in shapesConfig"
          :key="index"
          class="shape absolute rounded-full"
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
      <div class="absolute top-0 left-0 w-full h-[250px] flex justify-center items-center bg-white mix-blend-screen dark:bg-#649dad transition-colors duration-300">
        <h2 class="text-10vw 2xl:text-35 text-#649dad dark:text-white flex items-center justify-center transition-colors duration-300">{{ aboutConfig.helloCard.text }}</h2>
      </div>
    </div>

    <div data-fade class="flex flex-col md:flex-row gap-4 w-full mx-auto m-5">
      <!-- 技能 -->
      <div class="flex-1 md:w-1/2 overflow-hidden bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)]
                  min-w-full md:min-w-[200px] relative transition-colors duration-300"
      >
        <div class="text-xs absolute text-gray-400">技能</div>
        <h2 class="text-3xl font-bold mt-5">开启创造力</h2>
        <!-- 第一行图标流 -->
        <div class="flex gap-3 animate-scroll-left whitespace-nowrap mt-8">
          <div
            v-for="(skill, i) in firstHalf"
            :key="'row1-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
          <div
            v-for="(skill, i) in firstHalf"
            :key="'row1-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
          <div
            v-for="(skill, i) in firstHalf"
            :key="'row1-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
          <div
            v-for="(skill, i) in firstHalf"
            :key="'row1-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
        </div>
        <!-- 第二行图标流，反向滚动 -->
        <div class="flex gap-3 animate-scroll-right whitespace-nowrap mt-4">
          <div
            v-for="(skill, i) in secondHalf"
            :key="'row2-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
          <div
            v-for="(skill, i) in secondHalf"
            :key="'row2-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
          <div
            v-for="(skill, i) in secondHalf"
            :key="'row2-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
          <div
            v-for="(skill, i) in secondHalf"
            :key="'row2-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" draggable="false" />
          </div>
        </div>
      </div>
      <!-- 偏好 -->
      <div
        class="flex-1 md:w-1/2 p-5 rounded-2xl bg-cover min-w-full md:min-w-[200px] relative transition-colors duration-300"
        :style="{ backgroundImage: `url(${aboutConfig.author.preference.img})` }"
      >
        <div class="text-xs absolute text-gray-300">关注偏好</div>
        <h2 class="text-3xl font-bold mt-5 text-white">{{ aboutConfig.author.preference.category }}</h2>
        <p class="text-white/90 mt-50">{{ aboutConfig.author.preference.description }}</p>
      </div>
    </div>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <!-- 访问统计 -->
      <div 
        class="flex-1 md:flex-[2_2_0%] p-5 rounded-2xl min-w-full md:min-w-[200px] relative text-white overflow-hidden transition-colors duration-300"
        :style="{ background: `url(${cover}) top / cover no-repeat` }"
      >
        <!-- 蒙版层 -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c1c2c]/90 to-transparent z-0"></div>
        <div class="relative z-10">
          <div class="text-xs text-gray-300">数据</div>
          <h2 class="text-3xl font-bold mt-1 text-white">访问统计</h2>

          <!-- 统计信息 -->
          <div class="grid grid-cols-3 text-2xl mt-8 mb-8">
            <!-- 今日人数 -->
            <div>
              <div class="text-sm text-gray-300">今日人数</div>
              <div class="font-extrabold h-10">
                <template v-if="statsToday">
                  {{ statsToday.visitors.value }}
                </template>
                <template v-else>
                  <div class="bg-gray-700 rounded animate-pulse w-16 h-6 mt-2"></div>
                </template>
              </div>
            </div>
            <!-- 昨日人数 -->
            <div>
              <div class="text-sm text-gray-300">昨日人数</div>
              <div class="font-extrabold h-10">
                <template v-if="statsYesterday">
                  {{ statsYesterday.visitors.value }}
                </template>
                <template v-else>
                  <div class="bg-gray-700 rounded animate-pulse w-16 h-6 mt-2"></div>
                </template>
              </div>
            </div>
            <!-- 本月访问 -->
            <div>
              <div class="text-sm text-gray-300">本月访问</div>
              <div class="font-extrabold h-10">
                <template v-if="statsTotal">
                  {{ statsTotal.pageviews.value }}
                </template>
                <template v-else>
                  <div class="bg-gray-700 rounded animate-pulse w-20 h-6 mt-2"></div>
                </template>
              </div>
            </div>
            <!-- 今日访问 -->
            <div>
              <div class="text-sm text-gray-300">今日访问</div>
              <div class="font-extrabold h-10">
                <template v-if="statsToday">
                  {{ statsToday.pageviews.value }}
                </template>
                <template v-else>
                  <div class="bg-gray-700 rounded animate-pulse w-16 h-6 mt-2"></div>
                </template>
              </div>
            </div>
            <!-- 昨日访问 -->
            <div>
              <div class="text-sm text-gray-300">昨日访问</div>
              <div class="font-extrabold h-10">
                <template v-if="statsYesterday">
                  {{ statsYesterday.pageviews.value }}
                </template>
                <template v-else>
                  <div class="bg-gray-700 rounded animate-pulse w-16 h-6 mt-2"></div>
                </template>
              </div>
            </div>
            <!-- 总访问量 -->
            <div>
              <div class="text-sm text-gray-300">总访问量</div>
              <div class="font-extrabold h-10">
                <template v-if="statsTotal">
                  {{ statsTotal.pageviews.value }}
                </template>
                <template v-else>
                  <div class="bg-gray-700 rounded animate-pulse w-20 h-6 mt-2"></div>
                </template>
              </div>
            </div>
          </div>
          <div>
            <p class="text-sm text-white/50">统计信息来自 
              <a :href=UMAMI_SHARE_URL target="_blank" rel="noopener nofollow" class="text-sm text-white/50 no-underline hover:text-white transition-colors duration-200">Umami</a>
            </p>
          </div>
          <div class="absolute right-0 bottom-1 text-white rounded-full bg-white/20 hover:bg-white/30 px-2 py-1 transition-colors duration-300">
            <NuxtLink to="/posts" class="no-underline">
              <i class="color-white iconfont icon-ans-icon-arrow-circle-right"></i>
              <span class="text-white ml-2">文章列表</span>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col flex-1 md:flex-[3_3_0%] gap-4">
        <div class="h-1/3 flex items-center justify-between w-full text-sm bg-white dark:bg-white/10 p-5 md:p-8 rounded-2xl 
                    shadow-[0_0_2px_rgba(0,0,0,0.2)] min-h-25 min-w-full md:min-w-[200px] relative transition-colors duration-300"
        >
          <div class="flex flex-col">
            <span class="text-gray-400">生于</span>
            <span class="text-xl lg:text-3xl text-#ff9a00 font-bold">{{ aboutConfig.author.birthday }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400">就读学校</span>
            <span class="text-xl lg:text-3xl text-#f07b3f font-bold">{{ aboutConfig.author.school }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400">现在是</span>
            <span class="text-xl lg:text-3xl text-#ea5455 font-bold">{{ aboutConfig.author.work }}</span>
          </div>
        </div>
        <div class="h-2/3 flex justify-between bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)] min-h-200px md:min-h-0 min-w-full md:min-w-200px relative transition-colors duration-300">
          <div class="text-xs absolute text-gray-400">性格</div>
          <h2 class="text-2xl font-bold mt-5">{{ aboutConfig.author.personality.name }}<br/><span class="text-#e4ae3a text-4xl">{{ aboutConfig.author.personality.code }}</span></h2>
          <div class="absolute bottom-4 text-sm text-#999999">在 <a class="text-#999999 no-underline hover:text-white transition-colors duration-200" href="https://www.16personalities.com/" target="_blank" rel="noopener nofollow">16personalities</a> 上了解更多</div>
          <div class="absolute justify-center right-0 md:top-3 transition-transform duration-800 hover:-rotate-8">
            <img :src="aboutConfig.author.personality.img" />
          </div>
        </div>
      </div>
    </div>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <div class="flex-1 md:flex-[3_3_0%] bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)]
                  min-w-full md:min-w-[200px] relative transition-colors duration-300"
      >
        <div class="text-xs absolute text-gray-400">特长</div>
          <h2 class="text-2xl sm:text-3xl font-bold mt-5">
            <span class="text-#aa96da dark:text-#ffe2e2 transition-colors duration-300">脑回路新奇的 酸菜鱼</span>
            <br/>
            <span class="mt-3 text-#aa96da/60 dark:text-white transition-colors duration-300">行动力指数<span class="ml-3 inline-block animate-MAX">MAX</span></span>
          </h2>
      </div>
      <div class="flex-1 md:flex-[2_2_0%] bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)]
                  min-w-full md:min-w-[200px] relative transition-colors duration-300 overflow-hidden group"
      >
        <div class="text-xs absolute text-gray-400">座右铭</div>
        <h2 class="text-3xl font-bold mt-5">
          <span>往日不悔，</span>
          <br/>
          <span class="mt-3 opacity-70">未来可期。</span>
        </h2>
        <i class="iconfont icon-dice-d text-9xl opacity-10 
                  absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3
                  transition-transform duration-20000 group-hover:rotate-360">
        </i>
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

/* 技能卡片动画 */
@keyframes scroll-left {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes scroll-right {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.animate-scroll-left {
  animation: scroll-left 30s linear infinite;
}
.animate-scroll-right {
  animation: scroll-right 30s linear infinite;
}

/* MAX动画 */
@keyframes MAX {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.2); }
  50%  { transform: scale(1); }
  100% { transform: scale(1); }
}

.animate-MAX {
  animation: MAX 1s infinite;
  transform-origin: center;
  animation-timing-function: ease-in-out;
}
</style>