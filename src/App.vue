<template>
  <div class="relative min-h-screen flex flex-col text-white">
    <Background />
    <Header />
    <div class="flex flex-1 bg-black/40 backdrop-blur-sm">
      <div class="hidden md:block md:w-1/10 lg:w-1/5 xl:w-1/4">
        <!-- 左侧 -->
      </div>
      <div class="flex-1 w-full flex flex-col max-w-screen-xl mx-auto">
        <div class="flex-1 relative z-10">
          <RouterView />
        </div>
        <Footer />
      </div>
      <div class="hidden md:block md:w-1/10 lg:w-1/5 xl:w-1/4">
        <!-- 右侧 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import Background from '@/components/Background.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>
