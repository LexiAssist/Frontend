import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth routes that should redirect to dashboard if already logged in
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Note: Route protection is handled client-side via useAuthStore (Zustand).
  // The JWT access token is stored in sessionStorage, which is not accessible
  // in middleware (server-side). Therefore, middleware does NOT block protected
  // routes — client-side guards in the (main) layout handle auth redirects.

  return NextResponse.next();
}

// Configure matcher - only run middleware on API routes that need header injection
export const config = {
  matcher: [
    '/api/ai/:path*',
  ],
};
