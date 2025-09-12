import { defineNuxtPlugin } from '#app'

function parseIndex(raw) {
  if (raw == null) return NaN
  const cleaned = String(raw).normalize('NFKC').replace(/[^\d]/g, '')
  if (!cleaned) return NaN
  const n = parseInt(cleaned, 10)
  return n > 0 ? n : NaN
}

function applyFadeIn(root) {
  const items = Array.from(root.querySelectorAll('[data-fade]'))
  const N = items.length
  const final = new Array(N).fill(null)

  items.forEach((el) => {
    const idx = parseIndex(el.getAttribute('data-fade'))
    if (!Number.isNaN(idx)) {
      let pos = Math.min(idx - 1, N - 1)
      while (pos < N && final[pos]) pos++
      if (pos >= N) {
        for (let i = N - 1; i >= 0; i--) {
          if (!final[i]) { final[i] = el; break }
        }
      } else {
        final[pos] = el
      }
      el.__fadePlaced = true
    }
  })

  let cursor = 0
  items.forEach((el) => {
    if (!el.__fadePlaced) {
      while (cursor < N && final[cursor]) cursor++
      if (cursor < N) final[cursor++] = el
    }
    delete el.__fadePlaced
  })

  final.forEach((el, i) => {
    if (el) el.style.animationDelay = `${(i + 1) * 0.02}s`
  })

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        root.classList.add('fade-in-start')
        io.unobserve(root)
      }
    },
    { threshold: 0.05 }
  )
  io.observe(root)
}

export default defineNuxtPlugin((nuxtApp) => {
  const fadeIn = {
    mounted(root) {
      applyFadeIn(root)
    },
    updated(root) {
      applyFadeIn(root)
    }
  }

  nuxtApp.vueApp.directive('fade-in', fadeIn)
})