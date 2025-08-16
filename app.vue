<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useHead } from '#imports'
import { siteConfig } from '@/siteConfig/main.js'

useHead({
  titleTemplate: siteConfig.title,
  meta: [
    { charset: 'utf-8' },
    { name: 'robots', content: 'follow, index' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },

    { name: 'description', content: siteConfig.description },
    { name: 'author', content: siteConfig.author.name },
    { name: 'keywords', content: siteConfig.keywords },

    { name: 'color-scheme', content: 'only light' },
    { name: 'theme-color', content: '#f8f8f8', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#0e1111', media: '(prefers-color-scheme: dark)' },
    { name: 'apple-mobile-web-app-title', content: 'ShinX' },
    { name: 'autmobile-web-app-capablehor', content: 'yes' },

    { property: 'og:title', content: siteConfig.title },
    { property: 'og:description', content: siteConfig.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: siteConfig.url },
    { name: 'twitter:title', content: siteConfig.title },
    { name: 'twitter:description', content: siteConfig.description },
    { name: 'twitter:card', content: 'summary' }
  ],

  link: [
      ...siteConfig.icons,
    { rel: 'alternate', type: 'application/rss+xml', title: `${siteConfig.title} RSS`, href: '/rss.xml' },
    { rel: 'stylesheet', href: siteConfig.thirdParty.iconfont },
  ],

  script: [
    {
      innerHTML: `!function(p){!function(t){var s=window,e=document,i=p,c="".concat("https:"===e.location.protocol?"https://":"http://","sdk.51.la/js-sdk-pro.min.js"),n=e.createElement("script"),r=e.getElementsByTagName("script")[0];n.type="text/javascript",n.setAttribute("charset","UTF-8"),n.async=!0,n.src=c,n.id="LA_COLLECT",i.d=n;var o=function(){s.LA.ids.push(i)};s.LA?s.LA.ids&&o():(s.LA=p,s.LA.ids=[],o()),r.parentNode.insertBefore(n,r)}()}({id:"${siteConfig.thirdParty.s51LA.id}",ck:"${siteConfig.thirdParty.s51LA.ck}",autoTrack:true,hashMode:true,screenRecord:true});`,
      type: "text/javascript"
    }
  ],
  __dangerouslyDisableSanitizers: ['script']
})
</script>