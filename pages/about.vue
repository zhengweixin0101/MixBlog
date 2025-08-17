<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

import { aboutConfig } from '@/siteConfig/about.js'
import { siteConfig } from '@/siteConfig/main.js'
 
//标签位置
function leftTagPosition(index) {
  return [
    'top-12 left-14',
    'top-25 left-10',
    'bottom-10 left-14'
  ][index] || ''
}

function rightTagPosition(index) {
  return [
    'top-12 right-14',
    'top-25 right-10',
    'bottom-12 right-14'
  ][index] || ''
}

//tips切换动画
const tips = aboutConfig.author.tips
const current = ref(0)

onMounted(() => {
  setInterval(() => {
    current.value = (current.value + 1) % tips.length
  }, 2000)
})

//欢迎卡片
const helloAboutEl = ref(null)
const cursorEl = ref(null)
const shapeEls = ref([])

const shapesConfig = [
  { color: '#66c6ba', size: 650 },
  { color: '#a4e5d9', size: 440 },
  { color: '#c8f4de', size: 270 },
]

let mouseMoveHandler = null

onMounted(() => {
  shapeEls.value = helloAboutEl.value.querySelectorAll('.shape')

  const container = helloAboutEl.value
  const cursor = cursorEl.value
  const shapes = shapeEls.value

  const rect = container.getBoundingClientRect()
  
  // 容器中心
  const centerX = rect.width / 2 - cursor.offsetWidth / 2
  const centerY = rect.height / 2 - cursor.offsetHeight / 2

  // 初始化位置，默认在中心
  gsap.set(cursor, { x: centerX, y: centerY })
  gsap.set(shapes, { x: centerX, y: centerY })

  // 鼠标移动跟随
  mouseMoveHandler = evt => {
    const rect = container.getBoundingClientRect()
    const mouseX = evt.clientX - rect.left - cursor.offsetWidth / 2
    const mouseY = evt.clientY - rect.top - cursor.offsetHeight / 2

    gsap.set(cursor, { x: mouseX, y: mouseY })
    gsap.to(shapes, {
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
  if (container) {
    container.removeEventListener('mousemove', mouseMoveHandler)
  }
})

//技能
const skills = [
  { name: 'Docker', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/63300647df7fa.png', color: '#57b6e6' },
  { name: 'Photoshop', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/63300647e1f10.png', color: '#4082c3' },
  { name: 'Node', icon: 'https://npm.elemecdn.com/anzhiyu-blog@2.1.1/img/svg/node-logo.svg', color: '#333' },
  { name: 'Python', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/63300647dea51.png', color: '#fff' },
  { name: 'Vite', icon: 'https://npm.elemecdn.com/anzhiyu-blog@2.0.8/img/svg/vite-logo.svg', color: '#937df7' },
  { name: 'Vue', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/633001374747b.png', color: '#b8f0ae' },
  { name: 'CSS3', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/633006cc55e07.png', color: '#2c51db' },
  { name: 'JS', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/633006eee047b.png', color: '#f7cb4f' },
  { name: 'HTML', icon: 'https://img02.anheyu.com/adminuploads/1/2022/09/25/633006f9ab27d.png', color: '#e9572b' },
  { name: 'Git', icon: 'https://img02.anheyu.com/adminuploads/1/2023/04/11/6434a635e9726.webp', color: '#df5b40' },
];
const mid = Math.ceil(skills.length / 2)
const firstHalf = skills.slice(0, mid)
const secondHalf = skills.slice(mid)

//访问数据
const cover = 'https://img02.anheyu.com/adminuploads/1/2022/09/23/632d634f8376d.jpg'
// 配置
const UMAMI_URL = 'https://statistics.zhengweixin.top';
const UMAMI_SHARE_URL = 'https://statistics.zhengweixin.top/share/6FBrEjH0q8vcrGxh/zhengweixin.top';
const WEBSITE_ID = '7441ce23-3587-41b6-8919-e42932fc65d7';
const TOKEN = 'nmDTV73ucyUS8829KW3miG8O/obEDyPu1Jey5st9HWUhXRQnA9mP5a9xMjVukSve/we34uIGNszqlwlo6ZrcRIW+OUon3O3/NkepjhxSFmIAAxoKjHqgoopaip+NharfN8egGKfog5Ypv2KAGnxpHtE9tl7NgNh93EbuGApaYcZeN+kmNzTpOfookmYlWkv2+9flKognxoXE/84UZ6Xz8zGUXG5+qPXwSwnk5gQoSuFPcJ1bCuP5V2hEb5i12tgOEORqrtEXzvwhloag+QiDeKQ+8RqluxSThooId4gy9onIstofGISPfRJ8qS9G0v9aC1qqJh/nXyBxfbi8HVeL51iio8M1HXENhQ==';
const CREATED_AT = '2025-08-15T16:00:00.000Z';

const statsToday = ref(null);
const statsYesterday = ref(null);
const statsTotal = ref(null);
const error = ref(null);

function getDayTimestamps(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
}

onMounted(async () => {
  try {
    const createdAtTs = new Date(CREATED_AT).getTime();
    const now = Date.now();

    // 今日
    const { start: startToday, end: endToday } = getDayTimestamps();
    statsToday.value = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startToday}&endAt=${endToday}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json());

    // 昨日
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { start: startYesterday, end: endYesterday } = getDayTimestamps(yesterday);
    statsYesterday.value = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startYesterday}&endAt=${endYesterday}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json());

    // 总量
    statsTotal.value = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${createdAtTs}&endAt=${now}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json());

  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <main v-fade-in class="mt-17 md:mt-15">
    <div class="relative flex justify-center items-center transition-colors duration-300">
      <!-- 左侧标签组 -->
      <div data-fade="2" class="hidden md:block relative w-56 h-56">
        <span
          v-for="(tag, i) in aboutConfig.author.tags.left"
          :key="'left-' + i"
          class="author-tag absolute rounded-full bg-white dark:bg-white/15 py-1 px-2 shadow"
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
          class="author-tag absolute rounded-full bg-white dark:bg-white/15 py-1 px-2 shadow"
          :class="rightTagPosition(i)"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <h1 data-fade class="text-3xl flex justify-center mt-5 md:mt--5">
      <span class="relative inline-block transition-colors duration-300 text-#2f3f5b dark:text-gradient">
        关于我
        <span class="absolute inset-0 -z-10 bg-gradient-to-r from-#00e699/50 to-#00e2d8/50 dark:hidden transition-colors duration-300"/>
      </span>
    </h1>

    <div data-fade class="flex flex-wrap justify-center gap-4 w-full mx-auto m-5">
      <div class="flex-1 md:flex-[3_3_0%] bg-gradient-to-r from-[#233142] to-[#455d7a] text-white p-5 rounded-2xl min-w-full md:min-w-[300px] flex flex-col justify-center gap-2">
        <div class="text-sm opacity-90">Hi，很高兴认识你！👋</div>
        <h2 class="text-3xl font-bold">我叫
          <span class="relative inline-block">
            <span class="text-gradient">
              {{ aboutConfig.author.name }}
            </span>
          </span>
        </h2>
        <div class="text-sm opacity-90">{{ aboutConfig.author.description }}</div>
      </div>
      <div class="flex-1 md:flex-[2_2_0%] bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)]
                  min-w-full md:min-w-[200px] aboutsiteTips relative transition-colors duration-300"
      >
        <div class="text-xs absolute text-gray-400">追求</div>
        <h2 class="text-3xl font-bold mt-5">
          源于<br>
          热爱而去 感受<br>
          <div class="mask relative inline-block overflow-hidden mt-2" style="height:3rem">
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
        <h2 class="text-[clamp(80px,8vw,140px)] text-#649dad dark:text-white flex items-center justify-center">{{ aboutConfig.helloCard.text }}</h2>
      </div>
    </div>

    <div data-fade class="flex flex-col md:flex-row gap-4 w-full mx-auto m-5">
      <!-- 技能 -->
      <div class="flex-1 md:w-1/2 overflow-hidden bg-white dark:bg-white/10 p-5 rounded-2xl shadow-[0_0_2px_rgba(0,0,0,0.2)]
                  min-w-full md:min-w-[200px] aboutsiteTips relative transition-colors duration-300"
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
            <img :src="skill.icon" class="w-12 h-12 object-contain" />
          </div>
          <div
            v-for="(skill, i) in firstHalf"
            :key="'row1-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" />
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
            <img :src="skill.icon" class="w-12 h-12 object-contain" />
          </div>
          <div
            v-for="(skill, i) in secondHalf"
            :key="'row2-copy-' + i"
            class="flex items-center justify-center rounded-2xl shadow aspect-square flex-[0_0_80px]"
            :style="{ backgroundColor: skill.color }"
          >
            <img :src="skill.icon" class="w-12 h-12 object-contain" />
          </div>
        </div>
      </div>
      <!-- 偏好 -->
      <div class="flex-1 md:w-1/2 p-5 rounded-2xl bg-[url('https://img02.anheyu.com/adminuploads/1/2022/09/24/632f0dd8f33c6.webp')] 
                  bg-cover min-w-full md:min-w-[200px] relative transition-colors duration-300"
      >
        <div class="text-xs absolute text-gray-300">关注偏好</div>
        <h2 class="text-3xl font-bold mt-5 text-white">数码科技</h2>
        <p class="text-white/90 mt-50">手机、电脑软硬件</p>
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
          <div class="grid grid-cols-3 text-2xl mt-8 mb-10">
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
              <a :href=UMAMI_SHARE_URL target="_blank" rel="noopener nofollow" class="text-sm text-white/50">Umami</a>
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
      
      <div class="flex-1 md:flex-[3_3_0%] bg-gradient-to-r from-[#233142] to-[#455d7a] text-white p-5 rounded-2xl min-w-full md:min-w-[300px] flex flex-col justify-center gap-2">
        <h2 class="text-3xl font-bold">占位</h2>
      </div>
    </div>

            <div class="card-background-icon"><i class="iconfont icon-dice-d"></i></div>
  </main>
</template>

<style>
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
</style>