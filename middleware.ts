import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedPaths = ['/dashboard', '/study', '/quiz', '/analytics', '/profile'];

// Auth routes that should redirect to dashboard if already logged in
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if we're in mock mode (frontend-only development)
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

  // In mock mode, skip auth checks but still add headers for API routes
  if (isMockMode) {
    // Add custom headers for API routes (AI Proxy Logic)
    if (pathname.startsWith('/api/ai')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-lexi-internal-caller', 'frontend-proxy');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return NextResponse.next();
  }

  // Check for session token from your User Service (Go backend)
  const token = request.cookies.get('session_token')?.value;
  const isAuthenticated = !!token;

  // Check if current path is protected
  const isProtectedRoute = protectedPaths.some((path) => 
    pathname.startsWith(path)
  );

  // Check if current path is an auth route
  const isAuthRoute = authPaths.some((path) => 
    pathname.startsWith(path)
  );

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add custom headers for API routes (AI Proxy Logic)
  if (pathname.startsWith('/api/ai')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-lexi-internal-caller', 'frontend-proxy');
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Configure matcher for routes that should trigger middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/study/:path*',
    '/quiz/:path*',
    '/analytics/:path*',
    '/profile/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/api/ai/:path*',
  ],
};
