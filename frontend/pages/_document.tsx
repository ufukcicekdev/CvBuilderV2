import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Character Set */}
        <meta charSet="utf-8" />
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="_wjG1zyN1kIjuRjyx52ty9Cdpc_rwjXVuTLGvWbzAkg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/favicon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Resource Hints - Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for third-party resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/hero-image.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/og-image.svg" as="image" type="image/svg+xml" />
        
        {/* Critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Box sizing */
          *, *::before, *::after {
            box-sizing: border-box;
          }
          
          /* Basic reset */
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-display: swap;
          }
          
          /* Hero section - prevent layout shift */
          .hero-section {
            min-height: 600px;
            position: relative;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            padding: 48px 0;
            overflow: hidden;
          }
          
          @media (max-width: 768px) {
            .hero-section {
              min-height: 800px;
              padding: 32px 0;
            }
          }
          
          /* Hero image container */
          .hero-image-wrapper {
            position: relative;
            width: 100%;
            height: 500px;
          }
          
          @media (max-width: 768px) {
            .hero-image-wrapper {
              height: 300px;
            }
          }
          
          /* Critical image styling */
          .critical-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            background-color: #f0f0f0;
          }
          
          /* Content containers - prevent layout shift */
          .feature-card {
            min-height: 280px;
          }
          
          .testimonial-card {
            min-height: 320px;
          }
          
          /* Add background color to image placeholders */
          img {
            background-color: #f0f0f0;
          }
          
          /* SVG ve ikonlar için özel stil */
          svg, [class*="icon"], [class*="Icon"], .MuiSvgIcon-root, .MuiIcon-root, 
          img[src$=".svg"] {
            background-color: transparent !important;
          }
          
          /* Font optimization */
          @font-face {
            font-display: swap;
          }
          
          /* Button styles for quicker rendering */
          .MuiButton-root {
            min-height: 36px;
          }
          
          /* Prevent content from jumping - establish space */
          main {
            min-height: 100vh;
          }
          
          /* Hide content when still loading JS */
          .js-content {
            opacity: 0;
          }
          .js-loaded .js-content {
            opacity: 1;
            transition: opacity 0.2s ease-in;
          }
        `}} />
        
        {/* Script to quickly mark loaded state (minimize FOUC) */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.documentElement.classList.add('js-loading');
          window.addEventListener('DOMContentLoaded', function() {
            document.documentElement.classList.remove('js-loading');
            document.documentElement.classList.add('js-loaded');
          });
        `}} />
        
        {/* Meta tags that don't change between pages */}
        <meta name="theme-color" content="#3F51B5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Performance optimization headers */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
        <meta httpEquiv="Permissions-Policy" content="interest-cohort=()" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 