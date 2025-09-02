import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { Providers } from '../providers/Providers';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Script from 'next/script';
import Head from 'next/head';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import Analytics from '../components/Analytics';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isRTL = router.locale === 'ar';
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    setIsSSR(false);
    
    // Performans optimizasyonları yerine basit optimizasyonlar
    const optimizePerformance = () => {
      // Basit performans iyileştirmeleri
      if (typeof window !== 'undefined') {
        // Kritik görsellere eager loading ekle
        document.querySelectorAll('img.critical-image').forEach(img => {
          (img as HTMLImageElement).loading = 'eager';
          (img as HTMLImageElement).decoding = 'async';
        });
        
        // Kritik olmayan görsellere lazy loading ekle
        document.querySelectorAll('img:not(.critical-image)').forEach(img => {
          if (!(img as HTMLImageElement).loading) {
            (img as HTMLImageElement).loading = 'lazy';
          }
        });
      }
    };
    
    // Basit optimizasyonları çalıştır
    optimizePerformance();

    // Register route change performance markers
    const handleRouteChangeStart = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        window.performance.mark('routeChangeStart');
      }
    };

    const handleRouteChangeComplete = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        window.performance.mark('routeChangeComplete');
        window.performance.measure(
          'routeChange',
          'routeChangeStart',
          'routeChangeComplete'
        );
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  if (isSSR) {
    return null;
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>CV Builder</title>
        
        {/* Critical preconnects for performance */}
        <link rel="preconnect" href="https://web-production-9f41e.up.railway.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cekfisi.fra1.cdn.digitaloceanspaces.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          
          .hero-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            padding: 48px 0;
            min-height: 600px;
            overflow: hidden;
            position: relative;
          }
        `}} />
      </Head>
        <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
          <Analytics />
          
          <AuthProvider>
            <LanguageProvider>
              <Providers>
                {/* Add progress bar for better perceived performance */}
                <ProgressBar
                  height="3px"
                  color="#38a169"
                  options={{ showSpinner: false }}
                  shallowRouting
                />
                <Component {...pageProps} />
                <Toaster position={isRTL ? "top-left" : "top-right"} />
              </Providers>
            </LanguageProvider>
          </AuthProvider>
        </CacheProvider>
    </>
  );
}

export default appWithTranslation(MyApp);

// Add getInitialProps to load translations
MyApp.getInitialProps = async ({ Component, ctx }: any) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps };
}; 