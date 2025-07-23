<template>
  <div class="relative min-h-screen flex flex-col bg-#0e1111 text-white overflow-x-hidden">
    <Background />
    <div class="flex flex-1">
      <div class="w-[25vw]"></div>
      <div class="w-[50vw] flex flex-col">
        <Header />
        <main class="flex-1 relative z-10 overflow-auto">
          <RouterView />
        </main>
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
