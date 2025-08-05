<template>
  <h1 class="text-3xl mt-40">
    <span
      class="relative inline-block transition-colors duration-300
             text-#2f3f5b
             dark:text-transparent
             dark:bg-gradient-to-r dark:from-[#00e699] dark:to-[#00e2d8]
             dark:bg-clip-text dark:-webkit-bg-clip-text
             dark:-webkit-text-fill-color-transparent"
    >
      <slot>{{ text }}</slot>
      <span
        class="absolute inset-0 -z-10
               bg-gradient-to-r from-[#00e69980] to-[#00e2d850]
               dark:hidden"
      />
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
