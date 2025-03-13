import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
  noIndex?: boolean;
}

const defaultSEO = {
  title: 'CV Builder - Create Professional Resumes Online',
  description: 'Create professional CVs and resumes with our easy-to-use online CV builder. Choose from multiple templates and customize your resume in minutes.',
  keywords: 'cv builder, resume builder, professional cv, job application, career, resume templates',
  ogImage: '/og-image.svg',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

export default function SEO({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  ogImage = defaultSEO.ogImage,
  ogType = defaultSEO.ogType as 'website' | 'article' | 'profile',
  twitterCard = defaultSEO.twitterCard as 'summary' | 'summary_large_image' | 'app' | 'player',
  canonicalUrl,
  noIndex = false,
}: SEOProps) {
  const router = useRouter();
  const fullUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cvbuilder.com';
  const currentPath = router.asPath;
  const currentUrl = `${fullUrl}${currentPath}`;
  const canonical = canonicalUrl || currentUrl;
  
  // Construct the full title with site name
  const fullTitle = `${title} | CV Builder`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots Meta Tags */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${fullUrl}${ogImage}`} />
      <meta property="og:site_name" content="CV Builder" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${fullUrl}${ogImage}`} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content={router.locale || 'en'} />
    </Head>
  );
} 