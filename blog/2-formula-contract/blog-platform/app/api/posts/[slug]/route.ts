import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug, published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get previous and next posts
    const [prevPost, nextPost] = await Promise.all([
      prisma.post.findFirst({
        where: {
          published: true,
          createdAt: { lt: post.createdAt },
        },
        orderBy: { createdAt: 'desc' },
        select: { slug: true, title: true },
      }),
      prisma.post.findFirst({
        where: {
          published: true,
          createdAt: { gt: post.createdAt },
        },
        orderBy: { createdAt: 'asc' },
        select: { slug: true, title: true },
      }),
    ])

    // Get related posts based on tags
    const tagIds = post.tags.map((t) => t.tagId)
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

    return NextResponse.json({
      post,
      prevPost,
      nextPost,
      relatedPosts,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
