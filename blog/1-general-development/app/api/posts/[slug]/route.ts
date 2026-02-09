// 取得單一文章（前台）
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.post.findUnique({
      where: { slug, published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    })

    if (!post) {
      return notFoundResponse('文章不存在')
    }

    // 增加瀏覽次數
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })

    return successResponse(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return errorResponse('取得文章失敗')
  }
}
