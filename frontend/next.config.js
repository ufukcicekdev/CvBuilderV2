// next.config.js

const { i18n } = require('./next-i18next.config');

// 1. withBundleAnalyzer'ı dosyanın başında tanımlayın
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: false,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://web-production-9f41e.up.railway.app/api/:path*',
      },
    ];
  },
  
  poweredByHeader: false,
  compress: true,
  
  images: {
    // ⚠️ DİKKAT: Bu ayarı 'false' yaptım. 'true' olması tüm resim optimizasyonunu kapatır ve mobil skoru düşürür.
    unoptimized: false, 
    domains: ['web-production-9f41e.up.railway.app', 'cekfisi.fra1.cdn.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    // Bu satırı sildim çünkü headers içinde daha kapsamlı bir CSP tanımınız var.
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  
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
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Priority',
            value: 'high'
          },
          // Add Content-Security-Policy to restrict third-party resources
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' www.googletagmanager.com www.google-analytics.com www.gstatic.com www.google.com accounts.google.com googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline' fonts.googleapis.com accounts.google.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https: www.google-analytics.com www.googletagmanager.com www.google.com www.gstatic.com; connect-src 'self' https://web-production-9f41e.up.railway.app https://www.paytr.com www.google-analytics.com www.googletagmanager.com www.google.com www.gstatic.com accounts.google.com google.com; frame-ancestors 'self'; frame-src www.google.com www.gstatic.com www.googletagmanager.com accounts.google.com td.doubleclick.net; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; base-uri 'self';"

          },
          // Add cookie policies
          {
            key: 'Set-Cookie',
            value: 'Path=/; HttpOnly; Secure; SameSite=Strict'
          }
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Priority',
            value: 'critical'
          },
          {
            key: 'x-nextjs-page',
            value: '/'
          }
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          }
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/:path*.js.map',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        source: '/images/hero-image.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Priority',
            value: 'highest'
          }
        ],
      },
    ];
  },
  
  // Webpack optimizasyonları
  webpack: (config, { dev, isServer }) => {
    // For better source maps in both development and production
    if (!isServer) {
      // More detailed source maps for development
      if (dev) {
        config.devtool = 'eval-source-map';
      } else {
        // Proper source maps for production
        config.devtool = 'source-map';
      }
    }
    
    // Only run in production client-side build
    if (!dev && !isServer) {
      // Optimize for production
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          ...config.optimization.minimizer || [],
          // Ensure terser generates source maps
          new (require('terser-webpack-plugin'))({
            terserOptions: {
              sourceMap: true,
            },
          }),
        ],
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|@mui)[\\/]/,
              priority: 40,
              chunks: 'all',
              enforce: true,
            },
            commons: {
              name: 'commons',
              minChunks: 3,
              priority: 30,
              chunks: 'all',
              reuseExistingChunk: true,
            }
          },
        },
      };
      
      // Add plugins for source map generation
      config.plugins.push(
        new (require('webpack')).SourceMapDevToolPlugin({
          filename: '[file].map',
          // Specifically include these files
          include: [
            /pages[\\/]index\.js/,
            /pages[\\/]_app\.js/,
            /chunks[\\/]main\.js/,
          ],
        })
      );
    }
    
    return config;
  },
  
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: true,
    legacyBrowsers: false
  },
  
  productionBrowserSourceMaps: true
};

// 3. Mevcut 'nextConfig' objenizi withBundleAnalyzer ile sarmalayarak dışa aktarın
module.exports = withBundleAnalyzer(nextConfig);
