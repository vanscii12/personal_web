# 3D Footprint

把手机记录的 GPS 足迹做成一张私人 3D 地图：走过的路像墨线一样描在纸面上，走得越多越粗越深；没去过的地方压在一层暗色的雾下，去过的国家、省份、城市被「点亮」，山川在雾下起伏。全部在本机运行，不需要数据库，也不需要后端服务。视觉风格按 `DESIGN.md`（亚麻底、暖灰墨色、sage 点缀，只有浅色）。

现在它是 Personal-Web 的一个应用：代码在网站仓库的 `apps/footprint/`（从独立项目 `E:\Footprint` 迁入），从网站的 My Apps 页（`/apps`）进入，地址是 `/apps/footprint`，全屏运行，面板左上角的 `← my apps` 回到网站。依赖、脚本和构建都用网站根目录的。

## 快速开始

在网站根目录运行：

```powershell
npm install
npm run footprint:boundaries   # 一次性下载中国省市边界（阿里云 DataV，约 4.6 MB）
npm run dev
```

打开 http://localhost:3000/apps/footprint。启动时如果数据过期，会自动重新生成 `public/data/footprint/`，大约 1–2 秒。不运行 `npm run footprint:boundaries` 也能用，只是中国只点亮到国家一级。

## 更新数据

导出文件放在 `apps/footprint/data/`。默认读取 `backUpData.csv`；现在的数据是用 `backUpData-all.csv`（2026-10 的导出，`backUpData.csv` 是 2025-06 的旧导出）生成的。

```powershell
npm run footprint:data                                            # 读取 apps/footprint/data/backUpData.csv
npm run footprint:data -- apps/footprint/data/backUpData-all.csv  # 指定其他文件
```

`npm run dev` / `npm run build` 前的自动重建只在数据过期时运行，而且不会换用别的导出文件：如果现有数据来自另一个 CSV（`meta.json` 的 `source.file`），它只提示、不重建，需要手动运行上面的命令。用新导出覆盖上次用的那个文件，自动重建就会接上。

CSV 至少需要 `dataTime`（Unix 秒）、`longitude`、`latitude` 三列；`accuracy`、`speed`（m/s）、`altitude` 有就用。坐标按 WGS-84 处理。

## 能做什么

- **光轨**：每走过一次就在路线上加深一层，颜色取 DESIGN.md 的暖色数据色（赭黄 → 陶土 → 砖红 → 深栗），经过次数越多越深，也越粗。
- **迷雾**：没去过的地方压着一层暖灰色的雾，轨迹周围半径内的雾被拨开，边缘带一圈柔光。半径可以在 100–2000 m 之间实时调整。海面和国界画在雾上方，没去过的地方也认得出是哪里。
- **点亮行政区**：去过的国家、省 / 州、市 / 县盖一层亮色、描 sage 边，去得越多越亮；缩放时国家 → 省 → 市逐级切换，放大到街道时只留边框，不挡迷雾。面板显示点亮的数量。中国用 DataV 的省和地级市（直辖市、港澳台各算一个市），美国用州和县，其他国家只到国家一级。
- **地形**：3D 地形和山体阴影（数据来自 AWS 上的 Terrain Tiles），倾斜视角下能看到山。可以在面板里关掉。
- **悬停查看**：鼠标停在任意位置，显示所在行政区去过几天，以及附近去过几天、经过几次、首次和最近到访日期。
- **年份筛选**：只看某几年的足迹，光轨、迷雾、点亮的行政区和统计一起变。
- **常驻地 / 全览**：飞到去得最多的地方，或者框住全部足迹（会自动选择跨太平洋还是跨大西洋的那一边）。

光轨和迷雾都是在浏览器里由一组 Web Worker 实时绘制的栅格瓦片（每张 3–20 ms），不需要预先切片。

## 数据清洗

| 规则 | 默认值 | 原因 |
| --- | --- | --- |
| 定位精度 | > 200 m 丢弃 | 基站定位，会在迷雾上戳出假洞 |
| 航班 | 整段丢弃 | 时间上连续、速度 > 108 km/h 的一段里，有 ≥ 3 个点超过 400 km/h 或海拔 6000 m（或 4500 m 以上且超过 216 km/h），整段都算飞行，连同起飞滑跑、进近和盘旋。高铁（≤ 350 km/h）不受影响 |
| 海拔跳变 | 10 秒内 > 500 m 丢弃 | 高度异常 |
| GPS 跳点 | 前后都超过 110 m/s 且绕回原处 | 单点漂移 |
| 连线 | 间隔 ≤ 300 s 且 ≤ 110 m/s | 超过就断开，避免出现跨城的直线 |
| 长连线 | > 250 m 时要求两端精度 ≤ 65 m，且手机测到的速度和直线速度相符（0.85–1.25 倍） | 稀疏或粗定位的两点连线会抄近路；如果实际路线拐了弯，直线距离会明显短于真实路程 |

规则在 `scripts/lib/clean.mjs` 的 `DEFAULT_RULES` 里。每次清洗的统计（各原因丢了多少点）写在网站的 `public/data/footprint/meta.json`。

## 行政区数据

| 范围 | 来源 | 说明 |
| --- | --- | --- |
| 中国（含港澳台） | 阿里云 DataV GeoAtlas，`npm run footprint:boundaries` 下载到 `data/boundaries/china/` | 原始坐标是 GCJ-02（火星坐标），构建时转换成 WGS-84；省级显示用全国分省文件，市级判定用各省的分市文件 |
| 美国 | `us-atlas`（美国人口普查局数据） | 州、县 |
| 其他国家 | `world-atlas`（Natural Earth 1:10m） | 国家，中文名来自 `i18n-iso-countries` |

海岸线比较粗，落在边界外但离边界 5.5 km 以内的点（海滩、码头、填海区）会归到最近的行政区；真正在海上的点不归属。

## 目录

以下路径相对 `apps/footprint/`：

```
data/                 原始导出、下载的边界（gitignore）
scripts/build-data.mjs  CSV → 网站的 public/data/footprint/（footprint.bin + meta.json + regions.json）
scripts/fetch-boundaries.mjs  下载中国边界
scripts/lib/          CSV 解析、清洗、统计、边界加载、GCJ-02 转换、行政区归属
src/App.jsx           入口（网站按需加载）；所有样式限定在 .footprint 根元素下（src/styles.css）
src/Specimen.jsx      网站 My Apps 卡片上的示意图（虚构路线，不含真实数据）
src/shared/           二进制格式、地理计算、瓦片样式（脚本和浏览器共用）
src/worker/           Web Worker：轨迹空间索引、迷雾和光轨瓦片绘制、悬停查询
src/map/              MapLibre 地图、瓦片协议、地形、底图配色、雾上方的水面和国界、行政区图层
src/data/             数据加载、Worker 池、按年份汇总行政区
src/ui/               控制面板、返回 My Apps 的 crumb
test/                 清洗、格式、瓦片索引、行政区的单元测试（npm run footprint:test）
```

## 隐私

位置历史可以还原出住址和日常行程（`meta.json` 里有常驻地坐标）。`apps/footprint/data/` 和 `public/data/footprint/` 都被 gitignore，不会进 git；但 `npm run build` 会把 `public/data/footprint/` 一起打进 `dist/`，在本机构建、再把 `dist/` 部署到公网，就等于公开了这些数据，部署前请三思。开发服务器默认只监听本机，如需在局域网内用手机查看，运行 `npm run dev -- --host`。

## 旧版本

之前的实现（PostgreSQL/PostGIS + Express API + React/deck.gl 前端，以及多 agent 协作用的 `coordination/` 文档）留在 `E:\Footprint\legacy\`，没有迁入网站。新版本不再需要数据库，PostgreSQL 服务可以保留也可以停掉。
