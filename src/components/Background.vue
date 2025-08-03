<template>
  <div
    class="fixed inset-0 -z-10 bg-[#0e1111]"
  >
    <div
      class="absolute w-full h-full pointer-events-none"
      :style="{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '15px 15px'
      }"
    />
  </div>
</template>