// 後台單一標籤管理
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { generateSlug } from '@/lib/slug'
import { tagSchema } from '@/lib/validation'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

// 取得單一標籤
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

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
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

// 更新標籤
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
    
    const result = tagSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.errors[0].message)
    }

    const { name, description } = result.data

    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return notFoundResponse('標籤不存在')
    }

    // 如果名稱改變，更新 slug
    let slug = existingTag.slug
    if (name !== existingTag.name) {
      slug = generateSlug(name)
      const slugExists = await prisma.tag.findUnique({
        where: { slug },
      })
      if (slugExists && slugExists.id !== id) {
        return errorResponse('標籤名稱已存在')
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    })

    return successResponse(tag, '標籤更新成功')
  } catch (error) {
    console.error('Error updating tag:', error)
    return errorResponse('更新標籤失敗')
  }
}

// 刪除標籤
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

    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return notFoundResponse('標籤不存在')
    }

    await prisma.tag.delete({
      where: { id },
    })

    return successResponse(null, '標籤刪除成功')
  } catch (error) {
    console.error('Error deleting tag:', error)
    return errorResponse('刪除標籤失敗')
  }
}
