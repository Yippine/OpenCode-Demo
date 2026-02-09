import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    if (!query.trim()) {
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      })
    }

    // Use PostgreSQL full-text search
    const searchQuery = query
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => `${term}:*`)
      .join(' & ')

    const [posts, totalResult] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          p.id,
          p.title,
          p.slug,
          p.excerpt,
          p."createdAt",
          u.name as "authorName",
          ts_rank(
            to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content),
            to_tsquery('english', ${searchQuery})
          ) as rank
        FROM "Post" p
        JOIN "User" u ON p."authorId" = u.id
        WHERE p.published = true
          AND (
            to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content) @@ to_tsquery('english', ${searchQuery})
            OR p.title ILIKE ${`%${query}%`}
            OR p.content ILIKE ${`%${query}%`}
          )
        ORDER BY rank DESC, p."createdAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `,
      prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "Post" p
        WHERE p.published = true
          AND (
            to_tsvector('english', p.title || ' ' || COALESCE(p.excerpt, '') || ' ' || p.content) @@ to_tsquery('english', ${searchQuery})
            OR p.title ILIKE ${`%${query}%`}
            OR p.content ILIKE ${`%${query}%`}
          )
      `,
    ])

    const total = Number((totalResult as { count: bigint }[])[0]?.count || 0)

    return NextResponse.json({
      posts,
      query,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error searching posts:', error)
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    )
  }
}
