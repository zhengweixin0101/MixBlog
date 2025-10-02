<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, useRouter, useRoute, useColorMode } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'
import { useNotification } from '~/composables/useNotification'

const notification = useNotification()

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const menuRef = ref(null)
const loading = ref(false)

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

const menuType = ref('default')
const targetElement = ref(null)
const selectedText = ref('')

const showMenu = async (event) => {
  event.preventDefault()
  const el = event.target

  selectedText.value = ''

  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
    targetElement.value = el
    selectedText.value = el.value.substring(el.selectionStart, el.selectionEnd)
    menuType.value = selectedText.value ? 'input-selected' : 'input'
  }
  else if (window.getSelection()?.toString()) {
    const sel = window.getSelection()
    selectedText.value = sel.toString()
    targetElement.value = el

    const commentBox = document.querySelector('.tk-input textarea.el-textarea__inner')
    if (commentBox) {
      menuType.value = 'selection-with-twikoo'
    } else {
      menuType.value = 'selection'
    }
  }
  else if (el.tagName === 'IMG' || el.closest('a[data-fancybox]')) {
    menuType.value = 'image'
    targetElement.value = el.tagName === 'IMG' ? el : el.querySelector('img')
  }
  else if (el.closest('a')) {
    menuType.value = 'link'
    targetElement.value = el.closest('a')
  }
  else {
    menuType.value = 'default'
    targetElement.value = el
  }

  visible.value = true
  await nextTick()

  const menu = menuRef.value
  if (!menu) return

  let posX = event.clientX
  let posY = event.clientY
  const menuWidth = menu.offsetWidth
  const menuHeight = menu.offsetHeight
  const pageWidth = window.innerWidth
  const pageHeight = window.innerHeight

  if (posX + menuWidth > pageWidth) posX = pageWidth - menuWidth - 5
  if (posY + menuHeight > pageHeight) posY = pageHeight - menuHeight - 5

  x.value = posX
  y.value = posY
}

// 隐藏菜单
const hideMenu = () => {
  visible.value = false
}

// 状态
const isHome = computed(() => route.path === '/')

// 默认菜单功能
const goBack = () => { window.history.back(); hideMenu() }
const goForward = () => { window.history.forward(); hideMenu() }
const refreshPage = () => { window.location.reload(); hideMenu() }
const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); hideMenu() }
const goHome = () => { router.push('/'); hideMenu() }

const shufflePost = async () => {
  loading.value = true
  try {
    const posts = await $fetch(`${siteConfig.postsData.postsList}?fields=slug`)

    if (!Array.isArray(posts) || posts.length === 0) {
      console.warn('No posts available to shuffle.')
      return
    }

    const randomIndex = Math.floor(Math.random() * posts.length)
    const randomPost = posts[randomIndex]

    if (randomPost?.slug) {
      router.push(`/posts/${randomPost.slug}`)
    } else {
      console.warn('Selected post has no slug:', randomPost)
    }
  } catch (err) {
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
    hideMenu()
  }
}

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    notification.show(`复制成功!`)
  } catch (err) {
    notification.show(`复制失败!`, 'error')
  } finally {
    hideMenu()
  }
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  notification.show(`已为您切换为${colorMode.value === 'dark' ? '浅色' : '深色'}模式`)
  hideMenu()
}

// 图片菜单功能
const copyImageUrl = async () => {
  const src = targetElement.value?.src
  if (!src) return
  try {
    await navigator.clipboard.writeText(src)
    notification.show('图片地址已复制!')
  } catch {
    notification.show('复制失败', 'error')
  } finally {
    hideMenu()
  }
}

const openImageNewTab = () => {
  const src = targetElement.value?.src
  if (src) window.open(src, '_blank')
  hideMenu()
}

const viewImage = () => {
  const img = targetElement.value
  if (!img || img.tagName !== 'IMG') return

  const parentLink = img.closest('a[data-fancybox]')
  if (parentLink) {
    parentLink.click()
  } else {
    window.open(img.src, '_blank')
  }

  hideMenu()
}

// 链接菜单功能
const openLinkNewTab = () => {
  const href = targetElement.value?.href
  if (href) window.open(href, '_blank')
  hideMenu()
}

const copyLink = async () => {
  const href = targetElement.value?.href
  if (!href) return
  try {
    await navigator.clipboard.writeText(href)
    notification.show('链接已复制!')
  } catch {
    notification.show('复制失败', 'error')
  } finally {
    hideMenu()
  }
}

// 输入框菜单功能
const cutText = () => {
  if (!targetElement.value) return
  const el = targetElement.value

  if ('value' in el) {
    navigator.clipboard.writeText(el.value)
      .then(() => {
        el.value = ''
        hideMenu()
      })
      .catch(() => {
        notification.show('复制失败，请向开发者反馈问题!', 'error')
      })
  }
}

const copyText = () => {
  if (!targetElement.value) return
  let textToCopy = ''
  if (menuType.value === 'selection' && selectedText.value) {
    textToCopy = selectedText.value
    notification.show('复制成功，请遵循版权协议!')
  } else {
    const el = targetElement.value
    if ('value' in el) {
      textToCopy = el.value
      notification.show('复制成功!')
    } else {
      textToCopy = el.innerText || el.textContent
      notification.show('复制成功，请遵循版权协议!')
    }
  }
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      hideMenu()
    })
    .catch(() => {
      notification.show('复制失败，请向开发者反馈问题!', 'error')
    })
}


const pasteText = () => {
  if (!targetElement.value) return
  navigator.clipboard.readText().then(text => {
    const el = targetElement.value
    const start = el.selectionStart
    const end = el.selectionEnd
    el.setRangeText(text, start, end, 'end')
  })
  hideMenu()
}

// 选中文本功能
function search() {
  if (!selectedText.value) {
    notification.show('请选择文本！', 'warning')
    return
  }
  const query = encodeURIComponent(selectedText.value)
  const url = `https://www.bing.com/search?q=${query}`
  window.open(url, '_blank')
  hideMenu()
}

const quoteToTwikoo = () => {
  if (!selectedText.value) return

  const commentBox = document.querySelector('.tk-input textarea.el-textarea__inner')
  if (!commentBox) {
    notification.show('评论框未找到!', 'error')
    return
  }

  const el = commentBox
  const start = el.selectionStart
  const end = el.selectionEnd

  const quoteText = selectedText.value
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n') + '\n' + '\n'

  el.setRangeText(quoteText, start, end, 'end')
  el.focus()

  const event = new Event('input', { bubbles: true })
  el.dispatchEvent(event)

  notification.show('已引用到评论区！你无需删除空行，直接评论以获取最佳展示效果。', 'success', 10000, true)
  hideMenu()
}

// 事件绑定
onMounted(() => {
  window.addEventListener('contextmenu', showMenu)
  window.addEventListener('click', hideMenu)
  window.addEventListener('scroll', hideMenu, true)
  window.addEventListener('resize', hideMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('contextmenu', showMenu)
  window.removeEventListener('click', hideMenu)
  window.removeEventListener('scroll', hideMenu, true)
  window.removeEventListener('resize', hideMenu)
})
</script>

<template>
  <div
    v-show="visible"
    ref="menuRef"
    id="rightMenu"
    class="fixed z-10002 bg-#fefefe/80 dark:bg-#1a1a1a/70 backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-lg 
           shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:shadow-[0_0_2px_rgba(255,255,255,0.6)] p-1.5"
    :style="{ top: y + 'px', left: x + 'px' }"
  >
    <div class="flex justify-between gap-1 p-1">
      <i class="iconfont icon-arrow-left rightMenu-item-1" @click="goBack"></i>
      <i class="iconfont icon-arrow-right rightMenu-item-1" @click="goForward"></i>
      <i class="iconfont icon-arrow-rotate-right rightMenu-item-1" @click="refreshPage"></i>
      <i class="iconfont icon-arrow-up rightMenu-item-1" @click="scrollToTop"></i>
    </div>
    <div class="border border-dashed border-gray-300 dark:border-white/20 m-1"></div>

    <!-- 默认 -->
    <template v-if="menuType === 'default'">
      <div class="flex flex-col p-1">
        <span v-if="!isHome" @click="goHome" class="rightMenu-item-2">
          <i class="iconfont icon-home text-lg mr-2"></i>返回首页
        </span>
        <span @click="shufflePost" class="rightMenu-item-2">
          <i class="iconfont icon-shuffle text-lg mr-2"></i>随便逛逛
        </span>
      </div>
      <div class="border border-dashed border-gray-300 dark:border-white/20 m-1"></div>
      <div class="flex flex-col p-1">
        <span @click="copyAddress" class="rightMenu-item-2">
          <i class="iconfont icon-copy text-lg mr-2"></i>复制地址
        </span>
        <client-only>
          <span @click="toggleTheme" class="rightMenu-item-2">
            <i class="iconfont icon-circle-half-stroke text-lg mr-2"></i>
            {{colorMode.value === 'dark' ? '浅色' : '深色'}}模式
          </span>
        </client-only>
      </div>
    </template>

    <!-- 图片 -->
    <template v-else-if="menuType === 'image'">
      <div class="flex flex-col p-1">
        <span class="rightMenu-item-2" @click="viewImage">
          <i class="iconfont icon-images text-lg mr-2"></i>查看图片
        </span>
        <span class="rightMenu-item-2" @click="copyImageUrl">
          <i class="iconfont icon-link text-lg mr-2"></i>复制链接
        </span>
        <span class="rightMenu-item-2" @click="openImageNewTab">
          <i class="iconfont icon-window-restore text-lg mr-2"></i>新标签打开
        </span>
      </div>
    </template>

    <!-- 链接 -->
    <template v-else-if="menuType === 'link'">
      <div class="flex flex-col p-1">
        <span class="rightMenu-item-2" @click="openLinkNewTab">
          <i class="iconfont icon-window-restore text-lg mr-2"></i>新标签打开
        </span>
        <span class="rightMenu-item-2" @click="copyLink">
          <i class="iconfont icon-link text-lg mr-2"></i>复制链接
        </span>
      </div>
    </template>

    <!-- 输入框 -->
    <template v-else-if="menuType === 'input'">
      <div class="flex flex-col p-1">
        <span @click="pasteText" class="rightMenu-item-2"><i class="iconfont icon-paste text-lg mr-2"></i>粘贴</span>
      </div>
    </template>

    <template v-if="menuType === 'input-selected'">
      <div class="flex flex-col p-1">
        <span @click="pasteText" class="rightMenu-item-2"><i class="iconfont icon-paste text-lg mr-2"></i>粘贴</span>
        <span @click="copyText" class="rightMenu-item-2"><i class="iconfont icon-copy text-lg mr-2"></i>复制</span>
        <span @click="cutText" class="rightMenu-item-2"><i class="iconfont icon-cut text-lg mr-2"></i>剪切</span>
      </div>
    </template>
    
    <!-- 选中 -->
    <template v-else-if="menuType === 'selection'">
      <div class="flex flex-col p-1">
        <span @click="copyText" class="rightMenu-item-2"><i class="iconfont icon-copy text-lg mr-2"></i>复制</span>
        <span @click="search" class="rightMenu-item-2"><i class="iconfont icon-search text-lg mr-2"></i>必应搜索</span>
      </div>
    </template>

    <template v-else-if="menuType === 'selection-with-twikoo'">
      <div class="flex flex-col p-1">
        <span @click="copyText" class="rightMenu-item-2"><i class="iconfont icon-copy text-lg mr-2"></i>复制</span>
        <span @click="search" class="rightMenu-item-2"><i class="iconfont icon-search text-lg mr-2"></i>必应搜索</span>
        <span @click="quoteToTwikoo" class="rightMenu-item-2"><i class="iconfont icon-comment-medical1 text-lg mr-2"></i>引用到评论</span>
      </div>
    </template>
  </div>
</template>