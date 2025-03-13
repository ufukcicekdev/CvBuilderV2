import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  useTheme,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import subscriptionService, { 
  SubscriptionPlan, 
  UserSubscription, 
  DEFAULT_SUBSCRIPTION_PLAN 
} from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

export default function Pricing() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>(DEFAULT_SUBSCRIPTION_PLAN);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const plansData = await subscriptionService.getPlans();
        if (plansData && plansData.length > 0) {
          setPlan(plansData[0]); // Just take the first plan
        }
        
        if (isAuthenticated) {
          const subscription = await subscriptionService.getCurrentSubscription();
          setCurrentSubscription(subscription);
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        toast.error(t('pricing.errorFetchingPlans'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, t]);

  const handlePlanSelect = () => {
    if (!isAuthenticated) {
      // Redirect to login page with redirect back to pricing
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }

    // Open the checkout dialog instead of directly creating a subscription
    setCheckoutDialogOpen(true);
  };

  const handleCheckoutSubmit = async () => {
    try {
      // Show payment processing toast
      toast.loading(t('pricing.paymentProcessing'), { id: 'payment-toast' });
      
      // Process payment with Iyzico (simulated)
      const paymentResult = await subscriptionService.processPayment(plan.plan_id, isYearly);
      
      if (paymentResult.success && paymentResult.cardToken) {
        // Update toast to success
        toast.success(t('pricing.paymentSuccess'), { id: 'payment-toast' });
        
        // Then create the subscription with the card token
        await subscriptionService.createSubscription(plan.plan_id, isYearly, paymentResult.cardToken);
        toast.success(t('pricing.subscriptionSuccess'));
        
        // Refresh the current subscription
        const subscription = await subscriptionService.getCurrentSubscription();
        setCurrentSubscription(subscription);
        
        // Close the dialog
        setCheckoutDialogOpen(false);
      } else {
        // Payment failed
        toast.error(t('pricing.paymentError'), { id: 'payment-toast' });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error(t('pricing.subscriptionError'), { id: 'payment-toast' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  // Order features in the same order as in the screenshot
  const orderedFeatureKeys = [
    'feature.videoCV',
    'feature.aiAssistant',
    'feature.unlimitedCvs',
    'feature.basicCvTemplates'
  ];

  const price = isYearly ? plan.price_yearly : plan.price_monthly;
  const isCurrentPlan = currentSubscription && 
    currentSubscription.plan.plan_id === plan.plan_id && 
    currentSubscription.status === 'active';
  const isPeriodMatch = currentSubscription && 
    ((isYearly && currentSubscription.period === 'yearly') || 
      (!isYearly && currentSubscription.period === 'monthly'));

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          {t('pricing.title')}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          {t('pricing.description')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{t('pricing.monthly')}</Typography>
                <Typography
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {t('pricing.saveYearly')}
                </Typography>
                <Typography>{t('pricing.yearly')}</Typography>
              </Box>
            }
            labelPlacement="end"
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card 
            elevation={3}
            sx={{
              width: { xs: '100%', md: 350 },
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
              },
              border: isCurrentPlan ? `2px solid ${theme.palette.primary.main}` : 'none',
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: 4 }}>
              <Typography variant="h5" component="h3" gutterBottom align="center">
                {t(plan.name)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                {t(plan.description || '')}
              </Typography>
              
              <Box sx={{ my: 3, textAlign: 'center' }}>
                <Typography variant="h3" component="div" color="primary">
                  ${price}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {isYearly ? t('pricing.perYear') : t('pricing.perMonth')}
                </Typography>
              </Box>

              <List>
                {orderedFeatureKeys.map((key) => {
                  const included = plan.features[key] || false;
                  return (
                    <ListItem key={key} sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {included ? (
                          <CheckIcon color="primary" />
                        ) : (
                          <CloseIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={t(`pricing.features.${key}`)} 
                        primaryTypographyProps={{
                          color: included ? 'textPrimary' : 'textSecondary',
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                {isCurrentPlan && isPeriodMatch ? (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled
                  >
                    {t('pricing.currentPlan')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="primary"
                    onClick={handlePlanSelect}
                  >
                    {isCurrentPlan ? t('pricing.changePlan') : t('pricing.selectPlan')}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Checkout Dialog */}
        <Dialog 
          open={checkoutDialogOpen} 
          onClose={() => setCheckoutDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('pricing.checkout')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('pricing.checkoutDescription')}
            </DialogContentText>
            
            <Box sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('pricing.orderSummary')}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{t(plan.name)}</Typography>
                <Typography variant="body2">${price}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">{isYearly ? t('pricing.yearly') : t('pricing.monthly')}</Typography>
                <Typography variant="body2">{isYearly ? t('pricing.perYear') : t('pricing.perMonth')}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2">{t('pricing.total')}</Typography>
                <Typography variant="subtitle2" color="primary">${price}</Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              {t('pricing.paymentDetails')}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('pricing.demoNotice')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCheckoutDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleCheckoutSubmit} 
              variant="contained" 
              color="primary"
            >
              {t('pricing.completePayment')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'tr', ['common'])),
    },
  };
}; 