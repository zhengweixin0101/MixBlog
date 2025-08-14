<script setup>
import { siteConfig } from '@/site.config.js'
</script>

<template>
  <div class="w-full h-0.3 bg-#2f3f5b/20 dark:bg-gray-700 my-8 transition-colors duration-300"></div>
  <footer class="mb-10 w-full text-center text-#2f3f5b dark:text-gray-300 text-sm">
    © 2025 {{ siteConfig.author.name }}. All rights reserved.
  </footer>
</template>
