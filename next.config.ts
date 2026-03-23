import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Enable standalone output only for production builds (Docker)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
