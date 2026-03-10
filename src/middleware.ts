import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const publicRoutes = ['/', '/login', '/register']
const authRoutes = ['/login', '/register']
const adminPrefix = '/admin'
const dashboardPrefix = '/dashboard'

const ADMIN_ROLES = ['PLATFORM_ADMIN', 'LANDLORD']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const userRole = req.auth?.user?.role

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    const redirectTo = userRole && ADMIN_ROLES.includes(userRole)
      ? '/admin/users'
      : '/dashboard/overview'
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Require auth for everything else
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin route protection
  if (pathname.startsWith(adminPrefix)) {
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard/overview', req.url))
    }
  }

  // Redirect admin-only roles from user dashboard to admin
  if (pathname.startsWith(dashboardPrefix)) {
    if (userRole && userRole === 'PLATFORM_ADMIN') {
      return NextResponse.redirect(new URL('/admin/users', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|.*\\..*).*)',
  ],
}
