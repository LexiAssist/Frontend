import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  turbopack: {
    root: __dirname,
  },
  
  // Proxy all API calls to the Go backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  
  // Allow images from any source (if needed)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
