import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import Layout from '../../components/Layout';
import { Container, Paper, Alert, CircularProgress, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import CreateCVForm from '../../components/cv/CreateCVForm';
import CVFormContent from '../../components/cv/CVFormContent';
import { GetServerSideProps } from 'next';
import subscriptionService from '../../services/subscriptionService';
import Link from 'next/link';

function CreateCV() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { id, step } = router.query;
  const [activeStep, setActiveStep] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  // URL parametrelerini izle ve değiştiğinde state'i güncelle
  useEffect(() => {
    if (router.isReady) {
      // URL'de step parametresi varsa ve geçerli bir sayı ise, activeStep'i güncelle
      if (step && !isNaN(Number(step))) {
        setActiveStep(Number(step));
      }
    }
  }, [router.isReady, step]);

  // Abonelik durumunu kontrol et
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setLoading(true);
        const subscription = await subscriptionService.getCurrentSubscription();
        const isActive = subscription && subscription.status === 'active';
        setHasActiveSubscription(isActive);
        
        // Aktif abonelik yoksa ve doğrudan URL ile erişiliyorsa, pricing sayfasına yönlendir
        if (!isActive && !id) {
          setTimeout(() => {
            router.push('/pricing');
          }, 2000); // 2 saniye beklet, kullanıcı uyarıyı görsün
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setHasActiveSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [router, id]);

  const handleCVCreated = (newCvId: number) => {
    router.push({
      pathname: '/dashboard/create-cv',
      query: { id: newCvId, step: 0 }
    }, undefined, { locale: router.locale });
  };

  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    router.push({
      pathname: '/dashboard/create-cv',
      query: { id, step: newStep }
    }, undefined, { locale: router.locale });
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!hasActiveSubscription && !id) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                component={Link}
                href="/pricing"
              >
                {t('pricing.upgradeNow')}
              </Button>
            }
          >
            {t('pricing.subscribePrompt')}
          </Alert>
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h5" gutterBottom>
              {t('pricing.noSubscription')}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('pricing.subscribePrompt')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              href="/pricing"
              sx={{ mt: 2 }}
            >
              {t('pricing.upgradeNow')}
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!hasActiveSubscription && id && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                component={Link}
                href="/pricing"
              >
                {t('pricing.upgradeNow')}
              </Button>
            }
          >
            {t('cv.editDisabled')}
          </Alert>
        )}
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          {!id ? (
            <CreateCVForm onSuccess={handleCVCreated} />
          ) : (
            <CVFormContent
              activeStep={activeStep}
              cvId={Number(id)}
              onStepChange={handleStepChange}
              isReadOnly={!hasActiveSubscription}
            />
          )}
        </Paper>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'tr', ['common', 'cv'])),
    },
  };
};

export default withAuth(CreateCV);