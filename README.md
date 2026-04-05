# Grok AI 图片生成器

一个基于 xAI Grok API 的 AI 图片生成网站，使用 React + Vite 构建，部署在 Vercel 上。

## ✨ 功能特性

- 🎨 **AI 图片生成**：输入描述文字，使用 `grok-2-image` 模型生成高质量图片
- 📐 **多种尺寸**：方形（1024×1024）、横版（1792×1024）、竖版（1024×1792）
- 🔢 **批量生成**：支持一次生成 1、2 或 4 张图片
- 📥 **图片操作**：下载、复制链接、查看原图
- 🕐 **历史记录**：本地存储生成历史（最多 50 条），支持清空
- 🌙 **主题切换**：暗色/亮色主题自由切换
- 📱 **响应式设计**：完美支持手机和桌面端

## 🚀 部署到 Vercel

### 1. Fork 本仓库

点击右上角 **Fork** 按钮，将仓库 Fork 到你的 GitHub 账号。

### 2. 在 Vercel 部署

1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 **New Project**，导入你 Fork 的仓库
3. 构建设置会自动识别（Vite 框架）
4. **⚠️ 在部署前，必须设置环境变量（见下一步）**

### 3. 设置环境变量

在 Vercel 项目设置中，进入 **Settings → Environment Variables**，添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GROK_API_KEY` | `xai-xxxxxxxx...` | 你的 xAI Grok API Key |

> 💡 **如何获取 API Key**：访问 [console.x.ai](https://console.x.ai)，登录后在 API Keys 页面创建新的 Key。

### 4. 重新部署

设置环境变量后，点击 **Redeploy** 使配置生效。

## 🛠️ 本地开发

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env.local` 文件（不会被提交到 Git）：

```env
GROK_API_KEY=xai-你的API密钥
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可预览。

> **注意**：本地开发时，Vite 会将 `/api` 请求代理到 `http://localhost:3001`。如需在本地测试 API，可安装 `vercel-cli` 并运行 `vercel dev`。

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
├── api/
│   └── image.js          # Vercel Serverless Function，代理 Grok API
├── src/
│   ├── App.jsx           # 主应用组件（单页）
│   ├── main.jsx          # React 入口
│   ├── components/
│   │   ├── ImageGenerator.jsx   # 生图表单
│   │   ├── ImageGallery.jsx     # 图片画廊展示
│   │   ├── ImageHistory.jsx     # 历史记录
│   │   └── ThemeToggle.jsx      # 主题切换
│   └── styles/
│       └── main.css      # 全局样式
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## 🔐 安全说明

- **API Key 不会暴露给前端**：所有 Grok API 请求通过后端 Serverless Function（`api/image.js`）代理，浏览器端无法直接访问 API Key
- API Key 通过环境变量 `process.env.GROK_API_KEY` 在服务端读取
- 如果曾经将 API Key 硬编码在代码中并推送到公开仓库，请立即到 [console.x.ai](https://console.x.ai) 撤销旧 Key 并生成新 Key

## 📄 许可证

MIT
