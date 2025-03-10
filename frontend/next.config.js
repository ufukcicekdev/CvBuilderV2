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
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 