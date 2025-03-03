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
  useMediaQuery
} from '@mui/material';
import { 
  Description as DescriptionIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';

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
      title: t('home.feature1.title'),
      description: t('home.feature1.description')
    },
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: t('home.feature2.title'),
      description: t('home.feature2.description')
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: t('home.feature3.title'),
      description: t('home.feature3.description')
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: t('home.feature4.title'),
      description: t('home.feature4.description')
    }
  ];

  const steps = t('home.howItWorks.steps', { returnObjects: true }) as unknown as Array<{ title: string; description: string }>;

  const stats = [
    { key: 'users', value: '10K+' },
    { key: 'companies', value: '500+' },
    { key: 'cvs', value: '50K+' },
    { key: 'hires', value: '5K+' },
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
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 12,
          pb: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                {t('home.hero.title')}
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                {t('home.hero.subtitle')}
              </Typography>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                {t('home.hero.cta')}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/hero-image.png"
                alt="Hero"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            {t('home.features.title')}
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 6 }}
          >
            {t('home.features.subtitle')}
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature) => (
              <Grid item xs={12} md={6} key={feature.title}>
                <Paper
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      transition: 'transform 0.3s ease-in-out',
                    },
                  }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <Box sx={{ 
                      color: 'primary.main',
                      mb: 2,
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      opacity: 0.1
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Paper>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            {t('home.howItWorks.title')}
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {steps.map((step: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: -10,
                      opacity: 0.1,
                      fontSize: '8rem',
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                    }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography variant="h5" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.key}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {t(`home.stats.${stat.key}`)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
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