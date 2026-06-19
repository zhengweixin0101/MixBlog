<template>
  <NuxtLink
    :to="to"
    class="custom-gradient-link inline-flex relative font-medium text-#2f3f5b no-underline"
  >
    <span class="dark:text-gradient">{{ text }}</span>
    <span
      class="absolute inset-0 -z-10
            bg-gradient-to-r from-#00e699/30 to-#00e2d8/30
            dark:hidden transition-colors duration-300"
    ></span>
  </NuxtLink>
</template>

<script setup>
defineProps({
  to: { type: String, default: '/' },
  text: { type: String, default: '← Back to Home' },
})
</script>

<style>
.custom-gradient-link {
  position: relative;
  border-bottom: 1.5px dotted white;
  transition: border-bottom-color 0.5s ease;
  --underline-width: 0%;
}
.custom-gradient-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #00e699, #00e2d8);
  width: var(--underline-width);
  transition: width 0.3s ease;
  border-radius: 9999px;
  pointer-events: none;
}
.custom-gradient-link:hover {
  border-bottom-color: transparent;
}
.custom-gradient-link:hover::after {
  --underline-width: 100%;
}
</style>
