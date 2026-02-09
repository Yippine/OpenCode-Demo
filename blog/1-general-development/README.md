# 部落格平台

一個功能完整的部落格平台，包含前後台管理系統、文章管理、標籤管理、SEO 優化和數據分析功能。

## 功能特色

### 前台功能
- **響應式設計**：完美支援桌面和行動裝置
- **文章列表**：展示所有已發布文章
- **文章詳情**：支援 Markdown 格式的文章內容
- **標籤系統**：按標籤瀏覽相關文章
- **SEO 優化**：每篇文章可設定獨立的 meta 標題和描述

### 後台管理
- **文章管理**
  - 建立、編輯、刪除文章
  - 草稿/發布狀態管理
  - Markdown 編輯器支援
  - 封面圖片設定

- **標籤管理**
  - 建立、編輯、刪除標籤
  - 查看標籤文章數量
  - 標籤描述設定

- **數據分析**
  - 總覽統計：文章數、瀏覽數、標籤數
  - 瀏覽趨勢圖表
  - 熱門文章排行
  - 熱門標籤分佈

- **SEO 設定**
  - 自訂 Meta 標題
  - 自訂 Meta 描述
  - 自動產生文章 slug

## 技術架構

- **前端**：Next.js 14 + React + TypeScript
- **樣式**：Tailwind CSS
- **後端**：Next.js API Routes
- **資料庫**：SQLite + Prisma ORM
- **認證**：JWT Token
- **圖表**：Chart.js
- **Markdown**：react-markdown

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env` 檔案，設定必要的環境變數。

### 3. 初始化資料庫

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 預設帳號

- **Email**: admin@example.com
- **Password**: admin123

## 專案結構

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── admin/        # 後台 API
│   │   ├── analytics/    # 分析 API
│   │   ├── auth/         # 認證 API
│   │   ├── posts/        # 文章 API
│   │   └── tags/         # 標籤 API
│   ├── admin/            # 後台頁面
│   ├── posts/            # 文章頁面
│   ├── tags/             # 標籤頁面
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React 元件
├── lib/                   # 工具函式
├── prisma/               # 資料庫設定
│   ├── schema.prisma
│   └── seed.ts
├── public/               # 靜態資源
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 可用指令

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建立生產版本
- `npm run start` - 啟動生產伺服器
- `npm run lint` - 執行 ESLint
- `npm run db:generate` - 產生 Prisma Client
- `npm run db:push` - 同步資料庫結構
- `npm run db:studio` - 開啟 Prisma Studio
- `npm run db:seed` - 執行資料庫種子

## 授權

MIT License
