<template>
  <div class="relative min-h-screen flex flex-col text-white">
    <Header />
    <div class="flex flex-1 bg-#0e1111">
      <div class="flex-1 w-full flex flex-col px-4">
        <div class="w-full mx-auto flex-1 flex flex-col
                    max-w-full sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[75vw] 2xl:max-w-[60vw]">
          <div class="flex-1 relative z-10 px-10">
            <RouterView />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  </div>
  <Background />
</template>

<script setup>
import Background from '@/components/Background.vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>