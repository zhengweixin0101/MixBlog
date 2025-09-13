<template>
  <div class="w-full border border-dashed border-gray-500 mt-10 mb-15"></div>
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
.twikoo .tk-meta-input input:focus, textarea:focus, .el-textarea textarea:focus {
    outline: none;
    border-color: #2dc866;
}

html.dark .twikoo .tk-meta-input input:focus, textarea:focus, .el-textarea textarea:focus {
  border-color: #2dc86690 !important;
}

.tk-send:not(.is-disabled) {
  background-color: #2dc866 !important;
  border-color: #2dc866 !important;
  color: #ffffff !important;
}

.tk-send:not(.is-disabled):hover {
  background-color: #2dc86699 !important;
  border-color: #2dc86699 !important;
}

.tk-send.is-disabled {
  background-color: #2dc866 !important;
  border-color: #2dc866 !important;
  color: #ffffff !important;
  opacity: 0.5;
  cursor: not-allowed;
}

.tk-preview:hover, .tk-preview:focus {
  border-color: #2dc866 !important;
  color: #2dc866 !important;
}

.tk-comments-title svg, .tk-action svg {
  fill: #2dc866 !important;
}

.tk-extras {
  fill: 0 0 rgb(0 0 0 / 0) !important;
}

.tk-tag-green {
  color: #2dc866 !important;
  border-color: #2dc866 !important;
}

.tk-action-count {
  color: #2dc866 !important;
}

.tk-time {
  opacity: 0.8 !important;
}

.tk-ruser {
  color: #2f3f5b;
  text-decoration: none;
  transition: color 0.3s, background-color 0.3s, border-color 0.3s;
}

html.dark .tk-ruser {
  color: #fff;
  text-decoration: none;
}

.tk-content img {
  margin-top: 5px;
  border-radius: 4px;
  display: block;
  cursor: pointer;
  max-width: 100px !important;
}

.twikoo .tk-footer {
  display: none;
}
</style>
