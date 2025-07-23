<template>
  <main class="max-w-screen-xl mx-auto min-h-screen flex flex-col justify-center" style="margin-top: -80px;">
    <div class="flex flex-col md:flex-row items-center justify-between w-full">
      <!-- 左侧 -->
      <div>
        <p data-fade="1" class="text-5xl font-bold">Hi!<span id="wave-hand">👋</span></p>
        <h1 data-fade="2" class="mt-2 text-6xl">I'm <span class="bg-gradient-to-r from-[#00e699] to-[#00e2d8] bg-clip-text text-transparent -webkit-bg-clip-text">ShinX</span></h1>
        <p data-fade="3" class="mt-5 max-w-4xl text-#e4e7eb text-lg">A 📕Student and 🎮Gamer</p>
        <div class="flex flex-wrap gap-4 mt-8 ml-2">
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
        <div class="flex space-x-4 text-gray-400 text-sm">
          <a href="#" class="hover:text-white">Apps</a>
          <a href="#" class="hover:text-white">Mail</a>
          <a href="#" class="hover:text-white">Github</a>
        </div>
      </div>

      <!-- 右侧头像 -->
      <div class="w-40 h-40 md:w-52 md:h-52 md:mt-0 flex-shrink-0">
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
  0% { transform: rotate(0deg); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-8deg); }
  40% { transform: rotate(14deg); }
  50% { transform: rotate(-4deg); }
  60% { transform: rotate(10deg); }
  70% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

#wave-hand {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: wave 2s ease-in-out 1;
  animation-delay: 0.5s;
  animation-fill-mode: forwards;
}
</style>