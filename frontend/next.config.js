const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // API isteklerini backend'e yönlendirmek için proxy ayarları
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://web-production-9f41e.up.railway.app/api/:path*',
      },
    ];
  },
  
  // SEO optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  
  // Image optimization
  images: {
    domains: ['web-production-9f41e.up.railway.app'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig; 