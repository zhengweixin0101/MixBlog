import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 150,
    minimum: 0.08,
})

if (process.client) {
    const style = document.createElement('style')
    style.innerHTML = `
    #nprogress .bar {
      background: linear-gradient(270deg, #00e699, #00e2d8, #00e699);
      background-size: 200% 100%;
      height: 3px !important;
      transition: all 0.4s ease;
      animation: flow 3s linear infinite;
      border-radius: 2px;
      box-shadow: 0 0 8px #00e699, 0 0 4px #00e2d8;
    }
    #nprogress .peg {
      box-shadow: 0 0 15px #00e699, 0 0 10px #00e2d8 !important;
      opacity: 0.8;
      transform: rotate(3deg) translate(0px, -4px);
    }
    @keyframes flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
  `
    document.head.appendChild(style)
}

export default defineNuxtPlugin((nuxtApp) => {
    let timer = null
    let isLoading = false

    function startProgress() {
        if (!isLoading) {
            isLoading = true
            NProgress.start()
        }
    }

    function doneProgress() {
        if (isLoading) {
            clearTimeout(timer)
            timer = setTimeout(() => {
                NProgress.done()
                isLoading = false
            }, 100)
        }
    }

    nuxtApp.hook('page:start', () => {
        startProgress()
    })

    nuxtApp.hook('page:finish', () => {
        doneProgress()
    })
})
