// 後台單一文章管理
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { generateSlug } from '@/lib/slug'
import { postSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

// 取得單一文章
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = params

    const post = await prisma.post.findUnique({
      where: { id },
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

    return successResponse(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return errorResponse('取得文章失敗')
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = params
    const body = await request.json()
    
    const result = postSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.errors[0].message)
    }

    const { title, content, excerpt, coverImage, published, metaTitle, metaDesc, tagIds } = result.data

    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return notFoundResponse('文章不存在')
    }

    // 如果標題改變，更新 slug
    let slug = existingPost.slug
    if (title !== existingPost.title) {
      slug = generateSlug(title)
      const slugExists = await prisma.post.findUnique({
        where: { slug },
      })
      if (slugExists && slugExists.id !== id) {
        return errorResponse('文章標題已存在')
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || title.substring(0, 150),
        coverImage,
        published,
        metaTitle: metaTitle || title,
        metaDesc: metaDesc || excerpt || title,
        tags: {
          set: [],
          connect: tagIds?.map(id => ({ id })) || [],
        },
      },
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

    return successResponse(post, '文章更新成功')
  } catch (error) {
    console.error('Error updating post:', error)
    return errorResponse('更新文章失敗')
  }
}

// 刪除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = params

    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return notFoundResponse('文章不存在')
    }

    await prisma.post.delete({
      where: { id },
    })

    return successResponse(null, '文章刪除成功')
  } catch (error) {
    console.error('Error deleting post:', error)
    return errorResponse('刪除文章失敗')
  }
}
