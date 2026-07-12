export const siteConfig = {
    apiUrl: 'https://blog.api.zhengweixin.top',
    title: "ShinX - 我的个人主页",
    description: "Hi，欢迎访问本站！这是我的个人主页，我会在这里发布一些奇思妙想的文章。这里记录了我的学习、生活中的点点滴滴。",
    keywords: "ShinX,zhengweixin,blog,ShinX的个人主页,ShinX的博客",
    url: "https://zhengweixin.top",

    icons: [
        { rel: 'icon', type: 'image/png', href: 'https://cdn.zhengweixin.top/favicon/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: 'https://cdn.zhengweixin.top/favicon/favicon.svg' },
        { rel: 'shortcut icon', href: 'https://cdn.zhengweixin.top/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', href: 'https://cdn.zhengweixin.top/favicon/apple-touch-icon.png', sizes: '180x180' },
    ],

    author: {
        name: "ShinX",
        avatar: "https://cdn.zhengweixin.top/avatar.jpg",
        description: "A 📕Student and 🎮Gamer.",
    },

    socialLinks: [
        { icon: 'icon-envelope', text: 'Mail', href: 'mailto:zhengweixin0101@outlook.com', external: true, },
        { icon: 'icon-github', text: 'Github', href: 'https://github.com/zhengweixin0101', external: true, },
        { icon: 'icon-rss', text: 'RSS', href: '/rss.xml', external: true, },
    ],

    navItems: [
        { label: '主页', href: '/', icon: 'icon-portalIndex' },
        { label: '文章', href: '/posts', icon: 'icon-Pen' },
        { label: '音乐', href: '/music', icon: 'icon-Music' },
        { label: '友链', href: '/links', icon: 'icon-link' },
        { label: '说说', href: '/talks', icon: 'icon-wodeshuoshuo' },
        { label: '关于', href: '/about', icon: 'icon-guanyu' },
    ],

    donate: [
        {
            name: '微信',
            qrCode: "https://cdn.zhengweixin.top/donation-QR-code/wechatpay.png",
        },
        {
            name: '支付宝',
            qrCode: "https://cdn.zhengweixin.top/donation-QR-code/alipay.png",
        }
    ],

    thirdParty: {
        iconfont: '//at.alicdn.com/t/c/font_4401174_q1ppvsm0q1.css',
        twikooEnvId: "https://twikoo.api.zhengweixin.top",
        umami: {
            js: 'https://statistics.zhengweixin.top/script.js',
            siteID: '7441ce23-3587-41b6-8919-e42932fc65d7',
        }
    },
}