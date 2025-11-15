import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('smm_session')
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/admin/login']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (!sessionCookie && !isPublicRoute) {
    // Check if it's an admin route
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // Regular user routes
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is authenticated, parse the session to check role
  if (sessionCookie && sessionCookie.value) {
    try {
      const user = JSON.parse(sessionCookie.value)
      
      // If trying to access login pages while authenticated, redirect to dashboard
      if (isPublicRoute) {
        if (user.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/users', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Check if user has correct role for admin routes
      if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (user.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }

      // Regular users cannot access admin routes (already handled above)
      // Admins can access all user routes - no restriction needed
    } catch (error) {
      // If session parsing fails, clear cookie and redirect to login
      console.error('Session parse error:', error)
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('smm_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

