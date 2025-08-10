import { defineNuxtPlugin } from '#app'
import fadeIn from '~/directives/fade-in.js'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('fade-in', fadeIn)
})
