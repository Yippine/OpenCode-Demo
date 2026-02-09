// 認證 API
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { generateToken } from '@/lib/jwt'
import { successResponse, errorResponse } from '@/lib/api-response'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return errorResponse(result.error.errors[0].message)
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return errorResponse('電子郵件或密碼錯誤')
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return errorResponse('電子郵件或密碼錯誤')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return successResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, '登入成功')
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('登入失敗')
  }
}
