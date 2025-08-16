<template>
  <div class="w-full border border-dashed border-gray-500 mt-10 mb-5"></div>
  <div id="tcomment"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { siteConfig } from '@/siteConfig/main.js'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.min.js'
  script.async = true
  document.body.appendChild(script)

  script.onload = () => {
    twikoo.init({
      envId: siteConfig.thirdParty.twikooEnvId,
      el: '#tcomment',
    })
  }
})
</script>


<style>
.twikoo {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  transition: background-color 300ms ease;
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.15);
}

html.dark .twikoo {
  background: #1E1E1E;
  box-shadow: 0 0 1px 1px rgba(255, 255, 255, 0.15);
}

.twikoo .tk-meta-input input:focus, textarea:focus {
    outline: none;
    border-color: #00e69990;
}

.twikoo .el-textarea textarea:focus {
  outline: none;
  border-color: #00e69990;
}

.tk-send:not(.is-disabled) {
  background-color: #27a160 !important;
  border-color: #27a160 !important;
  color: #ffffff !important;
}

.tk-send:not(.is-disabled):hover {
  background-color: #1f8650 !important;
  border-color: #1f8650 !important;
}

.tk-send.is-disabled {
  background-color: #27a160 !important;
  border-color: #27a160 !important;
  color: #ffffff !important;
  opacity: 0.5;
  cursor: not-allowed;
}

.tk-preview:hover {
  border-color: #27a160 !important;
  color: #27a160 !important;
}

.tk-icon svg, .tk-action svg {
  fill: #00e699 !important;
}

.tk-tag-green {
  color: #27a160 !important;
  border-color: #27a160 !important;
}

.twikoo .tk-footer {
  display: none;
}
</style>
