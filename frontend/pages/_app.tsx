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
  }, []);

  if (isSSR) {
    return null;
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>CV Builder</title>
      </Head>
      <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HDJ50NB3XE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HDJ50NB3XE');
          `}
        </Script>
        
        <AuthProvider>
          <LanguageProvider>
            <Providers>
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