# 2026 世界杯场馆地图 · Svelte 版

由原项目根目录 `index.html` 单文件应用拆分而来，功能与交互保持一致：Mapbox 全球/3D 场馆视图、左侧积分榜与实时赛况、右侧场馆列表、球队阵容弹窗。

## 快速开始

```bash
cd app
npm install
npm run dev
```

浏览器默认打开 `http://localhost:5173`。生产构建（输出到 `app/build/`，避免与历史上损坏的 `app/dist/` 冲突）：

```bash
npm run build
npm run preview
```

## 前置配置

Mapbox Token 仍使用**项目根目录**的 `config.js`（由 `app/index.html` 通过 `<script src="/config.js">` 引入）。若尚未配置：

```bash
cp config.example.js config.js
# 编辑 config.js，填入 MAPBOX_ACCESS_TOKEN
```

## 与根目录的关系

| 资源 | 位置 | 说明 |
|------|------|------|
| `config.js` | 仓库根目录 | Mapbox 访问令牌 |
| `data/*.json` | 仓库根目录 | 阵容、国家中文名、国旗映射 |
| `assets/` | 仓库根目录 | 静态资源（如有） |
| `index.html` | 仓库根目录 | **原版单页**，未删除；本 Svelte 版独立在 `app/` |

`main.js` 会动态加载 `/config.js`（设置 `window.MAPBOX_ACCESS_TOKEN`）。Vite 插件 `parent-static` 在开发时从仓库根目录提供该文件及 `data/`、`assets/`；构建结束后复制到 `app/build/`。

## 目录结构

```
app/
├── index.html              # Vite 入口
├── package.json
├── vite.config.js          # 根目录静态资源插件（避免 publicDir 递归）
├── svelte.config.js
├── README.md               # 本文件
└── src/
    ├── main.js             # mount(App)
    ├── app.css             # 自原 index.html <style> 迁移
    ├── App.svelte          # 根布局与数据初始化
    └── lib/
        ├── constants.js    # Mapbox 样式、边界、API 地址
        ├── flags.js        # 国旗 URL / HTML
        ├── teams.js        # 英文名 → 中文队名
        ├── data/
        │   └── venues.js   # 16 个场馆静态数据
        ├── stores/
        │   ├── ui.js       # 面板显隐、当前场馆、阵容弹窗
        │   ├── tournament.js # 积分榜、实时赛况 store
        │   └── squads.js   # 阵容 JSON store
        ├── services/
        │   ├── squads.js   # 加载 squads.json
        │   └── tournament.js # openfootball + TheSportsDB
        ├── map/
        │   └── mapController.js  # Mapbox 全球/3D、场馆图层、标记
        └── components/
            ├── Header.svelte
            ├── MapContainer.svelte
            ├── LeftPanel.svelte
            ├── StandingsList.svelte
            ├── LiveMatches.svelte
            ├── LiveTeamBlock.svelte
            ├── VenuePanel.svelte
            ├── VenueList.svelte
            ├── FlagImg.svelte / FlagButton.svelte
            ├── StadiumBackButton.svelte
            └── SquadModal.svelte
```

## 模块职责简述

- **App.svelte**：挂载各 UI 块；`onMount` 时加载阵容、初始化赛况数据，每 60 秒刷新联网数据。
- **mapController.js**：封装原 `index.html` 内全部 Mapbox 逻辑（globe 旋转、场馆圆点、点击进入 3D、场馆旁球队圆点与弹窗、返回全球视图）。
- **stores**：Svelte writable store，供面板与地图共享状态（如 `activeVenueId`、`stadiumBackVisible`）。
- **components**：纯展示与事件；地图飞行由 `App` 将 `VenueList` 选择转发给 `MapContainer.flyToVenue`。

## 技术栈

- Svelte 5（runes：`$state`、`$derived`、`$props`）
- Vite 6
- mapbox-gl 3.9.x

## 数据脚本（可选）

阵容数据可由根目录脚本生成：

```bash
node scripts/build-squads.mjs
```

生成结果写入 `data/squads.json`，Svelte 版与原版共用。
