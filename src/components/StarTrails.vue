<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref(null)
let helpCanvas, helpContext, showContext
let animationId
let showWidth, showHeight, longSide
const stars = []

function rand(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function randomColor() {
  const r = rand(120, 255)
  const g = rand(120, 255)
  const b = rand(120, 255)
  const a = rand(30, 100) / 100
  return `rgba(${r},${g},${b},${a})`
}

function createStar() {
  return {
    x: rand(-helpCanvas.width / window.devicePixelRatio, helpCanvas.width / window.devicePixelRatio),
    y: rand(-helpCanvas.height / window.devicePixelRatio, helpCanvas.height / window.devicePixelRatio),
    size: 1.2,
    color: randomColor(),
  }
}

function drawStars() {
  helpContext.clearRect(0, 0, helpCanvas.width, helpCanvas.height)
  stars.forEach(star => {
    helpContext.beginPath()
    helpContext.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    helpContext.fillStyle = star.color
    helpContext.closePath()
    helpContext.fill()
  })
}

function resize() {
  if (!canvas.value) return
  const show = canvas.value

  const dpr = window.devicePixelRatio || 1
  showWidth = show.clientWidth
  showHeight = show.clientHeight

  show.width = showWidth * dpr
  show.height = showHeight * dpr
  show.style.width = showWidth + 'px'
  show.style.height = showHeight + 'px'

  longSide = Math.max(showWidth, showHeight)

  helpCanvas.width = longSide * 2 * dpr
  helpCanvas.height = longSide * 2 * dpr

  helpContext.setTransform(1, 0, 0, 1, 0, 0)
  helpContext.clearRect(0, 0, helpCanvas.width, helpCanvas.height)
  helpContext.scale(dpr, dpr)

  stars.length = 0

  const baseStarCount = 6000
  const densityFactor = Math.min(window.innerWidth, window.innerHeight) / 800
  const maxStarCount = 10000

  const starCount = Math.min(
    Math.floor(baseStarCount * densityFactor),
    maxStarCount
  )

  for (let i = 0; i < starCount; i++) {
    stars.push(createStar())
  }

  drawStars()

  showContext.setTransform(1, 0, 0, 1, 0, 0)
  showContext.clearRect(0, 0, show.width, show.height)
  showContext.scale(dpr, dpr)

  if (showWidth < showHeight) {
    showContext.translate(showWidth, showHeight)
  } else {
    showContext.translate(showWidth, 0)
  }
}

let lastDraw = 0
const targetInterval = 1000/15

function loop(timestamp = 0) {
  if (timestamp - lastDraw > 1000 / 15) {
    showContext.drawImage(
      helpCanvas,
      -helpCanvas.width / (2 * (window.devicePixelRatio || 1)),
      -helpCanvas.height / (2 * (window.devicePixelRatio || 1))
    )

    loop.drawTimes = (loop.drawTimes || 0) + 1

    if (loop.drawTimes > 200 && loop.drawTimes % 16 === 0) {
      showContext.fillStyle = 'rgba(0,0,0,0.04)'
      showContext.fillRect(-(longSide * 3), -(longSide * 3), longSide * 6, longSide * 6)
    }

    showContext.rotate((0.06 * Math.PI) / 180)

    lastDraw = timestamp
  }

  animationId = requestAnimationFrame(loop)
}

function animate() {
  animationId = requestAnimationFrame(() => {
    loop()
    animate()
  })
}

onMounted(() => {
  if (!canvas.value) return
  helpCanvas = document.createElement('canvas')
  helpContext = helpCanvas.getContext('2d')
  showContext = canvas.value.getContext('2d')

  resize()
  window.addEventListener('resize', resize)

  animate()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="w-full h-full block bg-[#0e1111]"
  />
</template>