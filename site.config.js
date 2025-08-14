export const siteConfig = {
    title: "ShinX's Blog",
    description: "This is ShinX’s blog, created by a student and a gamer.",
    keywords: "ShinX,zhengweixin,blog,ShinX的个人主页,ShinX的个人网站,ShinX的博客",
    url: "https://zhengweixin.top",
    author: {
        name: "ShinX",
        avatar: "https://zhengweixin.top/avatar.jpg",
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
        postsList: "https://zhengweixin.top/data/posts-list.json",
        postContent: "https://zhengweixin.top/data/posts",
        mdList: 'https://zhengweixin.top/data/md-file.json',
    },

    thirdParty: {
        iconfont: '//at.alicdn.com/t/c/font_4401174_umvp1qw3wc.css',
    },
}