import { useState, useEffect, useCallback, useRef } from 'react';
import { withAuth } from '../../components/withAuth';
import Layout from '../../components/Layout';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import NextLink from 'next/link';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';
import { showToast } from '../../utils/toast';
import subscriptionService from '../../services/subscriptionService';

// steps array'ini create-cv.tsx ile aynı şekilde tanımlayalım
const steps = ['personalInfo', 'experience', 'education', 'skills', 'languages', 'certificates'];

interface CV {
  id: number;
  title:string;
  personal_info: any;
  status: 'draft' | 'completed';
  current_step: number;
  updated_at: string;
}

function Dashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [canCreateMoreCVs, setCanCreateMoreCVs] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  
  // Sonsuz döngüleri önlemek için ref kullanıyoruz
  const isSubscriptionCheckedRef = useRef(false);

  const fetchCVs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cvAPI.getAll();
      setCvs(response.data as CV[]);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Abonelik durumunu ve CV sayısını kontrol eden fonksiyon
  const checkSubscriptionAndCVCount = useCallback(async () => {
    if (checkingSubscription || isSubscriptionCheckedRef.current) {
      return; // Zaten kontrol ediliyor veya edildi, tekrar çağırmıyoruz
    }
    
    try {
      setCheckingSubscription(true);
      const subscription = await subscriptionService.getCurrentSubscription();
      const isActive = subscription && subscription.status === 'active';
      const isTrial = subscription && subscription.status === 'trial';
      
      // Subscription durumunu kaydet
      setSubscriptionStatus(subscription?.status || '');
      
      // Trial için kalan gün sayısını kaydet
      if (isTrial && subscription.trial_days_left !== undefined) {
        setTrialDaysLeft(subscription.trial_days_left);
      }
      
      // CV oluşturma iznini belirleyelim
      if (isActive) {
        // Premium kullanıcılar sınırsız CV oluşturabilir
        setHasActiveSubscription(true);
        setCanCreateMoreCVs(true);
      } else if (isTrial) {
        // Trial kullanıcıları için CV sayısını kontrol et
        setHasActiveSubscription(true);
        
        // CV sayısını mevcut verilerden kontrol ediyoruz
        const canCreate = cvs.length === 0;
        setCanCreateMoreCVs(canCreate);
        
        console.log('Trial user has', cvs.length, 'CVs, can create more:', canCreate);
      } else {
        // Ücretsiz kullanıcılar CV oluşturamaz
        setHasActiveSubscription(false);
        setCanCreateMoreCVs(false);
      }
      
      // Debug log
      console.log('Subscription status:', 
        isActive ? 'Active' : 
        isTrial ? 'Trial' : 
        'No subscription');
        
      isSubscriptionCheckedRef.current = true;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setHasActiveSubscription(false);
      setCanCreateMoreCVs(false);
    } finally {
      setCheckingSubscription(false);
    }
  }, [cvs.length]);

  // useEffect içindeki sonsuz döngüyü düzeltelim
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        // İlk önce CV'leri yükle
        await fetchCVs();
        
        // Sonra abonelik durumunu kontrol et
        if (isMounted && !isSubscriptionCheckedRef.current) {
          await checkSubscriptionAndCVCount();
        }
      } catch (error) {
        console.error('Error in dashboard initialization:', error);
      }
    };
    
    fetchData();
    
    // Dil değişikliklerini dinle
    const handleLanguageChange = () => {
      if (isMounted) {
        fetchCVs();
      }
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      isMounted = false;
      window.removeEventListener('languageChange', handleLanguageChange);
    };
    
    // checkSubscriptionAndCVCount bu listede olmamalı
  }, [router.locale, fetchCVs]);

  // CV listesi değiştiğinde trial kullanıcıları için kontrol tekrar et
  useEffect(() => {
    if (subscriptionStatus === 'trial') {
      // Deneme süresi bitmişse (0 gün kaldıysa) CV oluşturulamaz
      if (trialDaysLeft <= 0) {
        setCanCreateMoreCVs(false);
      } else {
        // Deneme süresi devam ediyorsa ve henüz CV yoksa oluşturulabilir
        setCanCreateMoreCVs(cvs.length === 0);
      }
    }
  }, [cvs, subscriptionStatus, trialDaysLeft]);

  const handleDeleteClick = (cvId: number) => {
    setSelectedCvId(cvId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCvId) {
      try {
        await cvAPI.delete(selectedCvId);
        showToast.success(t('cv.deleteSuccess'));
        fetchCVs(); // Listeyi yenile
        
        // CV silindikten sonra trial kullanıcısının yeni CV oluşturma izni olabilir
        if (subscriptionStatus === 'trial') {
          setCanCreateMoreCVs(true);
          isSubscriptionCheckedRef.current = false; // Yeniden kontrol için flag'i sıfırla
        }
      } catch (error) {
        console.error('Error deleting CV:', error);
        showToast.error(t('cv.deleteError'));
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleContinueCV = (cv: CV) => {
    // CV'nin kaldığı adıma yönlendir
    router.push(`/dashboard/create-cv?id=${cv.id}&step=${cv.current_step}`);
  };

  const getStepLabel = (currentStep: number) => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return t('cv.steps.completed');
    }
    return t(`cv.steps.${steps[currentStep]}`);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Üst Başlık ve CV Oluştur Butonu */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                {t('nav.dashboard')}
              </Typography>
              {hasActiveSubscription && canCreateMoreCVs ? (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={NextLink}
                  href="/dashboard/create-cv"
                >
                  {t('dashboard.createNew')}
                </Button>
              ) : hasActiveSubscription && subscriptionStatus === 'trial' && !canCreateMoreCVs ? (
                <Tooltip title={t('subscription.trialLimit')}>
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled
                    >
                      {t('dashboard.createNew')}
                    </Button>
                  </span>
                </Tooltip>
              ) : !hasActiveSubscription ? (
                <Tooltip title={t('pricing.subscribePrompt')}>
                  <span>
                    <Button
                      variant="contained" 
                      startIcon={<AddIcon />}
                      disabled
                    >
                      {t('dashboard.createNew')}
                    </Button>
                  </span>
                </Tooltip>
              ) : null}
            </Box>
            
            {!hasActiveSubscription && (
              <Alert 
                severity="warning" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    component={NextLink}
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
                severity="info" 
                sx={{ mb: 3 }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    component={NextLink}
                    href="/pricing"
                  >
                    {t('pricing.upgradeNow')}
                  </Button>
                }
              >
                {canCreateMoreCVs 
                  ? t('subscription.trialActive', { days: trialDaysLeft })
                  : t('subscription.trialLimitWithDays', { days: trialDaysLeft })}
              </Alert>
            )}
          </Grid>

          {/* CVs List */}
          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : cvs.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  {t('cv.noCVs')}
                </Typography>
                {hasActiveSubscription && (subscriptionStatus !== 'trial' || canCreateMoreCVs) ? (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={NextLink}
                    href="/dashboard/create-cv"
                    sx={{ mt: 2 }}
                  >
                    {t('cv.createFirst')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    component={NextLink}
                    href="/pricing"
                    sx={{ mt: 2 }}
                  >
                    {t('pricing.upgradeNow')}
                  </Button>
                )}
              </Paper>
            </Grid>
          ) : (
            cvs.map((cv) => (
              <Grid item xs={12} md={6} key={cv.id}>
                <Paper sx={{ p: 3, position: 'relative' }}>
                  <IconButton
                    onClick={() => handleDeleteClick(cv.id)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {cv?.title || t('cv.untitled')}
                    </Typography>
                    <Chip
                      label={cv.status === 'draft' ? t('cv.draft') : t('cv.completed')}
                      color={cv.status === 'draft' ? 'warning' : 'success'}
                    />
                  </Box>

                  <Typography color="textSecondary" gutterBottom>
                    {t('cv.lastUpdated')}: {new Date(cv.updated_at).toLocaleDateString()}
                  </Typography>

                  <Typography color="textSecondary" gutterBottom>
                    {t('cv.currentStep')}: {getStepLabel(cv.current_step)}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleContinueCV(cv)}
                    sx={{ mt: 2 }}
                  >
                    {cv.status === 'draft' ? t('cv.continue') : t('cv.edit')}
                  </Button>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>

        {/* Silme Onay Dialog'u */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('cv.deleteConfirmTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('cv.deleteConfirmMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default withAuth(Dashboard); 