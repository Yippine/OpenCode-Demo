// 後台文章管理 API
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { generateSlug } from '@/lib/slug'
import { postSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

// 驗證管理員權限
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return null
  }

  return decoded
}

// 取得所有文章（後台）
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const posts = await prisma.post.findMany({
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
    return errorResponse('取得文章失敗')
  }
}

// 建立文章
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    
    const result = postSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.errors[0].message)
    }

    const { title, content, excerpt, coverImage, published, metaTitle, metaDesc, tagIds } = result.data

    const slug = generateSlug(title)
    
    // 檢查 slug 是否已存在
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return errorResponse('文章標題已存在')
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || title.substring(0, 150),
        coverImage,
        published,
        metaTitle: metaTitle || title,
        metaDesc: metaDesc || excerpt || title,
        authorId: user.userId,
        tags: tagIds ? {
          connect: tagIds.map(id => ({ id })),
        } : undefined,
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

    return successResponse(post, '文章建立成功')
  } catch (error) {
    console.error('Error creating post:', error)
    return errorResponse('建立文章失敗')
  }
}
