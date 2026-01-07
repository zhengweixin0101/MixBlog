<template>
  <div class="w-full border border-dashed border-gray-500 mt-10 mb-8"></div>
  <span class="inline-flex items-center text-2xl font-bold mb-2">
    <span class="iconfont icon-comment mr-2"></span>
    评论
  </span>
  <div id="tcomment"></div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import { siteConfig } from '@/siteConfig/main.js'

onMounted(async () => {
  await nextTick()
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.min.js'
  script.async = true
  document.body.appendChild(script)

  script.onload = () => {
    twikoo.init({
      envId: siteConfig.thirdParty.twikooEnvId,
      el: '#tcomment'
    })
  }
})
</script>

<style>
.tk-comments {
  transition: all 0.3s ease;
}

/* 输入框样式 */
.el-input-group {
  border-radius: 12px;
  border: 0.1px solid #2f3f5b30;
}

.el-input-group:focus-within {
  border: 1.5px solid #2f3f5b99;
}

html.dark .el-input-group {
  border-color: #ffffff30;
}

html.dark .el-input-group:focus-within {
  border-color: #ffffff99;
}

.twikoo .el-input-group__prepend {
  border-radius: 12px 0 0 12px;
  border: none;
}

.twikoo .el-input__inner {
  border-radius: 0 12px 12px 0;
  border: none;
  background-color: #fff !important;
}

html.dark .twikoo .el-input__inner {
  background-color: #ffffff10 !important;
}

.el-textarea__inner {
  border-radius: 12px !important;
  background-color: #fff !important;
}

html.dark .el-textarea__inner {
  background-color: #ffffff10 !important;
}

.el-textarea__inner:focus-within {
  border: 1.5px solid #2f3f5b99 !important;
}

html.dark .el-textarea__inner:focus-within {
  border: 1.5px solid #ffffff99 !important;
}

/* 表情面板样式 */
.OwO-body {
  border-radius: 12px !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px) !important;
  transition: all 0.2s ease;
  cursor: default;
  transform: translateY(-20px);
}

.OwO.OwO-open .OwO-body {
  display: block;
  animation: showOwO 0.3s cubic-bezier(0.42, 0, 0.3, 1.11) forwards;
}

@keyframes showOwO {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

html.dark .OwO-body {
  background-color: rgba(000, 000, 000, 0.8) !important;
}

.OwO-item {
  min-height: 30px;
  cursor: pointer;
  border-radius: 8px !important;
  padding: 4px !important;
}

html.dark .OwO-item {
  color: #FFF !important;
}

.OwO-item:hover {
  box-shadow: 0 0 8px rgba(0,0,0,0.3) !important;
}

.OwO-bar {
  display: flex !important;
  justify-content: center !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 0 0 12px 12px !important;
  padding: 4px 0;
  margin-top: 4px;
}

html.dark .OwO-bar {
  background-color: rgba(000, 000, 000, 0.6) !important;
}

.OwO-packages li {
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

html.dark .OwO-packages li {
  color: white;
}

.OwO-packages li.OwO-package-active,
.OwO-packages li:hover {
  background-color: #14c087 !important;
  color: #fff;
}

html.dark .OwO-packages li.OwO-package-active,
html.dark .OwO-packages li:hover {
  background: none !important;
  color: #14c087;
}

/* 按钮样式 */
.tk-comments-title svg, .tk-action svg {
  fill: #2f3f5b !important;
}

html.dark .tk-comments-title svg, html.dark .tk-action svg {
  fill: #ffffffdb !important;
}

.tk-preview,
.tk-send {
  border-radius: 8px !important;
}

/* 评论区样式 */
.tk-avatar {
  border-radius: 999px !important;
  box-shadow: 0 0 3px rgba(0,0,0,0.3);
}

.el-loading-spinner .circular .path {
  stroke: #2f3f5b;
}

html.dark .el-loading-spinner .circular .path {
  stroke: #ffffff;
}

.tk-ruser,
.tk-action-count,
.tk-extra-text,
.tk-actions a {
  color: #2f3f5b;
}

html.dark .tk-ruser,
html.dark .tk-action-count,
html.dark .tk-extra-text,
html.dark .tk-actions a {
  color: #FFFFFF;
}

.tk-extras {
margin-top: -15px;
}

.tk-extra {
  padding: 5px;
  border-radius: 8px;
  box-shadow: 0 0 2px rgba(0,0,0,0.3);
}

html.dark .tk-extra {
  box-shadow: 0 0 2px rgba(255,255,255,0.3);
}

html.dark .tk-extra-text {
  color: #FFF;
}

.tk-icon svg path {
  fill: #2f3f5b;
}

html.dark .tk-icon svg path {
  fill: #FFF;
}

.tk-comment {
  padding: 1rem;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 0 2px rgba(0,0,0,0.2);
}

html.dark .tk-comment {
  background: #ffffff10;
}

.tk-replies .tk-comment {
  box-shadow: none;
  background: none;
  border-top: 2px dashed rgba(0,0,0,0.1);
}

html.dark .tk-replies .tk-comment {
  box-shadow: none;
  background: none;
  border-top: 2px dashed rgba(255, 255, 255, 0.1);
}

.twikoo .tk-footer {
  display: none;
}

/* 评论内容样式 */
.tk-content blockquote {
  background-color: rgba(255, 255, 255, 0.02);
  padding: 0rem 1rem;
  margin-bottom: -5px;
  border-radius: 12px;
  font-style: italic;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
}

html.dark .tk-content blockquote {
  background: rgba(255, 255, 255, 0.01);
  box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.2);
}

.tk-content img {
  margin-top: 5px;
  border-radius: 4px;
  display: block;
  cursor: pointer;
  max-width: 100px !important;
}
</style>
