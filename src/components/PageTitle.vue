<template>
  <h1 class="text-3xl mt-40">
    <span class="bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent -webkit-bg-clip-text">
      <slot>{{ text }}</slot>
    </span>
  </h1>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>
