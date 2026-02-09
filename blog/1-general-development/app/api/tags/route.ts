// 取得所有標籤（前台）
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return successResponse(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return successResponse([])
  }
}
