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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const data = await subscriptionService.getCurrentSubscription();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = async () => {
    try {
      if (!subscription) return;
      
      await subscriptionService.cancelSubscription();
      toast.success(t('pricing.cancelSuccess'));
      setCancelDialogOpen(false);
      
      // Refresh subscription data
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(t('pricing.cancelError'));
    }
  };

  // Function to switch between monthly and yearly billing
  const handleSwitchBillingPeriod = async () => {
    if (!subscription) return;
    
    const newPeriod = subscription.period === 'yearly' ? 'monthly' : 'yearly';
    
    try {
      await subscriptionService.createSubscription(
        subscription.plan.plan_id,
        newPeriod === 'yearly'
      );
      
      toast.success(t('pricing.periodUpdateSuccess', 'Billing period updated successfully'));
      
      // Refresh subscription data
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
      
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error('Error switching billing period:', error);
      toast.error(t('pricing.periodUpdateError', 'Failed to update billing period'));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!subscription) {
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

  const isActive = subscription.status === 'active';
  const endDate = new Date(subscription.end_date);
  const formattedEndDate = endDate.toLocaleDateString();

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {t('pricing.currentSubscription')}
            </Typography>
            <Chip 
              label={t(`subscription.status.${subscription.status}`)} 
              color={isActive ? 'success' : 'default'} 
              size="small" 
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            {t(subscription.plan.name)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('pricing.period')}: {t(`pricing.${subscription.period}`)}
          </Typography>
          
          {isActive && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('pricing.validUntil')}: {formattedEndDate}
            </Typography>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {isActive && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleSwitchBillingPeriod}
              >
                {subscription.period === 'yearly' 
                  ? t('pricing.switchToMonthly', 'Switch to Monthly Billing')
                  : t('pricing.switchToYearly', 'Switch to Yearly Billing')}
              </Button>
            )}
            
            {isActive && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setCancelDialogOpen(true)}
              >
                {t('pricing.cancelSubscription')}
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
      
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>{t('pricing.confirmCancellation')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('pricing.confirmCancel')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCancelSubscription} color="error" autoFocus>
            {t('pricing.cancelSubscription')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubscriptionInfo; 