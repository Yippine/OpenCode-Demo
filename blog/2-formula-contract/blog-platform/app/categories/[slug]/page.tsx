import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateCategoryMetadata } from '@/lib/seo/metadata'
import { generateCategoryPageSchema, generateBreadcrumbSchema, serializeSchema } from '@/lib/seo/json-ld'
import CategoryPostsPageClient from './category-posts-page-client'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    return {
      title: '分類不存在',
      description: '找不到該分類',
    }
  }

  const postCount = await prisma.post.count({
    where: {
      published: true,
      categories: {
        some: {
          category: { slug },
        },
      },
    },
  })

  return generateCategoryMetadata(category, postCount)
}

export default async function CategoryPostsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  const page = parseInt(pageParam || '1')
  const limit = 9

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        categories: {
          some: {
            category: { slug },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.post.count({
      where: {
        published: true,
        categories: {
          some: {
            category: { slug },
          },
        },
      },
    }),
  ])

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }

  const categoryPageSchema = generateCategoryPageSchema(category, total)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '首頁', url: '/' },
    { name: '分類', url: '/categories' },
    { name: category.name },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(categoryPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(breadcrumbSchema) }}
      />
      <CategoryPostsPageClient
        category={category}
        posts={posts}
        pagination={pagination}
      />
    </>
  )
}
