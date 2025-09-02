import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="tr">
        <Head>
          {/* Character Set */}
          <meta charSet="utf-8" />
          
          {/* Google Search Console Verification */}
          <meta name="google-site-verification" content="_wjG1zyN1kIjuRjyx52ty9Cdpc_rwjXVuTLGvWbzAkg" />
          
          {/* Favicon - Optimized loading */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.svg" type="image/svg+xml" />
          <link rel="manifest" href="/site.webmanifest" />
          
          {/* Resource Hints - For high priority domains */}
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://web-production-9f41e.up.railway.app" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://cekfisi.fra1.cdn.digitaloceanspaces.com" crossOrigin="anonymous" />
          
          {/* DNS Prefetch for third-party resources */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://web-production-9f41e.up.railway.app" />
          <link rel="preconnect" href="https://cekfisi.fra1.cdn.digitaloceanspaces.com" />
          
          {/* Preload absolutely critical resources for index page */}
          <link 
            rel="preload" 
            href="/hero-image.svg" 
            as="image" 
            type="image/svg+xml" 
          />
          
          {/* Add fetchpriority with HTML method that bypasses React's prop system */}
          {(() => {
            // This executes on render and manipulates the DOM directly
            if (typeof document !== 'undefined') {
              setTimeout(() => {
                const link = document.querySelector('link[href="/hero-image.svg"]');
                if (link) {
                  (link as HTMLElement).dataset.fetchpriority = 'high'; // Cast to HTMLElement
                }
              }, 0);
            }
            return null;
          })()}
          
          {/* Make sure critical fonts are loaded early, but don't block rendering */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            as="style"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          
          {/* Critical CSS - Optimized with only the most critical styles */}
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
              color: #1a202c;
              background-color: #f8f9fa;
            }
            
            /* Prevent layout shifts for key elements */
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
            .hero-image {
              position: relative;
              z-index: 1;
            }
            
            /* Optimize loading experience */
            .js-loading {
              visibility: hidden;
            }
            
            .js-loaded {
              visibility: visible;
              transition: 0.2s ease-in;
            }
            
            /* Button styling for initial render */
            .button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              position: relative;
              box-sizing: border-box;
              min-width: 64px;
              padding: 6px 16px;
              border-radius: 4px;
              color: rgba(0, 0, 0, 0.87);
              font-size: 0.875rem;
              font-weight: 500;
              font-family: inherit;
              line-height: 1.75;
              transition: background-color 250ms ease;
              cursor: pointer;
            }
            
            .button-primary {
              background-color: #4F46E5;
              color: white;
            }
            
            /* Prevent content from jumping */
            main {
              min-height: 600px;
            }
            
            /* Set background for images to avoid layout shift */
            img {
              background-color: #f8f9fa;
            }
            
            /* SVG optimization */
            svg, .MuiSvgIcon-root, img[src$=".svg"] {
              background-color: transparent !important;
            }
          `}} />
          
          {/* Script to remove no-JS flash and optimize first paint */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              // Add js-loading class on initial load
              document.documentElement.classList.add('js-loading');
              
              // Schedule immediate task to check if JS is running
              setTimeout(function() {
                document.documentElement.classList.remove('js-loading');
                document.documentElement.classList.add('js-loaded');
              }, 0);
              
              // Preload any images in viewport on load
              window.addEventListener('load', function() {
                // Find any images that should be preloaded
                var heroImage = document.querySelector('.hero-image');
                if (heroImage) {
                  heroImage.style.visibility = 'visible';
                }
              });
              
              // Detect connection speed
              if ('connection' in navigator) {
                if (navigator.connection.saveData) {
                  // Add save-data to minimize data usage
                  document.documentElement.classList.add('save-data');
                } else if (navigator.connection.effectiveType.includes('2g')) {
                  // Add slow connection class
                  document.documentElement.classList.add('slow-connection');
                }
              }
            })();
          `}} />
          
          {/* Meta tags that don't change between pages */}
          <meta name="theme-color" content="#4F46E5" />
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
}

export default MyDocument; 