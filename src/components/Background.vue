<script setup>
import StarTrails from './StarTrails.vue'
</script>

<template>
  <div
    id="background"
    class="fixed inset-0 -z-10 pointer-events-none"
  >
    <StarTrails class="absolute inset-0" />
    <div
      class="absolute bottom-0 left-0 w-full h-40vh pointer-events-none"
      style="background: linear-gradient(to top, #0e1111, transparent)"
    />
  </div>
</template>
