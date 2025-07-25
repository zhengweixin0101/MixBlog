<template>
  <main
    v-fade-in
    class="max-w-screen-xl mx-auto min-h-screen flex flex-col justify-center"
  >
    <div
      class="flex flex-col-reverse md:flex-row items-center justify-between w-full gap-10 md:gap-10"
    >
      <!-- 左侧 -->
      <div class="text-center md:text-left">
        <p data-fade class="text-4xl sm:text-5xl font-bold">
          Hi!<span id="wave-hand">👋</span>
        </p>
        <h1
          data-fade
          class="mt-2 text-5xl sm:text-6xl leading-tight break-words"
        >
          I'm
          <span
            class="bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent -webkit-bg-clip-text"
            >ShinX</span
          >
        </h1>
        <p
          data-fade
          class="mt-5 max-w-xl text-#e4e7eb text-base sm:text-lg mx-auto md:mx-0"
        >
          A 📕Student and 🎮Gamer
        </p>

        <div
          data-fade
          class="flex flex-wrap gap-4 mt-10 justify-center md:justify-start"
        >
          <a
            href="/blog"
            class="inline-flex items-center justify-center px-4 py-2 rounded border border-white text-white bg-transparent no-underline hover:scale-105 transition-transform duration-200 shadow-[0_0_9px_rgba(255,255,255,0.5)]"
          >
            My Blog
          </a>
          <a
            href="/about"
            class="inline-flex items-center justify-center px-4 py-2 rounded border border-white text-white bg-transparent no-underline hover:scale-105 transition-transform duration-200 shadow-[0_0_9px_rgba(255,255,255,0.5)]"
          >
            About Me
          </a>
        </div>

        <div
          data-fade
          class="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm"
        >
          <a href="#" class="text-gray-400 hover:text-white no-underline">
            <i class="iconfont icon-shapes"></i> Apps
          </a>
          <a href="#" class="text-gray-400 hover:text-white no-underline">
            <i class="iconfont icon-envelope"></i> Mail
          </a>
          <a href="#" class="text-gray-400 hover:text-white no-underline">
            <i class="iconfont icon-github"></i> Github
          </a>
        </div>
      </div>

      <!-- 头像 -->
      <div data-fade="3" class="w-40 h-40 sm:w-56 sm:h-56 md:w-70 md:h-70">
        <img
          src="/avatar.jpg"
          alt="Avatar"
          class="rounded-full w-full h-full object-cover"
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
