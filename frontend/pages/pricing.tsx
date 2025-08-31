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
  useTheme,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  Paper
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import Head from 'next/head';
import subscriptionService, {
  SubscriptionPlan,
  UserSubscription,
  DEFAULT_SUBSCRIPTION_PLAN,
  PaymentGateway
} from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import axiosInstance from '../services/axios';
import { motion } from 'framer-motion';

export default function Pricing() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const isYearly = false; // Assuming monthly for now, can be toggled later
  const [plan, setPlan] = useState<SubscriptionPlan>(DEFAULT_SUBSCRIPTION_PLAN);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [showGatewayDialog, setShowGatewayDialog] = useState(false);
  const [showPaytrModal, setShowPaytrModal] = useState(false);
  const [paytrIframeUrl, setPaytrIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansData, subscriptionData, gatewaysData] = await Promise.all([
          subscriptionService.getPlans(),
          isAuthenticated ? subscriptionService.getCurrentSubscription() : null,
          subscriptionService.getPaymentGateways()
        ]);

        if (plansData && plansData.length > 0) {
          setPlan(plansData[0]);
        }

        if (gatewaysData && gatewaysData.length > 0) {
          setPaymentGateways(gatewaysData);
          const defaultGateway = gatewaysData.find(g => g.is_default);
          if (defaultGateway) {
            setSelectedGateway(defaultGateway.gateway_type);
          } else {
            setSelectedGateway(gatewaysData[0].gateway_type);
          }
        }

        if (isAuthenticated) {
          if (subscriptionData && subscriptionData.status !== 'no_subscription') {
            setCurrentSubscription(subscriptionData);
          } else {
            setCurrentSubscription(null);
          }
        }
      } catch (error) {
        toast.error(t('pricing.errorFetchingData') || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, t]);

  useEffect(() => {
    const hasConsent = typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true';

    if (!hasConsent) {
      return;
    }

    if (typeof window !== 'undefined' && !(window as any).Paddle) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;

      script.onload = () => {
        if ((window as any).Paddle && (window as any).Paddle.Environment) {
          const isSandbox = process.env.NEXT_PUBLIC_PADDLE_SANDBOX === 'true';
          if (isSandbox) {
            (window as any).Paddle.Environment.set("sandbox");
          }

          (window as any).Paddle.Initialize({
            token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
            checkout: {
              settings: {
                locale: localStorage.getItem('selectedLanguage')
              }
            },
            eventCallback: function(eventData: any) {
              if (eventData.name === 'checkout.completed') {
                toast.success(t('pricing.subscriptionSuccess') || 'Aboneliğiniz başarıyla oluşturuldu!', { id: 'paddle-success-toast' });
                window.location.href = '/dashboard';
              } else if (eventData.name === 'checkout.closed') {
                toast.dismiss('paddle-toast');
              } else if (eventData.name === 'checkout.loaded') {
                toast.dismiss('paddle-toast');
              }
            }
          });
        }
      };

      document.head.appendChild(script);
    }
  }, [t]);

  const handlePlanSelect = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }
    setShowGatewayDialog(true);
  };

  const handleGatewaySelect = async () => {
    if (!selectedGateway) {
      toast.error(t('pricing.selectPaymentProvider'));
      return;
    }

    try {
      if (selectedGateway === 'paytr') {
        const userProfileResponse = await axiosInstance.get('/api/users/me/');
        const userProfile = userProfileResponse.data;
        if (!userProfile.address || !userProfile.phone) {
          toast.error(t('pricing.missingUserInfo', 'PayTR ödemesi için adres ve telefon bilgileriniz gereklidir. Lütfen profil sayfanızdan bu bilgileri doldurun.'));
          router.push('/profile');
          return;
        }
      }

      toast.loading(t('pricing.processingCheckout'), { id: 'payment-toast' });

      const response = await subscriptionService.createSubscription({
        plan_id: plan.plan_id,
        period: isYearly ? 'yearly' : 'monthly',
        payment_provider: selectedGateway,
      });

      setShowGatewayDialog(false);

      if (selectedGateway === 'paddle') {
        const priceId = response.data?.price_id;
        const userLocale = localStorage.getItem('selectedLanguage') || 'tr';

        if (typeof window !== 'undefined' &&
            (window as any).Paddle &&
            (window as any).Paddle.Checkout) {
          try {
            (window as any).Paddle.Checkout.open({
              items: [{
                priceId: priceId,
                quantity: 1
              }],
              displayMode: "overlay",
              theme: "light",
              locale: userLocale,
              allowQuantity: false,
              customer: user?.paddle_customer_id ? {
                id: user.paddle_customer_id
              } : undefined
            });
            toast.dismiss('payment-toast');
          } catch (checkoutError) {
            toast.error(t('pricing.checkoutError'), { id: 'payment-toast' });
          }
        } else {
          toast.error(t('pricing.paddleNotLoaded'), { id: 'payment-toast' });
        }
      } else if (selectedGateway === 'paytr') {
        if (response.data?.iframe_url) {
          setShowGatewayDialog(false);
          setPaytrIframeUrl(response.data.iframe_url);
          setShowPaytrModal(true);
          toast.dismiss('payment-toast');
        } else {
          toast.error(t('pricing.paytrError') || 'Error with PayTR payment.', { id: 'payment-toast' });
        }
      }
    } catch (error) {
      toast.error(t('pricing.checkoutError'), { id: 'payment-toast' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(170deg, ${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100]} 0%, ${theme.palette.mode === 'dark' ? '#1a1d24' : theme.palette.grey[200]} 100%)`,
            py: 5,
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const orderedFeatureKeys = [
    'feature.videoCV',
    'feature.aiAssistant',
    'feature.unlimitedCvs',
    'feature.basicCvTemplates'
  ];

  const price = plan.price_monthly;
  const currency = plan.currency;
  const isCurrentPlan = currentSubscription &&
    currentSubscription?.plan?.plan_id === plan.plan_id &&
    currentSubscription.status === 'active';
  const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active';

  return (
    <Layout>
      <Head>
        <title>{t('pricing.pageTitle')}</title>
        <meta name="description" content={t('pricing.pageDescription')} />
      </Head>
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(170deg, ${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100]} 0%, ${theme.palette.mode === 'dark' ? '#1a1d24' : theme.palette.grey[200]} 100%)`,
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('pricing.title')}
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 4 }}>
              {t('pricing.description')}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  elevation={8}
                  sx={{
                    width: { xs: '100%', sm: 380 },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                    border: isCurrentPlan ? `3px solid ${theme.palette.primary.main}` : 'none',
                    position: 'relative',
                  }}
                >
                  {isCurrentPlan && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                      }}
                    >
                      {t('pricing.currentPlan')}
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Typography variant="h5" component="h3" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                      {t(plan.name)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      {t(plan.description || '')}
                    </Typography>

                    <Box sx={{ my: 3, textAlign: 'center' }}>
                      <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                        {currency}{price}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {t('pricing.perMonth')}
                      </Typography>
                    </Box>

                    <List sx={{ mb: 2 }}>
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
                      {hasActiveSubscription ? (
                        <Button
                          variant="outlined"
                          size="large"
                          fullWidth
                          disabled
                          sx={{ py: 1.5 }}
                        >
                          {t('pricing.alreadySubscribed')}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          color="primary"
                          onClick={handlePlanSelect}
                          sx={{ py: 1.5 }}
                        >
                          {t('pricing.selectPlan')}
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Ödeme Sağlayıcısı Dialog */}
      <Dialog
        open={showGatewayDialog}
        onClose={() => setShowGatewayDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('pricing.selectPaymentMethod')}</DialogTitle>
        <DialogContent>
          {paymentGateways.length === 0 ? (
            <Typography color="error">
              No payment gateways available! Check console for details.
            </Typography>
          ) : (
            <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
              <RadioGroup
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
              >
                {paymentGateways.map((gateway) => (
                  <FormControlLabel
                    key={gateway.id}
                    value={gateway.gateway_type}
                    control={<Radio />}
                    label={gateway.name}
                    disabled={!gateway.is_active}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGatewayDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGatewaySelect}
            disabled={!selectedGateway}
          >
            {t('common.next')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PayTR iframe Modal */}
      {showPaytrModal && paytrIframeUrl && (
        <Dialog
          open={showPaytrModal}
          fullScreen
          onClose={() => setShowPaytrModal(false)}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Ödeme Sayfası</Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowPaytrModal(false);
                  router.push('/profile');
                }}
              >
                Kapat
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ padding: 0 }}>
            <Box component="iframe"
              src={paytrIframeUrl}
              sx={{
                width: '100%',
                height: 'calc(100vh - 100px)',
                border: 'none',
                overflow: 'hidden'
              }}
              id="paytriframe"
            />
          </DialogContent>
        </Dialog>
      )}
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