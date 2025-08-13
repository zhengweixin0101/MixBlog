<template>
  <main v-fade-in class="max-w-screen-xl mx-auto min-h-screen flex flex-col justify-center py-12 max-w-7xl">
    <div class="flex flex-col-reverse md:flex-row items-center justify-between w-full gap-10 mt--10">
      <!-- 左侧 -->
      <div class="text-center md:text-left">
        <p data-fade class="text-4xl sm:text-5xl font-bold">
          Hi!<span id="wave-hand">👋</span>
        </p>
        <h1 data-fade class="mt-2 text-5xl sm:text-6xl leading-tight break-words">
          I'm
          <span class="relative inline-block ml-2">
            <span
              class="transition-colors duration-300
                    text-[#2f3f5b]
                    dark:text-transparent
                    dark:bg-gradient-to-r dark:from-[#00e699] dark:to-[#00e2d8]
                    dark:bg-clip-text dark:-webkit-bg-clip-text
                    dark:-webkit-text-fill-color-transparent"
            >
              ShinX
            </span>
            <span
              class="absolute inset-0 -z-10
                    bg-gradient-to-r from-[#00e69980] to-[#00e2d850]
                    dark:hidden"
            ></span>
          </span>
        </h1>
        <p
          data-fade
          class="mt-5 max-w-xl text-[#2f3f5b] dark:text-[#e4e7eb] transition-colors duration-300 text-base sm:text-lg mx-auto md:mx-0"
        >
          A 📕Student and 🎮Gamer
        </p>
        <div data-fade class="flex flex-wrap gap-4 mt-10 justify-center md:justify-start">
          <NuxtLink
            to="/posts"
            class="inline-flex items-center justify-center
                   px-4 py-2 rounded border border-white
                   font-bold text-[#2f3f5b] dark:text-white transition-colors bg-transparent no-underline
                   hover:scale-105 transition-transform transition-shadow duration-300
                   shadow-[0_0_5px_rgba(47,63,91,1)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            My Blog
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="inline-flex items-center justify-center
                   px-4 py-2 rounded border border-white
                   font-bold text-[#2f3f5b] dark:text-white transition-colors bg-transparent no-underline
                   hover:scale-105 transition-transform transition-shadow duration-300
                   shadow-[0_0_5px_rgba(47,63,91,1)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          >
            About Me
          </NuxtLink>
        </div>
        <div data-fade class="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm">
          <a
            href="/"
            class="text-gray-700 hover:text-gray-400 dark:text-gray-400 dark:hover:text-white no-underline"
          >
            <i class="iconfont icon-shapes"></i> Apps
          </a>
          <a
            href="mailto:zhengweixin0101@outlook.com"
            class="text-gray-700 hover:text-gray-400 dark:text-gray-400 dark:hover:text-white no-underline"
          >
            <i class="iconfont icon-envelope"></i> Mail
          </a>
          <a
            target="_blank"
            href="https://github.com/zhengweixin0101"
            class="text-gray-700 hover:text-gray-400 dark:text-gray-400 dark:hover:text-white no-underline"
          >
            <i class="iconfont icon-github"></i> Github
          </a>
        </div>
      </div>
      <!-- 头像 -->
      <div data-fade="3" class="w-40 h-40 sm:w-56 sm:h-56 md:w-70 md:h-70 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <img
          src="/avatar.jpg"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover transition-transform duration-300 md:hover:rotate-360"
          draggable="false"
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
</style>
