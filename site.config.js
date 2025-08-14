export const siteConfig = {
    title: "ShinX's Blog",
    description: "This is ShinX’s blog, created by a student and a gamer.",
    keywords: "ShinX,zhengweixin,blog,ShinX的个人主页,ShinX的个人网站,ShinX的博客",
    url: "https://zhengweixin.top",
    author: {
        name: "ShinX",
        avatar: "https://blog-zwx.netlify.app/avatar.jpg",
        description: "A 📕Student and 🎮Gamer",
    },
    socialLinks: [
        { icon: 'icon-shapes', text: 'Apps', href: '/', external: false, },
        { icon: 'icon-envelope', text: 'Mail', href: 'mailto:zhengweixin0101@outlook.com', external: false, },
        { icon: 'icon-github', text: 'Github', href: 'https://github.com/zhengweixin0101', external: true, },
    ],
    navItems: [
        { label: 'Home', href: '/', icon: 'icon-portalIndex' },
        { label: 'Posts', href: '/posts', icon: 'icon-Pen' },
        { label: 'About', href: '/about', icon: 'icon-about1' },
    ],
    postsData: {
        postsList: "https://blog-zwx.netlify.app/data/posts-list.json",
        postContent: "https://blog-zwx.netlify.app/data/posts"
    },

    thirdParty: {
        iconfont: '//at.alicdn.com/t/c/font_4401174_umvp1qw3wc.css',
    },
}