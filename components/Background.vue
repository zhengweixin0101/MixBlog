<template>
  <div class="fixed inset-0 -z-10 pointer-events-none">
    <div class="absolute inset-0 bg-layer-light" style="background-image: var(--bg-grad-light)"></div>
    <div class="absolute inset-0 bg-layer-dark" style="background-image: var(--bg-grad-dark)"></div>
  </div>
</template>

<style>
.bg-layer-light {
  opacity: 1;
  transition: opacity var(--dur-slow) var(--ease-out);
}
.bg-layer-dark {
  opacity: 0;
  transition: opacity var(--dur-slow) var(--ease-out);
}
html.dark .bg-layer-light {
  opacity: 0;
}
html.dark .bg-layer-dark {
  opacity: 1;
}
</style>