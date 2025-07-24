<template>
  <div class="relative min-h-screen flex flex-col text-white">
    <Background />
    <Header />
    <div class="flex flex-1 bg-black/40 backdrop-blur-sm">
      <div class="w-[25vw]"></div>
      <div class="w-[50vw] flex flex-col">
        <div class="flex-1 relative z-10">
          <RouterView />
        </div>
        <Footer />
      </div>
      <div class="w-[25vw]"></div>
    </div>
  </div>
</template>

<script setup>
import Background from '@/components/Background.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>
