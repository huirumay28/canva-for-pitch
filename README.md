# 比稿資料平台 | Canva for Pitch

依角色優化資訊呈現的比稿資料平台。同一份內容自動切換成最適合的格式：創意看視覺拼貼、策略看數據圖表、業務看重點摘要。

![Canva for Pitch Demo](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)

## 功能特色

### 🎯 依角色優化視圖

- **創意角色**：視覺拼貼呈現，包含情緒板、產品視覺與創意靈感素材
- **策略角色**：數據圖表導向，展示關鍵指標、市場趨勢與分析洞察
- **商務角色**：重點摘要總覽，快速掌握專案目標、交付項目與成果

### ⚡ 一鍵切換視圖

在拼貼視圖、數據圖表、重點摘要之間即時切換。相同的比稿內容以三種不同格式呈現，適應不同的資訊消化習慣。

### 📦 立即試用

內建台灣環保時尚品牌的行銷提案範例資料，開啟即可體驗完整功能。未來可擴充上傳與貼上功能。

### 🎨 簡潔 Canva 風格介面

- 極簡、有組織的設計
- 流暢的過場動效與互動
- 響應式設計，適應各種螢幕尺寸
- 優雅的漸層色彩與陰影效果

## 技術架構

- **框架**：Next.js 14 (App Router)
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **圖示**：Lucide React
- **示意圖片**：Unsplash（範例內容）

## 快速開始

### 環境需求

- Node.js 18.17 或更新版本
- npm、yarn 或 pnpm

### 安裝步驟

1. 複製專案：

```bash
git clone <your-repo-url>
cd canva-for-pitch
```

2. 安裝相依套件：

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. 啟動開發伺服器：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. 在瀏覽器開啟 [http://localhost:3000](http://localhost:3000)

### 正式版建置

```bash
npm run build
npm start
```

## 專案結構

```
canva-for-pitch/
├── app/
│   ├── layout.tsx          # 根佈局與 metadata
│   ├── page.tsx            # 主要應用程式邏輯
│   └── globals.css         # 全域樣式 + Tailwind
├── components/
│   ├── Header.tsx          # 應用程式標頭
│   ├── RoleSelector.tsx    # 角色選擇卡片
│   ├── ViewSwitcher.tsx    # 視圖切換按鈕
│   ├── CollageView.tsx     # 創意拼貼視圖
│   ├── DataView.tsx        # 策略數據視圖
│   └── SummaryView.tsx     # 商務摘要視圖
├── types/
│   └── pitch.ts            # TypeScript 型別定義
├── data/
│   └── samplePitch.ts      # 範例比稿資料
└── public/                 # 靜態資源
```

## Usage Flow

1. **Landing Page**: Introduction to the platform and its benefits
2. **Role Selection**: Choose Creative, Strategy, or Business role
3. **Viewing**: See pitch content in role-optimized format
4. **Switch Views**: Toggle between Collage, Data, and Summary anytime

## Key Components

### Data Model

The `PitchData` interface structures all pitch content:

- Brief & objectives
- Product & client information  
- Market insights (trends, opportunities, challenges)
- Deliverables & constraints
- Metrics with trends
- Visual assets with categorization
- Executive summary sections

### View Logic

Each role has a default view preference:
- Creative → Collage
- Strategy → Data  
- Business → Summary

Users can switch to any view regardless of role, maintaining flexibility while optimizing the initial presentation.

## 客製化

### 新增比稿內容

編輯 `data/samplePitch.ts` 或擴充資料模型以支援多份比稿。結構完整定義型別，易於擴充。

### 樣式調整

全專案使用 Tailwind classes。自訂 Canva 品牌色定義於：
- `tailwind.config.ts`（主題擴充）
- `app/globals.css`（CSS 變數）

### 視圖客製

每個視圖元件（`CollageView`、`DataView`、`SummaryView`）皆為模組化設計，可獨立客製。

## 未來擴充方向

- 檔案上傳功能（PDF、MD、TXT、圖片）
- 文字貼上與解析
- 多份比稿管理
- 主題／段落篩選
- 匯出為 PDF／簡報格式
- 團隊協作功能

## 授權

MIT

## 貢獻

歡迎貢獻！這是展示依角色優化內容呈現模式的示範專案。

---

使用 Next.js + TypeScript + Tailwind CSS 打造
