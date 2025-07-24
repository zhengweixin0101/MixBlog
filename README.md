# My blog（半成品）

一个使用Vue3+Unocss搭建的个人博客。

本博客是一个究极缝合怪，也是我第一个完全从0开发的项目。

- 背景参考 [小孙同学的个人主页](https://github.com/sun0225SUN/star-trail) 
- 界面参考 [Moeyy的博客](https://moeyy.cn/)



## 特点

- 采用Unocss原子引擎
- 使用阿里巴巴图标库
- 待开发......



## 特性

### 丝滑的浮现动画

​		在开始的元素设定`v-fade-in`属性，需要显示动画的元素添加`data-fade`

​		示例：

```html
<main v-fade-in>
    <H1 data-fade>这是第一个浮现</H1>
    <p data-fade>这是第二个</p>
    <p data-fade>以此类推，依次浮现</p>
</main>
```

​		支持自定义顺序：

```html
<main v-fade-in>
    <H1 data-fade>这是第三个浮现</H1>
    <p data-fade>这是第四个</p>
    <p data-fade="2">这是第三个</p>
    <p data-fade="1">这是第一个</p>
</main>
```

### 待开发......
