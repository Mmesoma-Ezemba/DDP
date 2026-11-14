import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to protect routes and redirect unauthenticated users
 * This runs on the edge before the request reaches the page
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/claim', '/demo']
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Static assets and API routes should not be protected
  const isStaticAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/api') || 
                        pathname.startsWith('/assets') ||
                        pathname.startsWith('/fonts') ||
                        pathname.includes('.')
  
  if (isPublicRoute || isStaticAsset) {
    return NextResponse.next()
  }

  // Check for authentication token (simple check for now)
  // In a production app, you'd validate the JWT token here
  const authToken = request.cookies.get('auth-token')
  const walletAddress = request.cookies.get('wallet-address')
  
  // If no authentication found, redirect to login
  if (!authToken && !walletAddress) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}

