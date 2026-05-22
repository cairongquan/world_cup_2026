# 2026 世界杯场馆地图

基于 **Mapbox** 与 **Svelte 5** 的 2026 国际足联世界杯可视化应用：在北美 16 座主办城市地图上浏览场馆、积分榜、实时赛况、赛程对阵图与 48 支参赛球队阵容。

> 美国 · 加拿大 · 墨西哥联合主办 · 48 队 · 104 场比赛

---

## 功能概览

| 模块 | 说明 |
|------|------|
| **全球地图** | Mapbox Globe 暗色底图，自动旋转总览北美主办区域 |
| **16 座场馆** | 点击场馆标记飞入该城市；右侧列表可快速跳转 |
| **3D 场馆视图** | 进入场馆后切换 Mapbox Standard 3D 样式，地形 + 环绕镜头 |
| **场馆信息卡** | 显示球场名称、主办国、承办场次及该场馆涉及球队 |
| **左侧积分榜** | 分组积分榜（数据来自 [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)） |
| **实时赛况** | 进行中 / 即将开始的比赛（[TheSportsDB](https://www.thesportsdb.com/) API，每 60 秒刷新） |
| **球队阵容** | 点击国旗或队名打开弹窗，展示教练、门将/后卫/中场/前锋及球员头像 |
| **赛程图** | 顶部「赛程图」按钮打开淘汰赛对阵树状图 |

---

## 技术栈

- [Svelte 5](https://svelte.dev/)（Runes：`$state`、`$derived`、`$props`）
- [Vite 6](https://vite.dev/)
- [Mapbox GL JS 3.9+](https://docs.mapbox.com/mapbox-gl-js/)
- 静态数据：`data/*.json`（阵容、国家中文名、国旗映射）
- 静态资源：`assets/flags`、`assets/players`（国旗 PNG、球员头像）

---

## 快速开始

### 环境要求

- **Node.js** ≥ 18
- **npm** ≥ 9
- 有效的 [Mapbox Access Token](https://account.mapbox.com/access-tokens/)（公开 `pk.` 令牌即可用于前端地图）

### 1. 克隆仓库

```bash
git clone https://github.com/cairongquan/world_cup_2026.git
cd world_cup_2026
```

### 2. 配置 Mapbox Token（任选一种）

**方式 A — 推荐：环境变量（`app/.env.local`）**

```bash
cd app
cp .env.example .env.local
# 编辑 .env.local，将 VITE_MAPBOX_TOKEN 改为你的 pk. 开头 Token
```

**方式 B — 仓库根目录 `config.js`**

```bash
cp config.example.js config.js
# 编辑 config.js，填入 MAPBOX_ACCESS_TOKEN
```

首次运行 `npm run dev` 时，若根目录无 `config.js` 且存在 `config.example.js`，Vite 插件会自动复制生成 `config.js` 并提示你填写 Token。

**方式 C — 构建时内联**

构建前在根目录写好 `config.js`，`vite.config.js` 会读取 Token 并注入 `__MAPBOX_TOKEN__`，生产包可不依赖运行时加载 `/config.js`。

**优先级（高 → 低）**

1. `import.meta.env.VITE_MAPBOX_TOKEN`（`.env.local`）
2. 构建内联 `__MAPBOX_TOKEN__`
3. 运行时 `/config.js` → `window.MAPBOX_ACCESS_TOKEN`

> **安全提示**：切勿将真实 Token 提交到 Git。`app/public/config.js`、根目录 `config.js`、`app/.env.local` 均已忽略；`.env.example` 与 `config.example.js` 仅含占位符。

### 3. 安装依赖并启动

```bash
cd app
npm install
npm run dev
```

浏览器默认打开 [http://localhost:5173](http://localhost:5173)。

### 4. 生产构建

```bash
cd app
npm run build    # 输出到 app/build/
npm run preview  # 本地预览构建结果
```

构建结束后会自动将仓库根目录的 `data/`、`assets/` 以及 `config.js`（若存在）复制到 `app/build/`，可直接静态托管整个 `build` 目录。

---

## 仓库结构

```
world_cup_2026/
├── README.md                 # 本文件
├── config.example.js         # Mapbox 配置模板（复制为 config.js）
├── app/                      # Svelte + Vite 前端应用
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # parent-static 插件：托管根目录 data/assets
│   ├── .env.example          # Vite 环境变量模板
│   ├── .gitignore
│   └── src/
│       ├── App.svelte
│       ├── app.css
│       └── lib/
│           ├── components/   # Header、地图、面板、弹窗等
│           ├── map/          # mapController.js — Mapbox 逻辑
│           ├── services/     # 阵容、赛况、赛程 API
│           ├── stores/       # Svelte stores
│           └── data/         # venues.js — 16 场馆静态数据
├── data/                     # JSON 数据（与前端共用）
│   ├── squads.json           # 各队阵容
│   ├── countries.json        # 国家中文名
│   ├── flags-mapping.json    # 队名 → 国旗文件名
│   └── ...
├── assets/
│   ├── flags/                # 国家队旗帜 PNG
│   └── players/              # 球员头像（脚本批量下载）
└── scripts/                  # 数据生成与维护脚本
    ├── build-squads.mjs
    ├── build-country-data.mjs
    ├── download-player-photos.mjs
    ├── enrich-squads.mjs
    └── sync-player-zh.mjs
```

更细的 `app/` 模块说明见 [app/README.md](./app/README.md)。

---

## 数据来源

| 数据 | 来源 | 更新方式 |
|------|------|----------|
| 场馆坐标与场次 | 项目内 `venues.js` 静态维护 | 手动编辑 |
| 小组赛积分榜 | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) `2026/worldcup.json` | 运行时 fetch |
| 比赛事件 / 比分 | TheSportsDB API（联赛 ID `4429`，赛季 `2026`） | 运行时 fetch，60s 轮询 |
| 球队阵容 | `data/squads.json` | 脚本 `build-squads.mjs` 或手工维护 |
| 球员中文名 | `data/player-zh-extra.json` 等 | `sync-player-zh.mjs` |
| 球员头像 | 本地 `assets/players/` | `download-player-photos.mjs` |

阵容与头像为**赛前整理/ provisional 名单**，正式 26 人名单公布后需重新运行脚本或更新 JSON。

---

## 数据维护脚本

在**仓库根目录**执行（需 Node.js 18+）：

```bash
# 从脚本内维护的球队资料生成 squads.json
node scripts/build-squads.mjs

# 生成/更新国家中文名等
node scripts/build-country-data.mjs

# 根据 squads.json 批量下载球员头像到 assets/players/
node scripts/download-player-photos.mjs

#  enrichment 阵容字段（依赖已有 squads.json）
node scripts/enrich-squads.mjs

# 同步球员中文译名
node scripts/sync-player-zh.mjs
```

下载头像时脚本会访问外部 API（TheSportsDB、Wikipedia 等），请注意请求频率与网络环境。

---

## 部署说明

### 静态托管

1. `cd app && npm run build`
2. 将 `app/build/` 目录上传到任意静态服务器（Nginx、Vercel、GitHub Pages、OSS 等）
3. 若部署环境**无法**在构建时提供 Token，需在 `build/config.js` 或构建前 `.env` 中配置 Mapbox Token

### GitHub Pages 示例

```bash
cd app
npm run build
# 将 build/ 内容推送到 gh-pages 分支或使用 Actions 上传 artifact
```

Mapbox Token 为前端公开令牌，但仍建议设置 **URL 限制**（Allowed URLs）仅允许你的域名，并在 Mapbox 控制台定期轮换。

---

## 开发说明

- **Vite 插件 `parent-static`**：开发服务器将 `/data/*`、`/assets/*` 映射到仓库根目录，无需把大数据复制进 `app/public`。
- **`config.js` 热更新**：修改根目录 `config.js` 后，插件会同步到 `app/public/config.js` 并触发 dev 重载。
- **Svelte stores**：`ui.js`（面板/弹窗）、`tournament.js`（赛况）、`map.js`（地图 API 引用）供组件与 `mapController` 共享状态。
- **地图控制器**：`mapController.js` 封装 globe 旋转、场馆 Marker、飞入 3D、场馆旁球队圆点、Popup 与返回全球视图。

本地调试常用命令：

```bash
cd app
npm run dev      # 开发
npm run build    # 生产构建
npm run preview  # 预览 build
```

---

## 常见问题

**Q：页面提示「Mapbox 未配置」？**  
A：确认 Token 以 `pk.` 开头、长度有效，且已通过 `.env.local` 或 `config.js` 之一正确配置，然后重启 `npm run dev`。

**Q：`git push` 被 GitHub 拒绝，提示含密钥？**  
A：不要向仓库提交真实 Token。仅修改本地 `config.js` / `.env.local`，示例文件使用占位符。

**Q：积分榜或赛况为空？**  
A：检查浏览器网络能否访问 openfootball 与 TheSportsDB；2026 赛季数据可能随赛事进展逐步完善。

**Q：球员没有头像？**  
A：运行 `node scripts/download-player-photos.mjs`，或检查 `assets/players/` 是否已包含对应文件。

---

## 许可证与声明

- 本项目为学习与赛事信息展示用途，**与 FIFA 及任何官方机构无关联**。
- 球队名单、赛程与比分来自公开资料与第三方 API，可能存在延迟或误差，请以官方发布为准。
- Mapbox、TheSportsDB、openfootball 等均为各自服务条款下的第三方服务。

---

## 相关链接

- [Mapbox 文档](https://docs.mapbox.com/)
- [Svelte 文档](https://svelte.dev/docs)
- [FIFA World Cup 26™](https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026)

如有问题或改进建议，欢迎提交 [Issue](https://github.com/cairongquan/world_cup_2026/issues)。
