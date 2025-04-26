'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

// Add proper declaration for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params: any) => void;
  }
}

// Hero SVG - Optimized with accessibility improvements
const HeroSvg = () => (
  <svg 
    width="100%" 
    height="100%" 
    viewBox="0 0 800 600" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="CV Builder Illustration"
    role="img"
  >
    <title>CV Builder Illustration</title>
    <desc>An illustration showing a CV document with various sections</desc>
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.9"/>
      </linearGradient>
      <clipPath id="screenMask">
        <rect x="110" y="70" width="580" height="380" rx="20" />
      </clipPath>
    </defs>
    
    {/* Background Elements */}
    <circle cx="650" cy="120" r="80" fill="url(#gradient1)" opacity="0.1" />
    <circle cx="150" cy="500" r="100" fill="url(#gradient1)" opacity="0.1" />
    <circle cx="400" cy="300" r="150" fill="url(#gradient1)" opacity="0.05" />
    
    {/* CV Document */}
    <rect x="110" y="70" width="580" height="380" rx="20" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
    
    {/* CV Content */}
    <g clipPath="url(#screenMask)">
      {/* Header */}
      <rect x="110" y="70" width="580" height="80" fill="#F9FAFB" />
      <circle cx="170" cy="110" r="30" fill="#4F46E5" />
      <rect x="220" y="95" width="200" height="12" rx="6" fill="#111827" />
      <rect x="220" y="115" width="150" height="10" rx="5" fill="#6B7280" />
      
      {/* Content */}
      <rect x="130" y="170" width="200" height="15" rx="7" fill="#4F46E5" />
      <rect x="130" y="195" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="215" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="235" width="540" height="10" rx="5" fill="#E5E7EB" />
      
      <rect x="130" y="270" width="200" height="15" rx="7" fill="#4F46E5" />
      <rect x="130" y="295" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="315" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="335" width="540" height="10" rx="5" fill="#E5E7EB" />
      
      <rect x="130" y="370" width="200" height="15" rx="7" fill="#4F46E5" />
      <rect x="130" y="395" width="540" height="10" rx="5" fill="#E5E7EB" />
      <rect x="130" y="415" width="540" height="10" rx="5" fill="#E5E7EB" />
    </g>
  </svg>
);

// Template SVG - Optimized with accessibility improvements
const TemplateSvg = () => (
  <svg 
    width="100%" 
    height="100%" 
    viewBox="0 0 400 300" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="CV Template Example"
    role="img"
  >
    <title>CV Template Example</title>
    <desc>A simplified illustration of a CV template design</desc>
    <rect width="400" height="300" fill="#F9FAFB" rx="8" />
    <rect x="20" y="20" width="100" height="100" rx="50" fill="#4F46E5" />
    <rect x="140" y="30" width="240" height="20" rx="4" fill="#111827" />
    <rect x="140" y="60" width="180" height="15" rx="4" fill="#6B7280" />
    <rect x="140" y="85" width="220" height="15" rx="4" fill="#6B7280" />
    <rect x="20" y="140" width="360" height="1" fill="#E5E7EB" />
    <rect x="20" y="160" width="150" height="15" rx="4" fill="#4F46E5" />
    <rect x="20" y="185" width="360" height="10" rx="4" fill="#E5E7EB" />
    <rect x="20" y="205" width="360" height="10" rx="4" fill="#E5E7EB" />
    <rect x="20" y="225" width="360" height="10" rx="4" fill="#E5E7EB" />
    <rect x="20" y="245" width="180" height="10" rx="4" fill="#E5E7EB" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, user } = useAuth();

  // Function to measure LCP
  const measureLCP = () => {
    if (typeof window !== 'undefined') {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as unknown as {
          startTime: number;
          element?: Element;
        };
        const lcpTime = lastEntry.startTime;
        // Only log in development
        if (process.env.NODE_ENV !== 'production') {
          console.log(`LCP: ${lcpTime}ms`);
        }
        
        // Send to analytics if available
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            metric_name: 'LCP',
            metric_value: lcpTime,
          });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }
  };

  useEffect(() => {
    setMounted(true);
    
    // Start LCP measurement
    measureLCP();
    
    // Optimize hero image loading
    const heroImg = document.querySelector('.hero-image') as HTMLImageElement;
    if (heroImg) {
      heroImg.loading = 'eager';
      heroImg.fetchPriority = 'high';
    }
    
    // Preconnect to important domains
    const links = [
      { rel: 'preconnect', href: 'https://web-production-9f41e.up.railway.app' },
      { rel: 'preconnect', href: 'https://cekfisi.fra1.cdn.digitaloceanspaces.com' },
    ];
    
    links.forEach(linkData => {
      const link = document.createElement('link');
      link.rel = linkData.rel;
      link.href = linkData.href;
      document.head.appendChild(link);
    });
    
  }, []);

  const features = [
    {
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      title: t('home.features.feature1.title'),
      description: t('home.features.feature1.description')
    },
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: t('home.features.feature2.title'),
      description: t('home.features.feature2.description')
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: t('home.features.feature3.title'),
      description: t('home.features.feature3.description')
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: t('home.features.feature4.title'),
      description: t('home.features.feature4.description')
    }
  ];

  const steps = t('home.howItWorks.steps', { returnObjects: true }) as unknown as Array<{ title: string; description: string }>;

  const stats = [
    { key: 'users', value: '10K+' },
    { key: 'companies', value: '500+' },
    { key: 'cvs', value: '50K+' },
    { key: 'hires', value: '5K+' },
  ];

  const testimonials = [
    {
      name: "Ahmet Yılmaz",
      role: "Yazılım Geliştirici",
      content: "CV Builder sayesinde profesyonel bir özgeçmiş hazırladım ve hayalini kurduğum işi buldum. Kullanımı çok kolay ve sonuçlar etkileyici!",
      rating: 5
    },
    {
      name: "Ayşe Kaya",
      role: "Grafik Tasarımcı",
      content: "Modern şablonlar ve kullanıcı dostu arayüz ile CV'mi dakikalar içinde oluşturdum. İş görüşmelerinden olumlu geri dönüşler aldım.",
      rating: 5
    },
    {
      name: "Mehmet Demir",
      role: "Pazarlama Uzmanı",
      content: "Diğer CV oluşturma araçlarını denedim, ancak CV Builder hepsinden daha iyi. Özelleştirme seçenekleri ve profesyonel tasarımlar mükemmel.",
      rating: 4
    }
  ];

  if (!mounted) {
    return (
      <Layout>
        <Container maxWidth="sm">
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h3" gutterBottom>
              CV Builder
            </Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={t('home.seo.title')}
        description={t('home.seo.description')}
        canonicalUrl="/"
      />
      
      {/* Hero Section */}
      <Box 
        component="section" 
        aria-labelledby="hero-heading"
        sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          pt: { xs: 4, sm: 8 },
          pb: { xs: 8, sm: 12 },
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  id="hero-heading"
                  component="h1"
                  variant="h2"
                  color="text.primary"
                  
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  {t('home.hero.title')}
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 4, maxWidth: '90%' }}
                >
                  {t('home.hero.subtitle')}
                </Typography>

                {/* 7 Günlük Ücretsiz Deneme Banner'ı */}
                <Box 
                  sx={{ 
                    mb: 4, 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white',
                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                    transform: 'scale(1.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
                      zIndex: 1
                    }
                  }}
                  role="complementary"
                  aria-label={t('subscription.freeTrialText')}
                >
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {t('subscription.freeTrialText')}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    component="p"
                    sx={{
                      mt: 1,
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {t('subscription.freeTrialDescription')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {isAuthenticated ? (
                    <Button
                      component={NextLink}
                      href={user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv'}
                      variant="contained"
                      size="large"
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                      }}
                      endIcon={<ArrowForwardIcon />}
                      aria-label={t('home.hero.toDashboard')}
                    >
                      {t('home.hero.toDashboard')}
                    </Button>
                  ) : (
                    <>
                      <Button
                        component={NextLink}
                        href="/register"
                        variant="contained"
                        size="large"
                        sx={{ 
                          px: 4, 
                          py: 1.5, 
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                        }}
                        endIcon={<ArrowForwardIcon />}
                        aria-label={t('home.hero.cta')}
                      >
                        {t('home.hero.cta')}
                      </Button>
                      <Button
                        component={NextLink}
                        href="/login"
                        variant="outlined"
                        size="large"
                        sx={{ 
                          px: 4, 
                          py: 1.5, 
                          borderRadius: '8px',
                          fontWeight: 'bold'
                        }}
                        aria-label={t('auth.dontHaveAccount')}
                      >
                        {t('auth.dontHaveAccount')}
                      </Button>
                    </>
                  )}
                </Box>
                <Box component="ul" sx={{ mt: 4, pl: 0, listStyle: 'none' }}>
                  <Box component="li" sx={{ mt: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" aria-hidden="true" />
                    <Typography variant="body2" component="span" color="text.secondary">
                      {t('home.hero.feature1')}
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" aria-hidden="true" />
                    <Typography variant="body2" component="span" color="text.secondary">
                      {t('home.hero.feature2')}
                    </Typography>
                  </Box>
                  <Box component="li" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" aria-hidden="true" />
                    <Typography variant="body2" component="span" color="text.secondary">
                      {t('home.hero.feature3')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  transform: { xs: 'scale(0.9)', md: 'scale(1)' },
                  '&:hover': {
                    transform: { xs: 'scale(0.92)', md: 'scale(1.02)' },
                    transition: 'transform 0.3s ease-in-out',
                  },
                }}
                className="hero-image"
              >
                <HeroSvg />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" aria-labelledby="features-heading" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 'bold', letterSpacing: 1.2 }}
            >
              {t('home.features.overline')}
            </Typography>
            <Typography
              id="features-heading"
              component="h2"
              variant="h3"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700, mt: 1 }}
            >
              {t('home.features.title')}
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              {t('home.features.subtitle')}
            </Typography>
          </Box>

          {/* 7 Günlük Ücretsiz Deneme Feature Box */}
          <Box
            sx={{
              p: 3,
              mb: 5,
              borderRadius: 3,
              bgcolor: 'primary.light',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.3), 0 10px 10px -5px rgba(79, 70, 229, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                backgroundSize: 'cover',
                opacity: 0.2,
                zIndex: 0
              }
            }}
            role="complementary"
            aria-label={t('subscription.freeTrialText')}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {t('subscription.freeTrialText')}
              </Typography>
              <Typography variant="h5" component="h3" sx={{ mb: 3 }}>
                {t('subscription.freeTrialDescription')}
              </Typography>

              <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 'bold' }}>
                      {t('home.hero.feature1')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 'bold' }}>
                      {t('home.hero.feature2')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 'bold' }}>
                      {t('home.hero.feature3')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button
                component={NextLink}
                href="/register"
                variant="contained"
                size="large"
                sx={{ 
                  mt: 4,
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}
              >
                {t('home.hero.cta')}
              </Button>
            </Box>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[10],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" component="p" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Templates Preview Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 'bold', letterSpacing: 1.2 }}
            >
              {t('home.templates.overline')}
            </Typography>
            <Typography
              component="h2"
              variant="h3"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700, mt: 1 }}
            >
              {t('home.templates.title')}
            </Typography>
            <Typography
              variant="subtitle1"
              component="p"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              {t('home.templates.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {[1, 2, 3].map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template}>
                <Box
                  sx={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: theme.shadows[2],
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <TemplateSvg />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            {isAuthenticated ? (
              <Button
                component={NextLink}
                href={user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv'}
                variant="contained"
                size="large"
                sx={{ borderRadius: '8px', px: 4, py: 1.5 }}
              >
                {t('home.hero.toDashboard')}
              </Button>
            ) : (
              <Button
                component={NextLink}
                href="/register"
                variant="contained"
                size="large"
                sx={{ borderRadius: '8px', px: 4, py: 1.5 }}
              >
                {t('home.templates.cta')}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 'bold', letterSpacing: 1.2 }}
            >
              {t('home.howItWorks.overline')}
            </Typography>
            <Typography
              component="h2"
              variant="h3"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700, mt: 1 }}
            >
              {t('home.howItWorks.title')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((step: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: 20,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      boxShadow: theme.shadows[4],
                    }}
                  >
                    {index + 1}
                  </Box>
                  <CardContent sx={{ pt: 4, px: 3, pb: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" component="p" color="text.secondary">
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 'bold', letterSpacing: 1.2 }}
            >
              {t('home.testimonials.overline')}
            </Typography>
            <Typography
              component="h2"
              variant="h3"
              color="text.primary"
              gutterBottom
              sx={{ fontWeight: 700, mt: 1 }}
            >
              {t('home.testimonials.title')}
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              {t('home.testimonials.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          sx={{
                            color: i < testimonial.rating ? 'warning.main' : 'action.disabled',
                            fontSize: '1.25rem',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="subtitle1" component="p" sx={{ fontStyle: 'italic', mb: 3 }}>
                      &ldquo;{testimonial.content}&rdquo;
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: `primary.${index % 2 === 0 ? 'main' : 'dark'}`,
                          mr: 2,
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" component="p" sx={{ fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" component="p" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      color: 'white'
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    component="p"
                    sx={{
                      opacity: 0.9
                    }}
                  >
                    {t(`home.stats.${stat.key}`)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Card
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              boxShadow: theme.shadows[10],
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{ color: 'white', fontWeight: 700 }}
              >
                {t('home.cta.title')}
              </Typography>
              <Typography
                variant="subtitle1"
                component="p"
                align="center"
                sx={{ color: 'white', opacity: 0.9, mb: 4 }}
              >
                {t('home.cta.subtitle')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {isAuthenticated ? (
                  <Button
                    component={NextLink}
                    href={user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv'}
                    variant="contained"
                    size="large"
                    sx={{
                      px: 6,
                      py: 1.5,
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      borderRadius: '8px',
                    }}
                  >
                    {t('home.hero.toDashboard')}
                  </Button>
                ) : (
                  <Button
                    component={NextLink}
                    href="/register"
                    variant="contained"
                    size="large"
                    sx={{
                      px: 6,
                      py: 1.5,
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                      borderRadius: '8px',
                    }}
                  >
                    {t('home.cta.button')}
                  </Button>
                )}
              </Box>
            </CardContent>
            
            {/* Background Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                zIndex: 0,
              }}
            >
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10%" cy="20%" r="80" fill="white" />
                <circle cx="90%" cy="60%" r="100" fill="white" />
                <circle cx="50%" cy="90%" r="60" fill="white" />
              </svg>
            </Box>
          </Card>
        </Container>
      </Box>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}; 