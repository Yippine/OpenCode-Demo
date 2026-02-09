// 記錄頁面瀏覽
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, referrer, country, device } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 檢查今天是否已有記錄
    const existingAnalytics = await prisma.analytics.findFirst({
      where: {
        postId,
        date: today,
      },
    })

    if (existingAnalytics) {
      // 更新現有記錄
      await prisma.analytics.update({
        where: { id: existingAnalytics.id },
        data: {
          pageView: { increment: 1 },
        },
      })
    } else {
      // 建立新記錄
      await prisma.analytics.create({
        data: {
          postId,
          pageView: 1,
          uniqueVisitor: 1,
          referrer,
          country,
          device,
          date: today,
        },
      })
    }

    return successResponse(null)
  } catch (error) {
    console.error('Error tracking view:', error)
    return successResponse(null)
  }
}
