---
title: 在博客中添加 Umami 数据展示
date: 2025-08-17
tags:
  - 前端
  - 实用教程
description: 使用 Umami API 在 Nuxt 博客中展示访问统计数据。
slug: use-umami-api-on-nuxt
---

最近，我在使用 **Nuxt** 重构我的博客。在 [关于](/about) 页面上，我参考了 [安知鱼](https://blog.anheyu.com/about/) 的布局。其中有一个访问数据统计卡片，原本使用的是 51LA。起初我也尝试过在 Nuxt 中添加它，但发现官方挂件在 Nuxt 中不好直接使用。

![安知鱼-访问统计](https://cdn.zhengweixin.top/blog/posts/612e9ddb40fe4c3b8f02910c93817ee9.png)

尝试无果后，我想到了自己两年前搭建的 [Umami](https://umami.is/) 统计服务。

## Umami 搭建

我使用的是 Vercel 部署，搭建步骤如下（你也可以选择其他服务商）：

1. Fork 官方 GitHub 仓库 [umami-software/umami](https://github.com/umami-software/umami)。

2. 在 Vercel 中创建数据库：
   - 打开 **Storage** 选项卡，创建 PostgreSQL 数据库。
   
   ![vercel-storage](https://cdn.zhengweixin.top/blog/posts/34df58bdbb98404cb8b82dbc55ac356d.png)

3. 新建项目，选择刚 fork 的仓库。
   - 添加环境变量 `DATABASE_URL`，值为刚创建的数据库地址。例如：
     ```
     postgresql://username:password@localhost:5432/mydb
     ```
     

到这里，Umami 就部署完成了。本文重点不在部署细节，所以这里只简单说明 😺。

## API 简介

Umami 提供了丰富的 API，可参考 [官方文档](https://umami.is/docs/api/authentication)。

| API                                   | 功能             |
| ------------------------------------ | ---------------- |
| POST /api/auth/login                  | 获取用户信息     |
| GET /api/websites/:websiteId          | 获取网站信息     |
| GET /api/websites/:websiteId/stats    | 获取访问量       |
| GET /api/websites/:websiteId/metrics  | 获取文章阅读量   |

## 获取 Token

使用 API 之前，需要先获取账号 **Token**。  
通过 `POST /api/auth/login` 发送账号密码即可获取：

```json
{
  "username": "your-username",
  "password": "your-password"
}
```

返回示例：


```json
{
  "token": "Mcfd5PaVC4cMDSJw51j...dvM+gvwvuDw==",
  "user": {
    "id": "7d7cf1f3-4d81-4a6b-8257-57a2ee4629a2",
    "username": "visitor",
    "createdAt": "2025-08-17T03:19:58.646Z"
  }
}
```

这里分享一个简单的 Python 脚本示例，用于获取 Token：

```python
import requests

# Umami API 地址
UMAMI_URL = 'https://statistics.zhengweixin.top'

# 账号密码
USERNAME = '******'
PASSWORD = '******'

def get_token():
    login_url = f"{UMAMI_URL}/api/auth/login"
    payload = {
        "username": USERNAME,
        "password": PASSWORD
    }
    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(login_url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("token")
        user_info = data.get("user")
        print("Token:", token)
        print("User info:", user_info)
        return token
    else:
        print(f"Failed to get token: {response.status_code} {response.text}")
        return None

if __name__ == "__main__":
    get_token()

```

## 在 Nuxt 页面中使用 API

获取到 Token 后，在需要使用的页面中添加如下代码：

```javascript
// 配置
const UMAMI_URL = 'https://statistics.zhengweixin.top'; //Umami链接
const WEBSITE_ID = '7441ce23-3587-41b6-8919-e42932fc65d7'; //站点ID
const TOKEN = '你的Token';
const CREATED_AT = '2025-08-15T16:00:00.000Z'; //网站创立时间

const statsToday = ref(null);
const statsYesterday = ref(null);
const statsTotal = ref(null);
const error = ref(null);

function getDayTimestamps(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start: start.getTime(), end: end.getTime() };
}

onMounted(async () => {
  try {
    const createdAtTs = new Date(CREATED_AT).getTime();
    const now = Date.now();

    // 今日
    const { start: startToday, end: endToday } = getDayTimestamps();
    statsToday.value = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startToday}&endAt=${endToday}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json());

    // 昨日
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { start: startYesterday, end: endYesterday } = getDayTimestamps(yesterday);
    statsYesterday.value = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${startYesterday}&endAt=${endYesterday}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json());

    // 总量
    statsTotal.value = await fetch(`${UMAMI_URL}/api/websites/${WEBSITE_ID}/stats?startAt=${createdAtTs}&endAt=${now}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(res => res.json());

  } catch (e) {
    error.value = e.message;
  }
});
```

页面中可用变量：

|                                |              |
| ------------------------------ | ------------ |
| statsToday.visitors.value      | 今日访问人数 |
| statsToday.pageviews.value     | 今日访问量   |
| statsYesterday.visitors.value  | 昨日访问人数 |
| statsYesterday.pageviews.value | 昨日访问量   |
| statsTotal.pageviews.value     | 本月访问总量 |
| statsTotal.pageviews.value     | 总访问量     |

