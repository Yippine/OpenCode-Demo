// 取得單一標籤和相關文章（前台）
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          where: { published: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            tags: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!tag) {
      return notFoundResponse('標籤不存在')
    }

    return successResponse(tag)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return errorResponse('取得標籤失敗')
  }
}
