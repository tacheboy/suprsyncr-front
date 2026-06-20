/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4566',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.unifiedseller.com',
        pathname: '/**',
        },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_S3_ENDPOINT: process.env.NEXT_PUBLIC_S3_ENDPOINT,
    NEXT_PUBLIC_S3_BUCKET: process.env.NEXT_PUBLIC_S3_BUCKET,
  },
};

module.exports = nextConfig;
