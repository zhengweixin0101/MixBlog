<template>
  <aside
    v-if="toc.length"
    class="card-base hidden lg:block w-60 p-4 bg-surface transition-colors duration-base group"
  >
    <section>
      <div class="text-lg font-display font-semibold mb-3 text-ink">
        目录
      </div>
      <ul class="list-none p-0 m-0 mt-1">
        <li v-for="(item, index) in toc" :key="index" class="mb-1">
          <a
            href="javascript:void(0)"
            class="block relative text-ink-subtle no-underline hover:text-ink transition-colors duration-base text-sm leading-tight"
            :class="[
              {
                'pl-3 before:left-0': item.tag === 'H2',
                'pl-6 before:left-2': item.tag === 'H3',
                'pl-9 before:left-4': item.tag === 'H4',
                'pl-12 before:left-6': item.tag === 'H5',
                'pl-15 before:left-8': item.tag === 'H6',
              },
              currentId === item.id ? 'text-accent-text font-semibold' : ''
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
})

const currentId = ref('')

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
a {
  transition: filter 0.3s, color 0.3s;
}

.group:hover a {
  filter: blur(0);
}
</style>