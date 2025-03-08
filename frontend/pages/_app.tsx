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
    <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
      <AuthProvider>
        <LanguageProvider>
          <Providers>
            <Component {...pageProps} />
            <Toaster position={isRTL ? "top-left" : "top-right"} />
          </Providers>
        </LanguageProvider>
      </AuthProvider>
    </CacheProvider>
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