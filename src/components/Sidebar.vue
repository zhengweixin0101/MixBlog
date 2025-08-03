<template>
  <aside
    class="hidden md:block w-62 p-4 rounded-lg backdrop-blur-sm bg-white/10 self-start"
  >
    <section>
      <div
        class="text-xl font-bold mb-2 bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent"
      >
        目录
      </div>
      <a href="#" class="text-mx font-semibold text-white no-underline before:hidden hover:text-gray-400" @click.prevent="scrollToTop">
        {{ title || '无标题文章' }}
      </a>
      <ul class="list-none mt-1 p-0 m-0">
        <li v-for="(item, index) in toc" :key="index" class="mb-1">
          <a
            :href="`#${item.id}`"
            class="block relative text-gray-400 no-underline hover:text-white transition-colors text-sm leading-tight"
            :class="{
              'pl-4 before:left-0': item.tag === 'H2',
              'pl-6 before:left-2': item.tag === 'H3',
              'pl-8 before:left-4': item.tag === 'H4',
              'pl-10 before:left-6': item.tag === 'H5',
              'pl-12 before:left-8': item.tag === 'H6'
            }"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
defineProps({
  toc: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  }
})

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
a::before {
  content: '•';
  position: absolute;
  top: 0.2em;
  color: inherit;
}
</style>