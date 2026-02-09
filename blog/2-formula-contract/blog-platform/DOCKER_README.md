# 開發環境快速啟動

## 第一次啟動（約 2-3 分鐘）

```bash
docker-compose up
```

## 後續啟動（約 30 秒）

```bash
docker-compose up
```

因為使用了 Volume 快取，node_modules 和 .next 會被保存。

## 常用指令

```bash
# 啟動
docker-compose up

# 背景啟動
docker-compose up -d

# 停止
docker-compose down

# 完全重置（清空資料庫和快取）
docker-compose down -v

# 查看日誌
docker-compose logs -f app

# 執行資料庫遷移
docker-compose exec app npx prisma migrate dev --name init

# 進入容器
docker-compose exec app sh
```

## 開發流程

1. 啟動後等待看到 `✓ Ready in xxxms`
2. 開啟 http://localhost:3000
3. 修改程式碼會自動重新整理

## 資料庫

- Host: localhost
- Port: 5432
- Database: blogdb
- User: postgres
- Password: postgres123