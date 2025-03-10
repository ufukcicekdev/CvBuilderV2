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
import Link from 'next/link';
import SEO from '../components/SEO';

// Hero SVG
const HeroSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
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
    
    {/* Animated Elements */}
    <circle cx="750" cy="200" r="15" fill="#4F46E5" opacity="0.7">
      <animate attributeName="cy" values="200;180;200" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="350" r="10" fill="#7C3AED" opacity="0.7">
      <animate attributeName="cy" values="350;370;350" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="400" cy="500" r="12" fill="#4F46E5" opacity="0.7">
      <animate attributeName="cy" values="500;520;500" dur="4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// Template SVG
const TemplateSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
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
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token');

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

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
        title={t('home.seo.title', 'CV Builder - Create Professional Resumes Online')}
        description={t('home.seo.description', 'Create professional CVs and resumes with our easy-to-use online CV builder. Choose from multiple templates and customize your resume in minutes.')}
        keywords={t('home.seo.keywords', 'cv builder, resume builder, professional cv, job application, career, resume templates')}
        ogImage="/images/og-image.svg"
      />
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Chip 
                  label={t('home.hero.badge')} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2, fontWeight: 'bold' }} 
                />
                <Typography
                  component="h1"
                  variant="h2"
                  color="text.primary"
                  gutterBottom
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  {t('home.hero.title')}
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' } }}
                >
                  {t('home.hero.subtitle')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    component={Link}
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
                  >
                    {t('home.hero.cta')}
                  </Button>
                  <Button
                    component={Link}
                    href="/login"
                    variant="outlined"
                    size="large"
                    sx={{ 
                      px: 4, 
                      py: 1.5, 
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    {t('nav.login')}
                  </Button>
                </Box>
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {t('home.hero.feature1')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {t('home.hero.feature2')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {t('home.hero.feature3')}
                  </Typography>
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
              >
                <HeroSvg />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* Features Section */}
      <Box sx={{ py: 8 }}>
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
              color="text.secondary"
              sx={{ maxWidth: '800px', mx: 'auto' }}
            >
              {t('home.features.subtitle')}
            </Typography>
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
                    <Typography variant="body2" color="text.secondary">
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
              variant="h6"
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
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="large"
              sx={{ borderRadius: '8px', px: 4, py: 1.5 }}
            >
              {t('home.templates.cta')}
            </Button>
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
                    <Typography color="text.secondary">
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
                    <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.key}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    gutterBottom
                    sx={{ fontWeight: 800, color: 'white' }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
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
                variant="h6"
                align="center"
                sx={{ color: 'white', opacity: 0.9, mb: 4 }}
              >
                {t('home.cta.subtitle')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  component={Link}
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