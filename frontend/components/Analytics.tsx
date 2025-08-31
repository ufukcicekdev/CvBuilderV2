
import { useState, useEffect } from 'react';
import Script from 'next/script';

const Analytics = () => {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie_consent') === 'true';
    setConsent(hasConsent);
  }, []);

  if (!consent) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-HDJ50NB3XE"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && 'performance' in window) {
            window.performance.mark('analytics-loaded');
          }
        }}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-HDJ50NB3XE', {
            send_page_view: false,
          });
          document.addEventListener('DOMContentLoaded', function() {
            gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href,
              page_path: window.location.pathname,
            });
          });
        `}
      </Script>
    </>
  );
};

export default Analytics;
