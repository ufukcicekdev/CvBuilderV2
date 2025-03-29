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
    domains: ['web-production-9f41e.up.railway.app', 'cekfisi.fra1.cdn.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // HTTP Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.paddle.com https://sandbox-buy.paddle.com https://*.paddle.com:* http://localhost:* http://localhost;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 