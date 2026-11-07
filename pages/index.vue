<script setup>
import { siteConfig } from '@/siteConfig/main.js'
</script>

<template>
  <main class="max-w-screen-xl mx-auto min-h-screen flex flex-col justify-center py-12 max-w-7xl">
    <div class="flex flex-col-reverse md:flex-row items-center justify-between w-full gap-10 mt--10">
      <!-- 左侧 -->
      <div class="text-center md:text-left">
        <p data-fade class="text-4xl sm:text-5xl font-display font-semibold tracking-tight text-ink">
          Hello!<span id="wave-hand">👋</span>
        </p>
        <h1 data-fade="2" class="mt-4 text-5xl sm:text-6xl font-display font-semibold leading-[1.08] tracking-tight text-balance text-ink">
          I'm
          <span class="text-gradient ml-2">{{ siteConfig.author.name }}</span>
        </h1>
        <p
          data-fade
          class="mt-5 max-w-xl text-ink-muted transition-colors duration-base text-lg mx-auto md:mx-0"
        >
          {{ siteConfig.author.description }}
        </p>
        <div data-fade>
          <div class="flex flex-wrap gap-2.5 mt-8 justify-center md:justify-start">
            <NuxtLink
              to="/posts"
              class="hero-pill inline-flex items-center justify-center
                      px-4 py-2.5 rounded-full border border-accent-line-soft
                      text-sm font-medium leading-none text-ink no-underline
                      active:scale-[0.97]"
            >
              My Posts
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="hero-pill inline-flex items-center justify-center
                      px-4 py-2.5 rounded-full border border-accent-line-soft
                      text-sm font-medium leading-none text-ink no-underline
                      active:scale-[0.97]"
            >
              About Me
            </NuxtLink>
          </div>
          <div class="mt-6 flex flex-wrap justify-center md:justify-start gap-1.5 text-sm">
            <a
              v-for="item in siteConfig.socialLinks"
              :key="item.href"
              :href="item.href"
              :target="item.external ? '_blank' : undefined"
              rel="noopener noreferrer nofollow"
              class="hero-social inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5
                      text-ink-muted no-underline active:scale-95"
            >
              <AppIcon :name="item.icon" class="text-base" /> {{ item.text }}
            </a>
          </div>
        </div>
      </div>
      <!-- 头像 -->
      <div data-fade="2" class="w-40 h-40 sm:w-56 sm:h-56 md:w-70 md:h-70 rounded-full shadow-lg ring-1 ring-line-soft">
        <img
          :src="siteConfig.author.avatar"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover transition-transform duration-base md:hover:rotate-360 fade-in-image"
          draggable="false"
          loading="lazy"
        />
      </div>
    </div>
  </main>
</template>

<style>
@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(14deg);
  }
  30% {
    transform: rotate(-8deg);
  }
  40% {
    transform: rotate(14deg);
  }
  50% {
    transform: rotate(-4deg);
  }
  60% {
    transform: rotate(10deg);
  }
  70% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

#wave-hand {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: wave 2s ease-in-out 1;
  animation-delay: 0.5s;
  animation-fill-mode: forwards;
}

.hero-pill {
  background-color: var(--surface);
  -webkit-backdrop-filter: blur(var(--surface-blur));
  backdrop-filter: blur(var(--surface-blur));
  transition: background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-spring);
}

.hero-pill:hover {
  background-color: var(--accent-soft);
  border-color: var(--accent);
}

.hero-social {
  transition: background-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-spring);
}

.hero-social:hover {
  background-color: var(--accent-soft);
  color: var(--accent-text);
}
</style>
