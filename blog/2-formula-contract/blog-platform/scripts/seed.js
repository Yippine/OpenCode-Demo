const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('開始建立種子資料...');

  // 建立管理員帳號
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理員',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ 管理員帳號建立:', admin.email);

  // 建立標籤
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'nextjs' }, update: {}, create: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { name: 'React', slug: 'react' } }),
    prisma.tag.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.tag.upsert({ where: { slug: 'prisma' }, update: {}, create: { name: 'Prisma', slug: 'prisma' } }),
    prisma.tag.upsert({ where: { slug: 'seo' }, update: {}, create: { name: 'SEO', slug: 'seo' } }),
  ]);
  console.log('✅ 標籤建立:', tags.map(t => t.name).join(', '));

  // 建立分類
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'frontend' }, update: {}, create: { name: '前端開發', slug: 'frontend' } }),
    prisma.category.upsert({ where: { slug: 'backend' }, update: {}, create: { name: '後端開發', slug: 'backend' } }),
    prisma.category.upsert({ where: { slug: 'tutorial' }, update: {}, create: { name: '教學文章', slug: 'tutorial' } }),
  ]);
  console.log('✅ 分類建立:', categories.map(c => c.name).join(', '));

  // 建立文章
  const posts = [
    {
      title: '使用 Next.js 14 建立部落格平台',
      slug: 'nextjs-14-blog-platform',
      excerpt: '本文將介紹如何使用 Next.js 14、Prisma 和 PostgreSQL 建立一個完整的部落格平台。',
      content: `# 使用 Next.js 14 建立部落格平台

## 前言

Next.js 14 帶來了許多令人興奮的新功能，特別是 App Router 的穩定版本。本文將帶你一步步建立一個功能完整的部落格平台。

## 技術棧

- **Next.js 14** - React 框架
- **Prisma** - ORM 工具
- **PostgreSQL** - 資料庫
- **Tailwind CSS** - 樣式框架

## 開始建立

首先，讓我們初始化專案：

\`\`\`bash
npx create-next-app@14 my-blog
\`\`\`

## 結論

透過本文的教學，你已經學會如何建立一個現代化的部落格平台。`,
      published: true,
      tagSlugs: ['nextjs', 'react'],
      categorySlugs: ['frontend', 'tutorial'],
    },
    {
      title: 'Prisma ORM 完整教學',
      slug: 'prisma-orm-tutorial',
      excerpt: 'Prisma 是現代 Node.js 應用程式的最佳 ORM 選擇，本文將深入介紹其核心概念。',
      content: `# Prisma ORM 完整教學

## 什麼是 Prisma？

Prisma 是下一代 Node.js 和 TypeScript ORM，它提供：

- 型別安全的資料庫查詢
- 自動生成的遷移檔案
- 視覺化的資料庫管理工具

## 安裝 Prisma

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

## 結語

Prisma 讓資料庫操作變得簡單又安全。`,
      published: true,
      tagSlugs: ['prisma', 'typescript'],
      categorySlugs: ['backend', 'tutorial'],
    },
    {
      title: 'SEO 優化實戰指南',
      slug: 'seo-optimization-guide',
      excerpt: '學習如何優化你的網站 SEO，提升搜尋引擎排名。',
      content: `# SEO 優化實戰指南

## 為什麼 SEO 很重要？

搜尋引擎優化（SEO）是讓你的網站在搜尋結果中排名更高的關鍵。

## 核心要素

1. **優質內容** - 內容為王
2. **技術 SEO** - 網站速度、結構化資料
3. **反向連結** - 權威性指標

## 結論

持續優化，長期經營。`,
      published: true,
      tagSlugs: ['seo'],
      categorySlugs: ['tutorial'],
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        published: postData.published,
        authorId: admin.id,
        tags: {
          create: postData.tagSlugs.map(slug => ({
            tag: { connect: { slug } }
          }))
        },
        categories: {
          create: postData.categorySlugs.map(slug => ({
            category: { connect: { slug } }
          }))
        },
      },
    });
    console.log('✅ 文章建立:', post.title);
  }

  console.log('\n🎉 種子資料建立完成！');
  console.log('\n管理員帳號:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });