// 分析 API - 取得統計數據
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    // 取得總文章數
    const totalPosts = await prisma.post.count()
    
    // 取得已發布文章數
    const publishedPosts = await prisma.post.count({
      where: { published: true },
    })
    
    // 取得總標籤數
    const totalTags = await prisma.tag.count()
    
    // 取得總瀏覽次數
    const totalViews = await prisma.post.aggregate({
      _sum: { viewCount: true },
    })

    // 取得最近 7 天的瀏覽數據
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyViews = await prisma.analytics.groupBy({
      by: ['date'],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        pageView: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // 取得熱門文章
    const popularPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
      },
    })

    // 取得熱門標籤
    const popularTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    return successResponse({
      overview: {
        totalPosts,
        publishedPosts,
        draftPosts: totalPosts - publishedPosts,
        totalTags,
        totalViews: totalViews._sum.viewCount || 0,
      },
      dailyViews,
      popularPosts,
      popularTags,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return errorResponse('取得分析數據失敗')
  }
}
