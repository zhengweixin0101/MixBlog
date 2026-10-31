<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, useRoute, useColorMode } from '#imports'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { siteConfig } from '@/siteConfig/main.js'
import { useNotification } from '~/composables/useNotification'
import { useThemeReveal } from '~/composables/useThemeReveal'

const notification = useNotification()
const { revealTheme } = useThemeReveal()
const route = useRoute()
const colorMode = useColorMode()
const menuRef = ref(null)
const isMenuOpen = ref(false)
const menuButton = ref(null)
const mounted = ref(false)
const isHidden = ref(false)

/* 导航当前项的滑动指示器 */
const navListRef = ref(null)
const linkRefs = ref([])
const indicatorStyle = ref({})
const indicatorReady = ref(false)
const indicatorAtEdge = ref(false)
const indicatorRecoil = ref(false) // 撞边后的压缩回弹
let recoilTimer = null

function syncIndicator() {
  const list = navListRef.value
  if (!list) return false
  const idx = siteConfig.navItems.findIndex(isActive)
  const el = linkRefs.value[idx]

  const elRect = el.getBoundingClientRect()
  const listRect = list.getBoundingClientRect()

  if (!elRect.width) {
    indicatorReady.value = false
    return false
  }

  const maxX = Math.max(0, listRect.width - elRect.width)
  const x = Math.min(Math.max(elRect.left - listRect.left, 0), maxX)
  const atEdge = x <= 0 || x >= maxX

  indicatorAtEdge.value = atEdge
  indicatorStyle.value = {
    width: `${elRect.width}px`,
    height: `${elRect.height}px`,
    transform: `translate(${x}px, ${elRect.top - listRect.top}px)`,
    transformOrigin: x <= 0 ? 'left center' : 'right center',
  }
  indicatorReady.value = true
  return atEdge
}

async function playRecoil() {
  indicatorRecoil.value = false
  await nextTick()
  void navListRef.value?.offsetWidth
  indicatorRecoil.value = true
  clearTimeout(recoilTimer)
  recoilTimer = setTimeout(() => {
    indicatorRecoil.value = false
  }, 900)
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function isActive(item) {
  if (item.href === '/posts') return route.path.startsWith('/posts')
  return route.path === item.href
}

onClickOutside(menuRef, (e) => {
  if (isMenuOpen.value && !menuButton.value?.contains(e.target)) {
    isMenuOpen.value = false
  }
})

// 圆形过渡从按钮本身扩散 / 收回，提示等过渡结束再弹，避免被快照盖住
async function toggleTheme(e) {
  const next = colorMode.value === 'dark' ? 'light' : 'dark'
  await revealTheme(next, { origin: e?.currentTarget })
  notification.show(`已为您切换为${next === 'dark' ? '深色' : '浅色'}模式`)
}

// 下滑隐藏 / 上滑或回到顶部浮现（主页始终显示）
const HIDE_AFTER = 80 // 距顶不足这段距离时始终显示，避免刚滑动就收起
const HIDE_THRESHOLD = 50 // 累计下滑这么多距离后收起
const MIN_DELTA = 4 // 忽略微小抖动
let lastY = 0
let downDistance = 0
let scrollFrame = null

function canHide() {
  return route.path !== '/'
}

function updateHeaderVisibility() {
  scrollFrame = null
  const y = window.scrollY
  const diff = y - lastY
  if (!canHide() || y <= HIDE_AFTER) {
    isHidden.value = false
    downDistance = 0
  } else if (diff > MIN_DELTA) {
    downDistance += diff
    if (!isHidden.value && downDistance >= HIDE_THRESHOLD) {
      isHidden.value = true
      isMenuOpen.value = false
    }
  } else if (diff < -MIN_DELTA) {
    downDistance = 0
    isHidden.value = false
  }
  lastY = y
}

function onScroll() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(updateHeaderVisibility)
}

watch(() => route.path, async () => {
  isHidden.value = false
  lastY = window.scrollY
  downDistance = 0
  await nextTick()
  if (syncIndicator()) playRecoil()
})

onMounted(async () => {
  mounted.value = true
  lastY = window.scrollY
  downDistance = 0
  window.addEventListener('scroll', onScroll, { passive: true })
  await nextTick()
  syncIndicator()
})

// 窗口缩放会改变各项的宽度，需要重新量一次
useEventListener(window, 'resize', () => syncIndicator())

onBeforeUnmount(() => {
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = null
  }
  clearTimeout(recoilTimer)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header>
    <div
      class="header-nav fixed top-4 inset-x-0 z-100"
      :class="{ 'header-nav-hidden': isHidden }"
    >
      <div
        class="relative mx-auto flex items-center gap-2 justify-between md:justify-start
               w-full
               px-3
               max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[90vw] xl:max-w-[80vw] 2xl:max-w-[55vw]"
      >
      <!-- 窄屏左侧按钮-->
      <button
        ref="menuButton"
        @click="toggleMenu"
        aria-label="展开菜单"
        class="md:hidden shrink-0 w-11 h-11 rounded-full appearance-none bg-transparent p-0 m-0
               border border-line bg-overlay shadow-lg
               text-ink-muted hover:text-accent-hover-fixed transition-colors duration-base
               flex items-center justify-center select-none cursor-pointer"
        type="button"
      >
        <AppIcon :name="isMenuOpen ? 'close' : 'menu'" class="text-base" />
      </button>
      <div class="relative flex items-center w-fit md:flex-1 md:-ml-6 md:mr-6">
      <nav
        class="hidden md:block h-12 rounded-full border border-line bg-overlay shadow-lg
               w-full min-w-0"
      >
        <div class="flex items-center justify-between h-full w-full p-1">
        <ul ref="navListRef" class="hidden md:flex items-stretch justify-start gap-1 list-none p-0 m-0 flex-1 relative h-full">
          <span
            v-show="indicatorReady"
            aria-hidden="true"
            class="nav-indicator neu-indicator absolute top-0 left-0 pointer-events-none rounded-full"
            :class="{ 'is-edge': indicatorAtEdge, 'is-recoil': indicatorRecoil }"
            :style="indicatorStyle"
          ></span>
          <li v-for="(item, index) in siteConfig.navItems" :key="'main-' + index">
            <NuxtLink
              :ref="(el) => (linkRefs[index] = el?.$el ?? el)"
              :to="item.href"
              class="relative z-10 flex items-center gap-1 no-underline whitespace-nowrap rounded-full px-3.5 h-full
                     text-sm font-medium transition-colors duration-base ease-out"
              :class="isActive(item) ? 'text-accent-text' : 'text-ink-muted hover:text-accent-text'"
            >
              <AppIcon :name="item.icon" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>

      </div>
      </nav>

      <!-- 主题切换 -->
      <button
        @click="toggleTheme"
        aria-label="切换主题"
        class="shrink-0 w-11 h-11 md:w-10 md:h-10 rounded-full appearance-none bg-transparent p-0 m-0
               md:absolute md:left-full md:top-1/2 md:ml-1 md:-translate-y-1/2
               border border-line bg-overlay shadow-lg
               text-ink-muted hover:text-accent-hover-fixed transition-colors duration-base
               flex items-center justify-center select-none cursor-pointer"
        type="button"
      >
        <AppIcon name="moon" class="text-base" v-show="!mounted"></AppIcon>
        <client-only>
          <AppIcon :name="colorMode.value === 'dark' ? 'moon' : 'sun'" class="text-base"></AppIcon>
        </client-only>
      </button>
      </div>
      </div>
    </div>

    <!-- 二级菜单 -->
    <Transition name="fade-slide">
      <div
        v-if="isMenuOpen"
        ref="menuRef"
        id="mobile-menu"
        class="md:hidden fixed top-[68px] left-4 w-1/4 min-w-[160px] mt-1
               rounded-xl shadow-lg border border-line bg-overlay
               z-90 overflow-hidden"
      >
        <ul class="flex flex-col divide-y divide-line">
          <li
            v-for="(item, index) in siteConfig.navItems"
            :key="'mobile-' + index"
            @click="isMenuOpen = false"
          >
            <NuxtLink
              draggable="false"
              :to="item.href"
              class="flex items-center px-4 py-3 text-sm font-medium no-underline transition-colors duration-base"
              :class="
                isActive(item)
                  ? 'bg-accent-soft text-accent-text'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-2'
              "
            >
              <AppIcon :name="item.icon" class="mr-2 text-base" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header-nav {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.header-nav nav {
  -webkit-backdrop-filter: blur(var(--overlay-blur));
  backdrop-filter: blur(var(--overlay-blur));
}

/* 滑动指示器 */
.nav-indicator {
  z-index: 0;
  transition: transform var(--dur-slide) var(--ease-spring),
    width var(--dur-base) var(--ease-out), height var(--dur-base) var(--ease-out),
    opacity var(--dur-fast) var(--ease-out);
}

.nav-indicator.is-edge {
  transition: transform var(--dur-slide) var(--ease-out),
    width var(--dur-base) var(--ease-out), height var(--dur-base) var(--ease-out),
    opacity var(--dur-fast) var(--ease-out);
}

.nav-indicator.is-recoil {
  animation: nav-recoil 420ms var(--ease-spring) 175ms both;
}

@keyframes nav-recoil {
  0% {
    scale: 1 1;
  }
  22% {
    scale: 0.8 1;
  }
  100% {
    scale: 1 1;
  }
}

/* 下滑隐藏 / 上滑浮现（主页始终显示） */
.header-nav {
  transition: transform var(--dur-slow) var(--ease-in-out),
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}

.header-nav-hidden {
  transform: translateY(calc(-100% - 1rem));
}

@media (prefers-reduced-motion: reduce) {
  .header-nav {
    transition: none;
  }
  .nav-indicator,
  .nav-indicator.is-edge {
    transition: none;
  }
  .nav-indicator.is-recoil {
    animation: none;
  }
}

/* 二级菜单动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>