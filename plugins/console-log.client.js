import { defineNuxtPlugin } from '#app'
import { siteConfig } from '@/siteConfig/main.js'

export default defineNuxtPlugin(() => {
    console.log(`%c 欢迎访问 ${siteConfig.title}!`, "color:#425AEF; font-weight:bold")
    console.log(`%c 开发者模式已打开，请遵循GPL协议`, "color:#f00000; font-weight:bold")
})
