export const linksConfig = {
    /**
     * ==================== 板块列表 ====================
     * 每个板块内所有条目的字段须保持一致（以首条为准自动推断布局类型）。
     *
     * 可用字段：
     *   name        (必填)  名称
     *   link        (可选)  跳转链接
     *   description (可选)  描述
     *   avatar      (可选)  头像
     *   screenshot  (可选)  站点截图
     *
     * 布局自动推断规则：
     *   screenshot 存在                  → full        截图+ 名称描述
     *   avatar 存在，description 不存在  → avatar-only 头像 + 名称
     *   avatar 存在，description 存在    → avatar-desc 头像 + 名称 + 描述
     *   仅 name + description           → desc-only   名称 + 描述
     *   name + description + link       → no-avatar   名称 + 描述
     */

    sections: [
        {
            title: '推荐博客',
            description: '我的博客有些地方借鉴了以下部分大佬的博客，非常感谢他们！',
            items: [
                {
                    name: 'Moeyy',
                    description: '一条有远大梦想的咸鱼。',
                    link: 'https://moeyy.cn/',
                    avatar: 'https://cdn.moeyy.cn/no_referer/logo/logo-2022-11.png/moeyy_webp',
                    screenshot: 'https://image.thum.io/get/https://moeyy.cn/',
                },
                {
                    name: '安知鱼',
                    description: '生活明朗，万物可爱。',
                    link: 'https://blog.anheyu.com/',
                    avatar: 'https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg',
                    screenshot: 'https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg',
                },
                {
                    name: 'Guoqi Sun',
                    description: '尝试，失败，重试。这就是成长的节奏。',
                    link: 'https://blog.guoqi.dev/',
                    avatar: 'https://files.guoqi.dev/favicon.ico',
                    screenshot: 'https://image.thum.io/get/https://blog.guoqi.dev/',
                },
            ],
        },

        {
            title: '小伙伴们',
            description: '以下是一群有趣的博主，欢迎交换友链~',
            items: [

            ],
        },

        {
            title: '应用',
            description: '我开发或部署的一些小项目',
            items: [
                {
                    name: 'Umami',
                    description: '自建访问统计',
                    link: 'https://statistics.zhengweixin.top/share/6FBrEjH0q8vcrGxh/zhengweixin.top',
                },
                {
                    name: '站点监测',
                    description: '监测我的所有网站的在线状态',
                    link: 'https://status.zhengweixin.top',
                },
                {
                    name: 'Music',
                    description: '第三方网易云音乐播放器',
                    link: 'https://music.zhengweixin.top',
                },
                {
                    name: "ShinX's Pan",
                    description: '我的个人网盘',
                    link: 'https://pan.zhengweixin.top/@s/avAs2XK8',
                },
                {
                    name: '123Pan',
                    description: '123网盘浏览器无限制下载',
                    link: 'https://123pan.zhengweixin.top',
                },
                {
                    name: 'Google Dino',
                    description: '谷歌浏览器离线小恐龙在线版',
                    link: 'https://dino.zhengweixin.top',
                },
                {
                    name: 'Github Proxy',
                    description: 'Github 文件下载代理',
                    link: 'https://gh-proxy.zhengweixin.top',
                },
            ],
        },
    ],
}
