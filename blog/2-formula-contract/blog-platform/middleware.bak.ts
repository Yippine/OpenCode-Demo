import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      return null
    }

    if (isAdminPage && !isAuth) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    return null
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (req.nextUrl.pathname.startsWith('/admin/login')) {
          return true
        }
        return token !== null
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*'],
}
