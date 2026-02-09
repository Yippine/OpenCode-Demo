import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const tag = await prisma.tag.findUnique({
      where: { slug: params.slug },
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          tags: {
            some: {
              tagId: tag.id,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.post.count({
        where: {
          published: true,
          tags: {
            some: {
              tagId: tag.id,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      tag,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tag posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tag posts' },
      { status: 500 }
    )
  }
}
