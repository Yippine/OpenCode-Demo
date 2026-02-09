import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generatePostMetadata } from '@/lib/seo/metadata'
import { generateArticleSchema, generateBreadcrumbSchema, serializeSchema } from '@/lib/seo/json-ld'
import PostPageClient from './post-page-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
      categories: { include: { category: { select: { name: true } } } },
    },
  })

  if (!post) {
    return {
      title: '文章不存在',
      description: '找不到該文章',
    }
  }

  const ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || '')}&author=${encodeURIComponent(post.author.name)}&date=${encodeURIComponent(new Date(post.createdAt).toLocaleDateString('zh-TW'))}`

  return generatePostMetadata(post, ogImage)
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { id: true, name: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
    },
  })

  if (!post) {
    notFound()
  }

  // 獲取前後文章
  const prevPost = await prisma.post.findFirst({
    where: {
      published: true,
      createdAt: { gt: post.createdAt },
    },
    orderBy: { createdAt: 'asc' },
    select: { slug: true, title: true },
  })

  const nextPost = await prisma.post.findFirst({
    where: {
      published: true,
      createdAt: { lt: post.createdAt },
    },
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true },
  })

  // 獲取相關文章
  const tagIds = post.tags.map(t => t.tag.id)
  const relatedPosts = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: post.id },
      tags: {
        some: {
          tagId: { in: tagIds },
        },
      },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      createdAt: true,
    },
  })

  // 生成結構化資料
  const ogImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || '')}&author=${encodeURIComponent(post.author.name)}&date=${encodeURIComponent(new Date(post.createdAt).toLocaleDateString('zh-TW'))}`

  const articleSchema = generateArticleSchema(post, ogImage)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '首頁', url: '/' },
    ...(post.categories[0] ? [{ name: post.categories[0].category.name, url: `/categories/${post.categories[0].category.slug}` }] : []),
    { name: post.title },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(breadcrumbSchema) }}
      />
      <PostPageClient
        post={post}
        prevPost={prevPost}
        nextPost={nextPost}
        relatedPosts={relatedPosts}
      />
    </>
  )
}
