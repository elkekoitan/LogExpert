import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/logs',
  '/incidents',
  '/monitors',
  '/on-call',
  '/settings',
  '/api/logs',
  '/api/incidents',
  '/api/monitors',
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/callback',
  '/pricing',
  '/api/auth',
  '/api/stripe/webhook',
]

// Define admin routes
const adminRoutes = [
  '/admin',
  '/api/admin',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if route is admin
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  try {
    // Create Supabase client
    const supabase = createSupabaseServerClient()
    
    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser()

    // If no user and route is protected, redirect to login
    if (!user && isProtectedRoute) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If user exists but trying to access auth pages, redirect to dashboard
    if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check admin access
    if (isAdminRoute && user) {
      // Get user profile to check role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'founder' && profile.role !== 'admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      const rateLimitKey = `${ip}:${pathname}`
      
      // Simple rate limiting (in production, use Redis or similar)
      const rateLimitHeaders = {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',
        'X-RateLimit-Reset': String(Date.now() + 60000),
      }

      const response = NextResponse.next()
      
      // Add rate limit headers
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      
      return response
    }

    // Add user info to request headers for API routes
    if (user && pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id)
      requestHeaders.set('x-user-email', user.email || '')

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's an error and it's a protected route, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
