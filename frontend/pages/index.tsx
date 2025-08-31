
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Avatar
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
import { motion, useInView } from 'framer-motion';

// Add proper declaration for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params: any) => void;
  }
}

// Animated Hero SVG
const HeroSvg = () => {
  const svgVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CV Builder Illustration"
      role="img"
      variants={svgVariants}
      initial="hidden"
      animate="visible"
    >
      <title>CV Builder Illustration</title>
      <desc>An illustration showing a CV document with various sections</desc>
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.9" />
        </linearGradient>
        <clipPath id="screenMask">
          <rect x="110" y="70" width="580" height="380" rx="20" />
        </clipPath>
      </defs>

      <motion.circle cx="650" cy="120" r="80" fill="url(#gradient1)" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.1, scale: 1, transition: { duration: 1 } }} />
      <motion.circle cx="150" cy="500" r="100" fill="url(#gradient1)" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.1, scale: 1, transition: { duration: 1, delay: 0.2 } }} />

      <motion.g variants={itemVariants}>
        <rect x="110" y="70" width="580" height="380" rx="20" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
      </motion.g>

      <g clipPath="url(#screenMask)">
        <motion.g variants={itemVariants}>
          <rect x="110" y="70" width="580" height="80" fill="#F9FAFB" />
          <circle cx="170" cy="110" r="30" fill="#4F46E5" />
          <rect x="220" y="95" width="200" height="12" rx="6" fill="#111827" />
          <rect x="220" y="115" width="150" height="10" rx="5" fill="#6B7280" />
        </motion.g>

        <motion.g variants={itemVariants}>
          <rect x="130" y="170" width="200" height="15" rx="7" fill="#4F46E5" />
          <rect x="130" y="195" width="540" height="10" rx="5" fill="#E5E7EB" />
          <rect x="130" y="215" width="540" height="10" rx="5" fill="#E5E7EB" />
        </motion.g>

        <motion.g variants={itemVariants}>
          <rect x="130" y="270" width="200" height="15" rx="7" fill="#4F46E5" />
          <rect x="130" y="295" width="540" height="10" rx="5" fill="#E5E7EB" />
          <rect x="130" y="315" width="540" height="10" rx="5" fill="#E5E7EB" />
        </motion.g>
        
        <motion.g variants={itemVariants}>
          <rect x="130" y="370" width="200" height="15" rx="7" fill="#4F46E5" />
          <rect x="130" y="395" width="540" height="10" rx="5" fill="#E5E7EB" />
        </motion.g>
      </g>
    </motion.svg>
  );
};

// Animated Template SVG for preview
const TemplateSvg = () => (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CV Template Example"
      role="img"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <title>CV Template Example</title>
      <desc>A simplified illustration of a CV template design</desc>
      <rect width="400" height="300" fill="#F9FAFB" rx="8" />
      <motion.circle cx="70" cy="70" r="50" fill="#4F46E5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} />
      <motion.rect x="140" y="30" width="240" height="20" rx="4" fill="#111827" initial={{ width: 0 }} animate={{ width: 240 }} transition={{ delay: 0.4, duration: 0.5 }} />
      <motion.rect x="140" y="60" width="180" height="15" rx="4" fill="#6B7280" initial={{ width: 0 }} animate={{ width: 180 }} transition={{ delay: 0.6, duration: 0.5 }} />
      <motion.rect x="140" y="85" width="220" height="15" rx="4" fill="#6B7280" initial={{ width: 0 }} animate={{ width: 220 }} transition={{ delay: 0.8, duration: 0.5 }} />
      <rect x="20" y="140" width="360" height="1" fill="#E5E7EB" />
      <motion.rect x="20" y="160" width="150" height="15" rx="4" fill="#4F46E5" initial={{ width: 0 }} animate={{ width: 150 }} transition={{ delay: 1, duration: 0.5 }} />
      <motion.rect x="20" y="185" width="360" height="10" rx="4" fill="#E5E7EB" initial={{ width: 0 }} animate={{ width: 360 }} transition={{ delay: 1.2, duration: 0.5 }} />
      <motion.rect x="20" y="205" width="360" height="10" rx="4" fill="#E5E7EB" initial={{ width: 0 }} animate={{ width: 360 }} transition={{ delay: 1.3, duration: 0.5 }} />
      <motion.rect x="20" y="225" width="180" height="10" rx="4" fill="#E5E7EB" initial={{ width: 0 }} animate={{ width: 180 }} transition={{ delay: 1.4, duration: 0.5 }} />
    </motion.svg>
);

// Section wrapper for animations
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
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

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const heroItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut" as any,
      },
    },
  };

  const lightGradient1 = 'linear-gradient(170deg, #e9eaff 0%, #f5f7ff 100%)';
  const lightGradient2 = 'linear-gradient(170deg, #f8f9ff 0%, #f1f3ff 100%)';
  const darkGradient1 = `linear-gradient(170deg, ${theme.palette.background.default} 0%, #1a1d24 100%)`;
  const darkGradient2 = `linear-gradient(170deg, #1a1d24 0%, #121418 100%)`;

  return (
    <Layout>
      <SEO 
        title={t('home.seo.title')}
        description={t('home.seo.description')}
        canonicalUrl="https://cvbuilder.dev"
      />
      
      {/* Hero Section */}
      <Box 
        component="section" 
        aria-labelledby="hero-heading"
        sx={{
          position: 'relative',
          background: theme.palette.mode === 'dark' ? darkGradient1 : lightGradient1,
          pt: { xs: 6, sm: 10 },
          pb: { xs: 10, sm: 16 },
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div variants={heroVariants} initial="hidden" animate="visible">
                <motion.div variants={heroItemVariants}>
                  <Typography
                    id="hero-heading"
                    component="h1"
                    variant="h2"
                    color="text.primary"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.2,
                      fontSize: { xs: '2.8rem', md: '3.8rem' },
                    }}
                  >
                    {t('home.hero.title')}
                  </Typography>
                </motion.div>
                <motion.div variants={heroItemVariants}>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 4, maxWidth: '90%' }}
                  >
                    {t('home.hero.subtitle')}
                  </Typography>
                </motion.div>

                <motion.div variants={heroItemVariants}>
                  <Box 
                    sx={{ 
                      mb: 4, 
                      p: 2.5, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      color: 'white',
                      boxShadow: '0 10px 20px -5px rgba(102, 126, 234, 0.5)',
                      textAlign: 'center'
                    }}
                    role="complementary"
                    aria-label={t('subscription.freeTrialText')}
                  >
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                      {t('subscription.freeTrialText')}
                    </Typography>
                    <Typography variant="subtitle1" component="p" sx={{ mt: 1, opacity: 0.9 }}>
                      {t('subscription.freeTrialDescription')}
                    </Typography>
                  </Box>
                </motion.div>

                <motion.div variants={heroItemVariants}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {isAuthenticated ? (
                      <Button
                        component={NextLink}
                        href={user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv'}
                        variant="contained"
                        size="large"
                        sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 'bold' }}
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
                          sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 'bold' }}
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
                          sx={{ px: 4, py: 1.5, borderRadius: '12px', fontWeight: 'bold' }}
                          aria-label={t('auth.dontHaveAccount')}
                        >
                          {t('auth.dontHaveAccount')}
                        </Button>
                      </>
                    )}
                  </Box>
                </motion.div>
                <motion.div variants={heroItemVariants}>
                  <Box component="ul" sx={{ mt: 4, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[t('home.hero.feature1'), t('home.hero.feature2'), t('home.hero.feature3')].map((feature, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body1" component="span" color="text.secondary">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <HeroSvg />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" aria-labelledby="features-heading" sx={{ py: 12, background: theme.palette.mode === 'dark' ? darkGradient2 : lightGradient2 }}>
        <Container maxWidth="lg">
          <AnimatedSection>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1.5 }}>
                {t('home.features.overline')}
              </Typography>
              <Typography id="features-heading" component="h2" variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 700, mt: 1 }}>
                {t('home.features.title')}
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                {t('home.features.subtitle')}
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <AnimatedSection delay={index * 0.1}>
                  <motion.div whileHover={{ y: -10, transition: { duration: 0.3 } }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', boxShadow: theme.shadows[2], overflow: 'hidden', background: theme.palette.background.paper }}>
                      <CardContent sx={{ flexGrow: 1, p: 4 }}>
                        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.main', mb: 2.5 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" component="p" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Templates Preview Section */}
      <Box sx={{ py: 12, background: theme.palette.mode === 'dark' ? darkGradient1 : lightGradient1 }}>
        <Container maxWidth="lg">
          <AnimatedSection>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1.5 }}>
                {t('home.templates.overline')}
              </Typography>
              <Typography component="h2" variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 700, mt: 1 }}>
                {t('home.templates.title')}
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                {t('home.templates.subtitle')}
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={5} justifyContent="center">
            {[1, 2, 3].map((template, index) => (
              <Grid item xs={12} sm={6} md={4} key={template}>
                <AnimatedSection delay={index * 0.1}>
                  <motion.div whileHover={{ scale: 1.05, boxShadow: theme.shadows[12], transition: { duration: 0.3 } }} style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: theme.shadows[4] }}>
                    <TemplateSvg />
                  </motion.div>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>

          <AnimatedSection>
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Button
                component={NextLink}
                href={isAuthenticated ? (user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv') : "/register"}
                variant="contained"
                size="large"
                sx={{ borderRadius: '12px', px: 5, py: 1.5, fontWeight: 'bold' }}
              >
                {isAuthenticated ? t('home.hero.toDashboard') : t('home.templates.cta')}
              </Button>
            </Box>
          </AnimatedSection>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 12, background: theme.palette.mode === 'dark' ? darkGradient2 : lightGradient2 }}>
        <Container maxWidth="lg">
          <AnimatedSection>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1.5 }}>
                {t('home.howItWorks.overline')}
              </Typography>
              <Typography component="h2" variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 700, mt: 1 }}>
                {t('home.howItWorks.title')}
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={4}>
            {steps.map((step: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <AnimatedSection delay={index * 0.1}>
                  <motion.div whileHover={{ y: -10, transition: { duration: 0.3 } }} style={{ height: '100%' }}>
                    <Card sx={{ height: '100%', position: 'relative', borderRadius: '20px', overflow: 'visible', boxShadow: theme.shadows[2], background: theme.palette.background.paper }}>
                      <Box sx={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: theme.shadows[6] }}>
                        {index + 1}
                      </Box>
                      <CardContent sx={{ pt: 5, px: 3, pb: 3, textAlign: 'center' }}>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body1" component="p" color="text.secondary">
                          {step.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 12, background: theme.palette.mode === 'dark' ? darkGradient1 : lightGradient1 }}>
        <Container maxWidth="lg">
          <AnimatedSection>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', letterSpacing: 1.5 }}>
                {t('home.testimonials.overline')}
              </Typography>
              <Typography component="h2" variant="h3" color="text.primary" gutterBottom sx={{ fontWeight: 700, mt: 1 }}>
                {t('home.testimonials.title')}
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                {t('home.testimonials.subtitle')}
              </Typography>
            </Box>
          </AnimatedSection>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedSection delay={index * 0.1}>
                  <motion.div whileHover={{ y: -10, transition: { duration: 0.3 } }} style={{ height: '100%' }}>
                    <Card sx={{ height: '100%', borderRadius: '20px', boxShadow: theme.shadows[2], background: theme.palette.background.paper }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} sx={{ color: i < testimonial.rating ? 'warning.main' : 'action.disabled' }} />
                          ))}
                        </Box>
                        <Typography variant="body1" component="p" sx={{ fontStyle: 'italic', mb: 3 }}>
                          &ldquo;{testimonial.content}&rdquo;
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            {testimonial.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold' }}>
                              {testimonial.name}
                            </Typography>
                            <Typography variant="body2" component="p" color="text.secondary">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 10, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <AnimatedSection delay={index * 0.1}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ opacity: 0.9 }}>
                      {t(`home.stats.${stat.key}`)}
                    </Typography>
                  </Box>
                </AnimatedSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 12, background: theme.palette.mode === 'dark' ? darkGradient2 : lightGradient2 }}>
        <Container maxWidth="md">
          <AnimatedSection>
            <motion.div whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}>
              <Card sx={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: theme.shadows[10] }}>
                <CardContent sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Typography variant="h3" component="h2" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
                    {t('home.cta.title')}
                  </Typography>
                  <Typography variant="h6" component="p" sx={{ color: 'white', opacity: 0.9, mb: 4 }}>
                    {t('home.cta.subtitle')}
                  </Typography>
                  <Button
                    component={NextLink}
                    href={isAuthenticated ? (user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard/create-cv') : "/register"}
                    variant="contained"
                    size="large"
                    sx={{ px: 6, py: 1.5, bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', '&:hover': { bgcolor: 'grey.100' }, borderRadius: '12px' }}
                  >
                    {isAuthenticated ? t('home.hero.toDashboard') : t('home.cta.button')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
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
