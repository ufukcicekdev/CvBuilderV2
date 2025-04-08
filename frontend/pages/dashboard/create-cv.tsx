import { useState, useEffect, useCallback } from 'react';
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
import SubscriptionWarningDialog from '../../components/ui/SubscriptionWarningDialog';
import { cvService } from '../../services/cvService';
import axios from 'axios';
import { showToast } from '../../utils/toast';

function CreateCV() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { id, step } = router.query;
  const [activeStep, setActiveStep] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [showTrialWarning, setShowTrialWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [cv, setCV] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

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
  const checkSubscription = useCallback(async () => {
    if (checkingSubscription) return;
    
    try {
      setCheckingSubscription(true);
      const subscription = await subscriptionService.getCurrentSubscription();
      
      // Abonelik durumunu kaydet
      const isActive = subscription && subscription.status === 'active';
      setHasActiveSubscription(isActive);
      
      const status = subscription?.status || '';
      setSubscriptionStatus(status);
      
      const trialDays = subscription?.trial_days_left || 0;
      setTrialDaysLeft(trialDays);
      
      // Deneme kullanıcısı için CV sayısı kontrolü
      if (status === 'trial' && !id) {
        // Kullanıcının mevcut CV sayısını kontrol et
        const response = await cvService.listCVs();
        const existingCVs = response.data;
        
        // Eğer kullanıcının zaten bir CV'si varsa ve yeni bir CV oluşturmaya çalışıyorsa uyarı göster
        if (existingCVs.length >= 1) {
          setWarningMessage(t('subscription.trialLimit'));
          setShowTrialWarning(true);
          router.push('/dashboard'); // Kullanıcıyı dashboard'a yönlendir
          return;
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasActiveSubscription(false);
      setSubscriptionStatus('');
      setTrialDaysLeft(0);
    } finally {
      setCheckingSubscription(false);
    }
  }, [id, t, router, checkingSubscription]);

  // CV'yi yükle
  const loadCV = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await axios.get(`/api/cvs/${id}/`);
      setCV(response.data);
      
      if (response.data.current_step !== undefined) {
        const step = parseInt(response.data.current_step);
        setCurrentStep(step);
      }
    } catch (error) {
      console.error('Error loading CV:', error);
      showToast.error(t('cv.loadError'));
    }
  }, [id, t]);

  // Verileri yükle - sadece bir kez
  useEffect(() => {
    // Eğer veri zaten yüklendiyse işlem yapma
    if (dataLoaded) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        await checkSubscription();
        
        
        
        
        
       
       
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      loadData();
    }
  }, [router.isReady, checkSubscription, loadCV, id, dataLoaded]);

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

  return (
    <Layout>
      <SubscriptionWarningDialog 
        open={showTrialWarning} 
        onClose={() => setShowTrialWarning(false)}
        message={warningMessage}
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!hasActiveSubscription && subscriptionStatus !== 'trial' && (
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
        )}
        
        {subscriptionStatus === 'trial' && (
          <Alert 
            severity={trialDaysLeft > 0 ? "info" : "warning"} 
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
            {trialDaysLeft > 0 
              ? t('subscription.trialActive', { days: trialDaysLeft })
              : t('subscription.trialExpired')
            }
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 3 }}>
            {id ? (
              <CVFormContent
                activeStep={activeStep}
                cvId={Number(id)}
                onStepChange={handleStepChange}
                subscriptionStatus={subscriptionStatus}
                isReadOnly={subscriptionStatus === 'trial' && trialDaysLeft <= 0}
              />
            ) : (
              <CreateCVForm 
                onSuccess={handleCVCreated} 
                subscriptionStatus={subscriptionStatus}
                trialDaysLeft={trialDaysLeft}
              />
            )}
          </Paper>
        )}
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