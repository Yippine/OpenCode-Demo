// 驗證 Token API
import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return unauthorizedResponse()
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return unauthorizedResponse('無效的 Token')
    }

    return successResponse({ user: decoded })
  } catch (error) {
    return errorResponse('驗證失敗')
  }
}
