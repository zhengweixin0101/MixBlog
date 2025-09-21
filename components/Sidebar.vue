<template>
  <aside
    class="hidden lg:block w-60 p-4 rounded-lg bg-#fefefe dark:bg-white/10 shadow-[0_0_2px_rgba(0,0,0,0.2)] transition-colors duration-300 group"
  >
    <section>
      <div class="text-xl font-bold mb-2 dark:text-gradient">
        目录
      </div>
      <a
        href="#"
        class="text-mx font-semibold text-#2f3f5b/80 dark:text-white no-underline before:hidden transition-colors"
        @click.prevent="scrollToTop"
      >
        {{ title || '无标题文章' }}
      </a>
      <ul class="list-none p-0 m-0 mt-1">
        <li v-for="(item, index) in toc" :key="index" class="mb-1">
          <a
            href="javascript:void(0)"
            class="block relative text-#2f3f5b dark:text-gray-400 no-underline hover:text-#2f3f5b/60 dark:hover:text-white transition-colors duration-300 text-sm leading-tight"
            :class="[
              {
                'pl-4 before:left-0': item.tag === 'H2',
                'pl-6 before:left-2': item.tag === 'H3',
                'pl-8 before:left-4': item.tag === 'H4',
                'pl-10 before:left-6': item.tag === 'H5',
                'pl-12 before:left-8': item.tag === 'H6',
              },
              currentId === item.id ? 'text-#2f3f5b/60 dark:text-white' : 'blur-1px'
            ]"
            @click.prevent="scrollTo(item.id)"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  toc: { type: Array, default: () => [] },
  title: { type: String, default: '' }
})

const currentId = ref('')

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    currentId.value = id
  }
}

const onScroll = () => {
  const scrollPos = window.scrollY
  for (let i = props.toc.length - 1; i >= 0; i--) {
    const el = document.getElementById(props.toc[i].id)
    if (el && el.offsetTop <= scrollPos) {
      currentId.value = props.toc[i].id
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
a::before {
  content: '•';
  position: absolute;
  top: 0.2em;
  color: inherit;
}

a {
  transition: filter 0.3s, color 0.3s;
}

.group:hover a {
  filter: blur(0);
}
</style>