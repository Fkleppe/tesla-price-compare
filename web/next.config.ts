import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      // Shopify CDN
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      // Partner store image domains
      { protocol: 'https', hostname: 'www.tesery.com' },
      { protocol: 'https', hostname: 'cdn.tesery.com' },
      { protocol: 'https', hostname: 'jowua-life.com' },
      { protocol: 'https', hostname: 'www.jowua-life.com' },
      { protocol: 'https', hostname: 'shop4tesla.com' },
      { protocol: 'https', hostname: 'www.shop4tesla.com' },
      { protocol: 'https', hostname: 'snuuzu.com' },
      { protocol: 'https', hostname: 'www.snuuzu.com' },
      { protocol: 'https', hostname: 'us.snuuzu.com' },
      { protocol: 'https', hostname: 'havnby.com' },
      { protocol: 'https', hostname: 'www.havnby.com' },
      { protocol: 'https', hostname: 'yeslak.com' },
      { protocol: 'https', hostname: 'www.yeslak.com' },
      { protocol: 'https', hostname: 'hansshow.com' },
      { protocol: 'https', hostname: 'www.hansshow.com' },
      { protocol: 'https', hostname: 'hautopart.com' },
      { protocol: 'https', hostname: 'www.hautopart.com' },
      // Additional common CDNs
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://cdn.fontshare.com; img-src 'self' data: https: blob:; font-src 'self' data: https://cdn.fontshare.com; connect-src 'self' https:; frame-ancestors 'none';",
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Redirect old URLs if any
      {
        source: '/products',
        destination: '/',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/category',
        permanent: true,
      },
      {
        source: '/models',
        destination: '/model',
        permanent: true,
      },
    ];
  },

  // Enable React strict mode
  reactStrictMode: true,
};

export default nextConfig;
