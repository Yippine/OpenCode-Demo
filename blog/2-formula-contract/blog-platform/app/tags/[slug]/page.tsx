import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateTagMetadata } from '@/lib/seo/metadata'
import { generateTagPageSchema, generateBreadcrumbSchema, serializeSchema } from '@/lib/seo/json-ld'
import TagPostsPageClient from './tag-posts-page-client'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await prisma.tag.findUnique({
    where: { slug },
  })

  if (!tag) {
    return {
      title: '標籤不存在',
      description: '找不到該標籤',
    }
  }

  const postCount = await prisma.post.count({
    where: {
      published: true,
      tags: {
        some: {
          tag: { slug },
        },
      },
    },
  })

  return generateTagMetadata(tag, postCount)
}

export default async function TagPostsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const tag = await prisma.tag.findUnique({
    where: { slug },
  })

  if (!tag) {
    notFound()
  }

  const page = parseInt(pageParam || '1')
  const limit = 9

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        tags: {
          some: {
            tag: { slug },
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
        tags: {
          some: {
            tag: { slug },
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

  const tagPageSchema = generateTagPageSchema(tag, total)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: '首頁', url: '/' },
    { name: '標籤', url: '/tags' },
    { name: tag.name },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(tagPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema(breadcrumbSchema) }}
      />
      <TagPostsPageClient
        tag={tag}
        posts={posts}
        pagination={pagination}
      />
    </>
  )
}
