import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const publicRoutes = ['/', '/login', '/register']
const authRoutes = ['/login', '/register']
const adminPrefix = '/admin'
const landlordPrefix = '/landlord'
const dashboardPrefix = '/dashboard'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth
  const userRole = req.auth?.user?.role

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    if (userRole === 'PLATFORM_ADMIN') return NextResponse.redirect(new URL('/admin/users', req.url))
    if (userRole === 'LANDLORD') return NextResponse.redirect(new URL('/landlord/tenants', req.url))
    return NextResponse.redirect(new URL('/dashboard/overview', req.url))
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

  // Admin route protection - only PLATFORM_ADMIN
  if (pathname.startsWith(adminPrefix)) {
    if (userRole !== 'PLATFORM_ADMIN') {
      if (userRole === 'LANDLORD') return NextResponse.redirect(new URL('/landlord/tenants', req.url))
      return NextResponse.redirect(new URL('/dashboard/overview', req.url))
    }
  }

  // Landlord route protection - only LANDLORD
  if (pathname.startsWith(landlordPrefix)) {
    if (userRole !== 'LANDLORD') {
      if (userRole === 'PLATFORM_ADMIN') return NextResponse.redirect(new URL('/admin/users', req.url))
      return NextResponse.redirect(new URL('/dashboard/overview', req.url))
    }
  }

  // Redirect non-tenant roles from user dashboard
  if (pathname.startsWith(dashboardPrefix)) {
    if (userRole === 'PLATFORM_ADMIN') return NextResponse.redirect(new URL('/admin/users', req.url))
    if (userRole === 'LANDLORD') return NextResponse.redirect(new URL('/landlord/tenants', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|.*\\..*).*)',
  ],
}
