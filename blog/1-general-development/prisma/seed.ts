// Prisma 資料庫初始化腳本
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('開始初始化資料庫...')

  // 建立預設管理員帳號
  const adminPassword = await hashPassword('admin123')
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理員',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('管理員帳號已建立:', admin.email)

  // 建立預設標籤
  const tags = [
    { name: '技術', description: '程式開發、技術分享' },
    { name: '生活', description: '日常生活點滴' },
    { name: '旅遊', description: '旅遊見聞與攻略' },
    { name: '美食', description: '美食推薦與食記' },
    { name: '學習', description: '學習心得與筆記' },
  ]

  for (const tag of tags) {
    const slug = tag.name.toLowerCase().replace(/\s+/g, '-')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name: tag.name,
        slug,
        description: tag.description,
      },
    })
  }

  console.log('預設標籤已建立')

  // 建立範例文章
  const examplePost = await prisma.post.upsert({
    where: { slug: 'welcome-to-my-blog' },
    update: {},
    create: {
      title: '歡迎來到我的部落格',
      slug: 'welcome-to-my-blog',
      content: `# 歡迎來到我的部落格

這是一個使用 Next.js 和 Prisma 建立的現代化部落格平台。

## 功能特色

- **文章管理**：建立、編輯、發布文章
- **標籤系統**：為文章添加標籤，方便分類
- **SEO 優化**：自訂 meta 標題和描述
- **數據分析**：追蹤文章瀏覽數據
- **響應式設計**：支援各種裝置瀏覽

## 開始使用

1. 登入管理後台
2. 建立新文章
3. 添加標籤
4. 發布分享

感謝您的訪問！`,
      excerpt: '歡迎來到我的部落格，這是一個功能完整的部落格平台',
      published: true,
      authorId: admin.id,
      metaTitle: '歡迎來到我的部落格 - 現代化部落格平台',
      metaDesc: '這是一個使用 Next.js 和 Prisma 建立的現代化部落格平台，具備文章管理、標籤系統、SEO 優化等功能',
      viewCount: 0,
    },
  })

  // 為範例文章添加標籤
  const techTag = await prisma.tag.findUnique({ where: { slug: '技術' } })
  if (techTag) {
    await prisma.post.update({
      where: { id: examplePost.id },
      data: {
        tags: {
          connect: { id: techTag.id },
        },
      },
    })
  }

  console.log('範例文章已建立')
  console.log('資料庫初始化完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
