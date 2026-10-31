import { withSentryConfig } from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'prssn-backend.onrender.com',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.render.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '').replace(/:\d+/, '') || '',
        pathname: '/uploads/**',
      }
    ],
    formats: ['image/avif', 'image/webp'], // Use modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimize for common device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 75, 80],
  },
  devIndicators: {
    buildActivity: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

// In local development, export nextConfig directly to make compilation and page loading 3-5x faster.
// In production builds (CI/Vercel), wrap with withSentryConfig for error tracking.
export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, {
      org: "awadh-z7",
      project: "rent-a-fellow-frontend",
      silent: !process.env.CI,
      widenClientFileUpload: false,
      tunnelRoute: "/monitoring",
    })
  : nextConfig;
