<template>
  <div class="relative min-h-screen flex flex-col text-#2f3f5b dark:text-white transition-colors duration-300">
    <Header />
    <div class="flex flex-1">
      <div class="flex-1 w-full flex flex-col">
        <div
          class="w-full mx-auto flex-1 flex flex-col
                 max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[90vw] xl:max-w-[80vw] 2xl:max-w-[55vw]"
        >
          <div class="flex-1 relative z-10 px-3 min-h-screen">
            <NuxtPage />
          </div>
          <Footer />
        </div>
      </div>
    </div>
    <ContextMenu />
  </div>
  <Background />
</template>