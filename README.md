# VanScii(c) — Personal Website

一个安静的个人存档网站，包含**摄影作品集**、**物理/数学笔记**，以及 **My Apps**——在站内运行的小应用（目前是足迹地图 Footprint）。

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
| 地图 | MapLibre GL JS 6 + Web Workers（Footprint，按需加载） |
| 工具脚本 | Python 3 (Pillow)；Footprint 的数据管线用 Node |

## 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 生产构建到 dist/
npm run preview      # 预览生产构建

npm run footprint:data        # 重新生成 Footprint 数据（-- 路径 可指定其他导出文件）
npm run footprint:boundaries  # 一次性下载中国省市边界（Footprint 行政区点亮用）
npm run footprint:test        # Footprint 单元测试
```

`npm run dev` / `npm run build` 之前会自动检查 Footprint 数据是否过期（`--if-stale`），过期才重建。

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
│   │   ├── Layout.jsx          # 全局布局（左上 Logo + 左侧竖排导航）
│   │   ├── CustomCursor.jsx    # 自定义圆环光标
│   │   └── GalleryGridImage.jsx # 图片懒加载组件
│   ├── pages/
│   │   ├── Home.jsx            # 首页（分类卡片 + 个人状态）
│   │   ├── Gallery.jsx         # 画廊分类索引
│   │   ├── GalleryCategory.jsx # 分类内作品列表
│   │   ├── GalleryDetail.jsx   # 图片详情 + Lightbox 查看器
│   │   ├── Notes.jsx           # 笔记索引
│   │   ├── NotesDetail.jsx     # 笔记详情（含 LaTeX 渲染）
│   │   ├── Apps.jsx            # My Apps：应用卡片，点击进入
│   │   └── About.jsx           # 关于页（简介 / 数字 / 实践 / 联系）
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
│   ├── about/
│   │   └── index.js            # About 页文案（简介 / 事实 / 联系链接）
│   ├── apps/
│   │   └── index.js            # My Apps 注册表：每个应用的文案、卡片插图、按需加载入口
│   └── lib/
│       ├── utils.js            # cn() 工具函数
│       └── useScrollAnimator.js # 滚动显现动画 hook
├── apps/
│   └── footprint/              # 足迹地图（自带 CLAUDE.md / README.md）
│       ├── src/                # 浏览器端：地图、Worker、面板（样式限定在 .footprint 下）
│       ├── scripts/            # Node 数据管线：CSV → public/data/footprint/
│       ├── test/               # node:test 单元测试
│       └── data/               # 原始 GPS 导出与边界（gitignore，私人数据）
├── public/
│   ├── favicon.svg             # 网站图标
│   ├── img-webp/               # 运行时 WebP 图片（按分类组织）
│   └── data/footprint/         # Footprint 生成的数据（gitignore，私人数据）
├── scripts/
│   ├── batch_to_webp.py        # 批量 JPG/PNG → WebP 转换
│   ├── generate_gallery_data.py # 扫描图片目录生成画廊数据文件
│   └── latex_to_note.py        # .tex → 笔记 JS 模块转换
└── img/                        # 原始高分辨率素材图片
```

## 路由

网站页面包裹在 `<Layout />` 中，带固定的左上角 Logo 和左侧竖排导航（`archive` / `notes` / `my apps` / `about`）。应用在 `<Layout />` 之外全屏运行。

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页 |
| `/gallery` | Gallery | 画廊分类索引 |
| `/gallery/:categoryId` | GalleryCategory | 某分类的作品列表 |
| `/gallery/:categoryId/:itemId` | GalleryDetail | 图片详情 + Lightbox |
| `/notes` | Notes | 笔记索引 |
| `/notes/:noteId` | NotesDetail | 笔记详情（LaTeX 渲染） |
| `/apps` | Apps | My Apps：选择要进入的应用 |
| `/about` | About | 关于页：简介、数字、两个板块入口、联系方式 |
| `/apps/footprint` | Footprint | 足迹地图，全屏、按需加载，面板左上角 `← my apps` 返回 |

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

## About 页数据模型

文案集中在 `src/about/index.js`：`profile`（标题语、简介、事实列表、主图）、`practice`（两个板块卡片）、`equations`（笔记卡片里的三行公式）、`links`（联系方式）、`colophon`。

页面上的数字（照片数、roll 数、笔记数）不在这里存储，而是由 `About.jsx` 从画廊和笔记注册表实时计算。`links` 为空时，"Elsewhere" 区块不会渲染。设计说明见 `design/design-proposal.md` 的 "About Page" 一节。

## My Apps

`src/apps/index.js` 是应用注册表，每个应用一条：名称、说明、标签、卡片插图（`Specimen`），以及 `load`（动态 import 应用的根组件）。`src/App.jsx` 为每一条生成路由 `/apps/<id>`：应用代码只在打开时下载，在 `<Layout />` 之外全屏运行。

加一个应用：把代码放进 `apps/<id>/`，依赖装到根目录的 `package.json`，在注册表里加一条。应用的样式要限定在自己的根元素下（网站的 `index.css` 会一直生效，比如 `body { cursor: none }`），用 `<Link to="/apps">` 返回。不要在 `public/apps/` 下放文件，否则静态托管时这个目录会挡住 `/apps` 路由。设计说明见 `design/design-proposal.md` 的 "My Apps Page" 一节。

### Footprint 足迹地图

从独立项目 `E:\Footprint` 迁入，详见 `apps/footprint/README.md`。数据管线读取 `apps/footprint/data/` 下的 GPS 导出 CSV，生成 `public/data/footprint/`（网站以 `/data/footprint/` 提供）。当前数据由 `backUpData-all.csv`（2026-10 导出）生成；自动重建不会换用其他导出文件，换文件请手动运行 `npm run footprint:data -- 路径`。

**隐私**：位置历史能还原住址和日常行程（`meta.json` 里就有常驻地坐标）。`apps/footprint/data/` 和 `public/data/footprint/` 都已 gitignore，但 `npm run build` 会把 `public/data/footprint/` 复制进 `dist/`——在本机构建并部署到公网，就等于公开了这些数据。

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

视觉方案为 "Collected Light"（见 `design/design-proposal.md`）。

| 令牌 | 值 |
|------|-----|
| `--color-bg` / `--color-bg-linen` | #F0EBE3 (亚麻暖白背景) |
| `--color-fg-charcoal` | #2C2C2C (正文) |
| `--color-fg-muted` | #8A8378 (次要文字) |
| `--color-accent-sage` | #8B9A7B (强调色) |
| `--color-accent-sage-light` | rgba(139,154,123,0.12) |
| `--color-border-warm` | #DDD6CC (分隔线 / 卡片边框) |
| `--color-photo-border` | #F7F3EE (照片相框) |
| `--font-heading` | Playfair Display |
| `--font-body` | Inter |
| `--font-mono` | JetBrains Mono (日期 / 计数 / 标签) |

滚动显现动画使用 `.fade-up` / `.slide-left` / `.scale-fade` / `.line-grow` 四个类，配合 `src/lib/useScrollAnimator.js`（较早的页面各自带有一份同样的 hook）。
