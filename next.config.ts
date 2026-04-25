import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  turbopack: {
    root: __dirname,
  },
  
  // Server configuration for long-running API routes
  // Note: API route timeout is configured in the route file itself using export const maxDuration = 300
  
  // Experimental features
  experimental: {
    // Turbopack is now the default build system in Next.js 16
  },
  
  // Proxy all API calls to the Go backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
    return [
      // API routes are handled by Next.js App Router (defined in src/app/api/)
      // Only proxy unmatched paths to gateway
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
      // Health check endpoint (public, no auth required)
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
    ];
  },
  
  // Security headers including Content Security Policy
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: isDevelopment
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for dev
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*",
                  "media-src 'self' blob: data:",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline'", // unsafe-inline for Next.js inline scripts
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://*.lexiassist.com wss://*.lexiassist.com",
                  "media-src 'self' blob: data:",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Allow images from any source (if needed)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // Disable strict mode in development for better debugging
  reactStrictMode: true,
};

export default nextConfig;
