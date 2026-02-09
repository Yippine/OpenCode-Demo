# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env

# 初始化資料庫
npx prisma generate
npx prisma db push
npm run db:seed

# 啟動開發伺服器
npm run dev

預設帳號
- Email: admin@example.com
- Password: admin123

造訪 http://localhost:3000 查看前台，http://localhost:3000/admin/login 進入後台。
