# VanScii(c) — Personal Website

一个安静的个人存档网站，包含**摄影作品集**和**物理/数学笔记**两部分内容。

## 技术栈

| 类别 | 技术 |
|------|------|
| 构建工具 | Vite 6 |
| UI 框架 | React 18 |
| 路由 | React Router v7 |
| 样式 | Tailwind CSS 4 + `@tailwindcss/vite` 插件 |
| 动画 | motion (Framer Motion) |
| 图标 | lucide-react |
| 数学渲染 | MathJax 2.7 (CDN 动态加载) |
| 工具脚本 | Python 3 (Pillow) |

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 生产构建到 dist/
npm run preview      # 预览生产构建
```

## 项目结构

```
├── index.html                  # HTML 入口
├── vite.config.js              # Vite 配置
├── package.json
├── src/
│   ├── main.jsx                # React 挂载点
│   ├── App.jsx                 # 路由定义
│   ├── index.css               # Tailwind 入口 + 设计令牌
│   ├── components/
│   │   ├── Layout.jsx          # 全局布局（顶栏 Logo + 底栏导航）
│   │   └── GalleryGridImage.jsx # 图片懒加载组件
│   ├── pages/
│   │   ├── Home.jsx            # 首页（分类卡片 + 个人状态）
│   │   ├── Gallery.jsx         # 画廊分类索引
│   │   ├── GalleryCategory.jsx # 分类内作品列表
│   │   ├── GalleryDetail.jsx   # 图片详情 + Lightbox 查看器
│   │   ├── Notes.jsx           # 笔记索引
│   │   └── NotesDetail.jsx     # 笔记详情（含 LaTeX 渲染）
│   ├── gallery/
│   │   ├── categories.js       # 分类定义
│   │   ├── index.js            # 数据查询辅助函数
│   │   ├── items.js            # 动态导入注册表 + lazy loader
│   │   └── items/              # 分类列表 + 逐项详情数据
│   │       ├── travel.js
│   │       ├── film.js
│   │       ├── daily.js
│   │       ├── travel/dali.js
│   │       ├── film/roll1.js, roll2.js, 2026-xinjiang.js
│   │       └── daily/*.js
│   ├── notes/
│   │   ├── index.js            # 笔记注册表
│   │   ├── maxwell-equation.js
│   │   ├── Lagrangian-Hamiltonian.js
│   │   └── spacetime-geometry.js
│   └── lib/
│       └── utils.js            # cn() 工具函数
├── public/
│   ├── favicon.svg             # 网站图标
│   └── img-webp/               # 运行时 WebP 图片（按分类组织）
├── scripts/
│   ├── batch_to_webp.py        # 批量 JPG/PNG → WebP 转换
│   ├── generate_gallery_data.py # 扫描图片目录生成画廊数据文件
│   └── latex_to_note.py        # .tex → 笔记 JS 模块转换
└── img/                        # 原始高分辨率素材图片
```

## 路由

所有页面包裹在 `<Layout />` 中，带固定顶栏 Logo 和底部导航条。

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/gallery` | Gallery | 画廊分类索引 |
| `/gallery/:categoryId` | GalleryCategory | 某分类的作品列表 |
| `/gallery/:categoryId/:itemId` | GalleryDetail | 图片详情 + Lightbox |
| `/notes` | Notes | 笔记索引 |
| `/notes/:noteId` | NotesDetail | 笔记详情（LaTeX 渲染） |

## 画廊数据模型

三个分类（`travel`、`film`、`daily`），每个分类有独立的列表文件和逐项详情文件。

- **分类列表文件** (`src/gallery/items/travel.js`, `film.js`, `daily.js`)：导出条目标题、日期、图片数量、备注、封面图
- **详情文件** (`src/gallery/items/<category>/<id>.js`)：导出 `metadata` 和 `images` 数组，通过 `src/gallery/items.js` 中的动态 import 懒加载

当前内容：
- **Destinations (travel)**：大理 (54 张)
- **Film Rolls (film)**：Roll1 (35 张)、Roll2 (36 张)、2026 新疆 (29 张)
- **Santa Barbara Daily (daily)**：2021-2022 年间 7 组 (43 张)

## 笔记数据模型

笔记以 JS 模块存储在 `src/notes/`，导出 `metadata` 和 `content`（原始字符串，内含 `$...$` 行内公式和 `$$...$$` 块级公式）。`NotesDetail.jsx` 中的 `renderContent()` 解析 Markdown 风格标题和 LaTeX 定界符，然后通过 CDN 加载 MathJax 2.7 进行排版。

当前笔记（3 篇已发布 + 2 篇占位）：
- **Maxwell's Equations** — 高斯定律推导
- **Lagrangian & Hamiltonian Mechanics** — 变分法、Euler-Lagrange、D'Alembert 原理
- **Spacetime and Geometry Notes** — 狭义相对论、张量、流形、曲率

## 辅助脚本

位于 `scripts/` 目录，需要 Python 3 + Pillow：

```bash
# 批量转 WebP（可选生成缩略图）
python scripts/batch_to_webp.py <input_dir> <output_dir>

# 扫描图片文件夹，自动生成画廊数据文件
python scripts/generate_gallery_data.py <image_dir> --category daily

# 将 LaTeX 文件转为笔记 JS 模块
python scripts/latex_to_note.py <input.tex> --output src/notes/my-note.js
```

## 设计令牌

在 `src/index.css` 中通过 Tailwind v4 `@theme` 定义：

| 令牌 | 值 |
|------|-----|
| `--color-bg` | #EBE9E1 (暖白背景) |
| `--color-text-primary` | #1A1A1A |
| `--color-text-secondary` | #55544E |
| `--color-text-tertiary` | #8C8A82 |
| `--color-surface` | #D1CFC7 |
| `--font-serif` | Cormorant Garamond |
| `--font-sans` | Manrope / Inter |
