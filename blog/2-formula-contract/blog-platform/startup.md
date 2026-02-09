# 1. 完全重置（刪除資料庫和容器）
docker-compose down -v

# 2. 啟動容器
docker-compose up -d

# 3. 等待容器就緒，然後執行資料庫遷移
docker-compose run --rm app sh -c "apk add --no-cache openssl && npx prisma@5.22.0 migrate dev --name init"

# 4. 【可選】創建管理員帳號（如果你想登入後台管理）
docker-compose exec app npm run create-admin admin@blog.com password123 Admin
