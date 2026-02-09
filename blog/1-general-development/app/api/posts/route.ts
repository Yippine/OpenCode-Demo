// 取得所有文章（前台）
import { prisma } from '@/lib/prisma'
import { successResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
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
    })

    return successResponse(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return successResponse([])
  }
}
