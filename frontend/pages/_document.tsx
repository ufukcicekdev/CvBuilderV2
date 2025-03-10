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
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Meta tags that don't change between pages */}
        <meta name="theme-color" content="#3F51B5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 