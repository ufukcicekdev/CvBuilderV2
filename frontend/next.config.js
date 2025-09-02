const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  swcMinify: false, // For better source maps, disable swcMinify
  
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
  
  // Image optimization with more aggressive settings
  images: {
    domains: ['web-production-9f41e.up.railway.app', 'cekfisi.fra1.cdn.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // HTTP Headers with cache optimizations and security
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' www.googletagmanager.com www.google-analytics.com www.gstatic.com www.google.com accounts.google.com googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline' fonts.googleapis.com accounts.google.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https: www.google-analytics.com www.googletagmanager.com www.google.com www.gstatic.com; connect-src 'self' https://web-production-9f41e.up.railway.app www.google-analytics.com www.googletagmanager.com www.google.com www.gstatic.com accounts.google.com google.com; frame-ancestors 'self'; frame-src www.google.com www.gstatic.com www.googletagmanager.com accounts.google.com td.doubleclick.net; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; base-uri 'self';"

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
  
  // Performance optimizations for Next.js 14.1.3
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: true,
    legacyBrowsers: false
  },
  
  // Enable source maps in production
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;