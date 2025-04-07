import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import subscriptionService, { UserSubscription } from '../services/subscriptionService';
import { toast } from 'react-hot-toast';

interface SubscriptionInfoProps {
  onSubscriptionChange?: () => void;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ onSubscriptionChange }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null | any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [showPortalError, setShowPortalError] = useState(false);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const data = await subscriptionService.getCurrentSubscription();
        setSubscription(data);
        
        // If user has an active subscription, fetch the customer portal URL
        if (data && data.status === 'active') {
          await fetchCustomerPortalUrl();
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const fetchCustomerPortalUrl = async () => {
    try {
      setPortalLoading(true);
      setPortalError(null);
      
      const response = await subscriptionService.getCustomerPortalUrl();
      
      // Detaylı konsol günlüğü ekleyin
      // console.log('Portal URL response:', response);
      
      // Check if response contains sandbox_mode flag
      if (response && typeof response === 'object' && 'sandbox_mode' in response) {
        // console.log('Sandbox mode detected in response');
        setIsSandboxMode(true);
        setCustomerPortalUrl(response.portal_url);
        
        if ('error' in response) {
          setPortalError(`Sandbox mode: ${response.error}`);
        }
        
        // Sandbox modunda bir mesaj göster
        if ('message' in response) {
          toast(response.message as string);
        }
      } else if (response) {
        // String response for production mode
        // console.log('Production mode portal URL received');
        setCustomerPortalUrl(typeof response === 'string' ? response : response.portal_url);
        setIsSandboxMode(false);
      } else {
        // console.log('No portal URL received');
        setPortalError(t('subscription.portalError', 'Could not retrieve customer portal URL'));
      }
    } catch (error: any) {
      console.error('Error fetching customer portal URL:', error);
      
      // Hata yanıtını kontrol et
      const errorResponse = error.response?.data;
      if (errorResponse?.sandbox_mode && errorResponse?.portal_url) {
        // console.log('Sandbox mode error with portal URL');
        setIsSandboxMode(true);
        setCustomerPortalUrl(errorResponse.portal_url);
        setPortalError(errorResponse.error || t('subscription.portalError'));
      } else {
        setPortalError(
          error.response?.data?.detail || 
          t('subscription.portalError', 'Could not retrieve customer portal URL')
        );
      }
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleOpenCustomerPortal = () => {
    if (!customerPortalUrl) {
      toast.error(t('subscription.noPortalUrl', 'Customer portal URL not available'));
      return;
    }

    if (isSandboxMode) {
      // console.log('Opening portal URL in sandbox mode:', customerPortalUrl);
      
      // Sondbox URL'si Paddle domain'i ile başlıyorsa
      if (customerPortalUrl.includes('sandbox-customer-portal.paddle.com')) {
        // Paddle sandbox portalını yeni sekmede aç
        toast.success(t('subscription.sandboxPortal', 'Opening Paddle sandbox customer portal'));
        window.open(customerPortalUrl, '_blank');
      } else {
        // Account sayfasına yönlendiriyoruz (eski sandbox modunda)
        toast.success(t('subscription.sandboxPortal', 'Opening account page in sandbox mode'));
        if (customerPortalUrl.includes('/account')) {
          // Aynı sekmede aç çünkü kendi uygulamamızın bir sayfası
          router.push(customerPortalUrl);
        } else {
          // Yine de yeni sekmede aç (farklı bir URL ise)
          window.open(customerPortalUrl, '_blank');
        }
      }
    } else {
      // Production modunda normal olarak aç
      // console.log('Opening portal URL in production mode:', customerPortalUrl);
      window.open(customerPortalUrl, '_blank');
    }
  };

  const handleRetryPortal = async () => {
    setShowPortalError(false);
    await fetchCustomerPortalUrl();
    if (customerPortalUrl) {
      handleOpenCustomerPortal();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if no subscription or if subscription has status "no_subscription"
  if (!subscription || subscription.status === 'no_subscription') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('pricing.noSubscription')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('pricing.subscribePrompt')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpgrade}
          >
            {t('pricing.subscribe')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if the plan exists before accessing its properties
  if (!subscription.plan) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('pricing.subscriptionError')}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t('pricing.subscriptionDataError', 'There was an error loading your subscription details.')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpgrade}
          >
            {t('pricing.viewPlans')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription.status === 'active';
  const endDate = new Date(subscription.end_date);
  const formattedEndDate = endDate.toLocaleDateString();

  // Trial durumunu gösterelim
  if (subscription && subscription.status === 'trial') {
    const trialDaysLeft = subscription.trial_days_left || 0;
    
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('subscription.trialActive', { days: trialDaysLeft })}
            </Typography>
            <Chip 
              label={t('subscription.trial')}
              color="info" 
              size="small"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" paragraph>
            {t('subscription.freeTrialDescription')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • {t('subscription.trialLimit')}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpgrade}
            fullWidth
          >
            {t('subscription.upgrade')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {t('pricing.currentSubscription')}
            </Typography>
            <Chip 
              label={t(`subscription.${subscription.status}`)} 
              color={isActive ? 'success' : 'default'} 
              size="small" 
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {subscription.plan && t(subscription.plan.name)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('pricing.period')}: {t(`pricing.${subscription.period}`)}
          </Typography>
          
          {isActive && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('pricing.validUntil')}: {formattedEndDate}
            </Typography>
          )}
          
          {isSandboxMode && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              {t('subscription.sandboxMode', 'Running in sandbox mode. Some features may be simulated.')}
            </Alert>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {isActive && subscription?.payment_provider === 'paddle' && (
              <Button
                variant="contained"
                color="info"
                onClick={handleOpenCustomerPortal}
                disabled={portalLoading}
                startIcon={portalLoading ? <CircularProgress size={20} /> : undefined}
              >
                {t('subscription.customerPortal', 'Yönetim Paneli')}
              </Button>
            )}

            {!isActive && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUpgrade}
              >
                {t('pricing.resubscribe', 'Resubscribe')}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Portal Error Dialog */}
      <Snackbar
        open={showPortalError}
        autoHideDuration={6000}
        onClose={() => setShowPortalError(false)}
      >
        <Alert 
          onClose={() => setShowPortalError(false)} 
          severity="error" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleRetryPortal}>
              {t('common.retry')}
            </Button>
          }
        >
          {portalError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SubscriptionInfo; 