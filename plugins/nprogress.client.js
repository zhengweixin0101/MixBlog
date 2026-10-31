import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 100,
    minimum: 0.08,
})

if (process.client) {
    const style = document.createElement('style')
    style.innerHTML = `
  #nprogress .bar {
    background: linear-gradient(270deg, var(--accent), var(--accent-2), var(--accent));
    background-size: 200% 100%;
    height: 3px !important;
    border-radius: 2px;
    box-shadow: 0 0 8px var(--accent), 0 0 4px var(--accent-2);
    transition: width 0.3s ease;
    z-index: 800;
  }
  #nprogress .peg {
    box-shadow: 0 0 15px var(--accent), 0 0 10px var(--accent-2) !important;
    opacity: 0.8;
    transform: rotate(3deg) translate(0px, -4px);
  }
  `
    document.head.appendChild(style)
}

export default defineNuxtPlugin((nuxtApp) => {
    let timer = null
    let isLoading = false
    let currentProgress = 0

    function smoothIncrement() {
        if (!isLoading) return
        currentProgress = Math.min(currentProgress + Math.random() * 0.03, 0.95)
        NProgress.set(currentProgress)
        timer = setTimeout(smoothIncrement, 200)
    }

    function startProgress() {
        if (!isLoading) {
            isLoading = true
            currentProgress = 0.1
            NProgress.set(currentProgress)
            NProgress.start()
            smoothIncrement()
        }
    }

    function doneProgress() {
        if (isLoading) {
            clearTimeout(timer)
            NProgress.set(1)
            setTimeout(() => {
                NProgress.done()
                isLoading = false
                currentProgress = 0
            }, 300)
        }
    }

    nuxtApp.hook('page:start', () => {
        startProgress()
    })

    nuxtApp.hook('page:finish', () => {
        doneProgress()
    })
})
