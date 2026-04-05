# Grok AI

一个基于 xAI Grok-3 的完整 AI 聊天与生图平台，可一键部署到 Vercel。

## ✨ 功能特性

- 💬 **AI 聊天** — 接入 xAI Grok-3，支持流式 SSE 输出，实时打字效果
- 🎨 **AI 生图** — 调用 Aurora 模型，支持多种尺寸与数量，可下载/复制链接
- 🔐 **用户系统** — 注册/登录，JWT 认证（7天有效），bcrypt 加密
- 👑 **管理后台** — 统计卡片、用户列表、封禁/解封/删除用户
- 🌙 **深色/浅色主题** — 一键切换，偏好持久化
- 📱 **完全响应式** — 手机 + 电脑均可正常使用

## 🚀 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sunxuebin0-sys/grok-ai)

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
grok-ai/
├── api/                    # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.js        # 用户登录
│   │   └── register.js     # 用户注册
│   ├── admin/
│   │   ├── stats.js        # 统计数据
│   │   ├── users.js        # 用户列表
│   │   └── ban.js          # 封禁/解封/删除用户
│   ├── chat.js             # AI 聊天（SSE 流式）
│   ├── image.js            # AI 生图
│   └── history.js          # 聊天历史
├── src/
│   ├── pages/
│   │   ├── Login.jsx       # 登录页
│   │   ├── Register.jsx    # 注册页
│   │   ├── Chat.jsx        # 聊天页
│   │   ├── Image.jsx       # 生图页
│   │   └── Admin.jsx       # 管理后台
│   ├── components/
│   │   ├── Header.jsx      # 顶部导航
│   │   └── ProtectedRoute.jsx # 路由守卫
│   ├── styles/
│   │   └── main.css        # 全局样式
│   ├── App.jsx             # 路由配置
│   └── main.jsx            # React 入口
├── index.html
├── package.json
├── vite.config.js
└── vercel.json             # Vercel 部署配置
```

## 🔑 管理员账号

- 用户名：`admin`
- 密码：`admin123`

## 📝 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite 5 |
| 路由 | React Router v6 |
| 后端 | Vercel Serverless Functions (Node.js) |
| AI 聊天 | xAI Grok-3 API（SSE 流式） |
| AI 生图 | xAI Aurora 模型 |
| 认证 | JWT（自定义实现，7天有效） |
| 数据存储 | Vercel `/tmp` 目录（JSON 文件） |
| 样式 | 纯 CSS，深色主题，渐变紫色 |

