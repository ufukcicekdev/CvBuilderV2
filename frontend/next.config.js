const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n, // Geçici olarak devre dışı bırakıldı
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
  
  // Statik HTML dışa aktarma için
  output: 'export',
  // Statik dışa aktarma için görüntüleri optimize etmeyi devre dışı bırak
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 