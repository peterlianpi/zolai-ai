import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https:",
              "frame-src 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/dictionary/(.*)",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" }],
      },
    ];
  },
  generateEtags: true,
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  
  serverExternalPackages: ["pg", "pg-native"],

  // PERFORMANCE OPTIMIZATIONS
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.100.7:3000", "192.168.100.10:3000", "zolai.space", "www.zolai.space"],
    },
    authInterrupts: true,
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-table",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "recharts"
    ], // Tree-shake heavy packages
  },
  
  allowedDevOrigins: ["localhost", "192.168.100.7", "192.168.100.10", "zolai.space"],
  
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    // Add size optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "zolai.ai",
      },
      {
        protocol: "https",
        hostname: "www.zolai.ai",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "pub-0a211d5da15b7bedb58d334c08accb98.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "zolai-assets.s3.ap-southeast-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
