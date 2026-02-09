// 後台標籤管理 API
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

// 取得所有標籤（後台）
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

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
    return errorResponse('取得標籤失敗')
  }
}

// 建立標籤
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    
    const result = tagSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.errors[0].message)
    }

    const { name, description } = result.data

    const slug = generateSlug(name)
    
    // 檢查標籤是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    })

    if (existingTag) {
      return errorResponse('標籤名稱已存在')
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
      },
    })

    return successResponse(tag, '標籤建立成功')
  } catch (error) {
    console.error('Error creating tag:', error)
    return errorResponse('建立標籤失敗')
  }
}
