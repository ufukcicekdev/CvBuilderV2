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

export default function Pricing() {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const isYearly = false;
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
        
        console.log('Fetching data...');
        
        // Fetch data in parallel
        const [plansData, subscriptionData, gatewaysData] = await Promise.all([
          subscriptionService.getPlans(),
          isAuthenticated ? subscriptionService.getCurrentSubscription() : null,
          subscriptionService.getPaymentGateways()
        ]);
        
        console.log('Fetched plans:', plansData);
        console.log('Fetched subscription:', subscriptionData);
        console.log('Fetched payment gateways:', gatewaysData);
        
        if (plansData && plansData.length > 0) {
          setPlan(plansData[0]); // Just take the first plan
        }
        
        // Set gateways and select default gateway
        if (gatewaysData && gatewaysData.length > 0) {
          console.log('Setting payment gateways:', gatewaysData);
          setPaymentGateways(gatewaysData);
          
          // Select default gateway if available
          const defaultGateway = gatewaysData.find(g => g.is_default);
          if (defaultGateway) {
            console.log('Selected default gateway:', defaultGateway);
            setSelectedGateway(defaultGateway.gateway_type);
          } else {
            console.log('No default gateway found, using first one:', gatewaysData[0]);
            setSelectedGateway(gatewaysData[0].gateway_type);
          }
        } else {
          console.log('No payment gateways found!');
        }
        
        if (isAuthenticated) {
          // Check if subscription exists and has a valid structure
          if (subscriptionData && subscriptionData.status !== 'no_subscription') {
            console.log("User has a subscription:", subscriptionData);
            setCurrentSubscription(subscriptionData);
          } else {
            console.log("User has no active subscription");
            setCurrentSubscription(null);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(t('pricing.errorFetchingData') || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, t]);

  // Paddle.js'in yüklendiğini kontrol eden useEffect
  useEffect(() => {
    // Paddle script'ini yükle
    if (typeof window !== 'undefined' && !(window as any).Paddle) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      
      // Script yüklendikten sonra
      script.onload = () => {
        console.log("Paddle script loaded");
        
        // Paddle ortamını ayarla
        if ((window as any).Paddle && (window as any).Paddle.Environment) {
          // Use the environment variable instead of hardcoding
          const isSandbox = process.env.NEXT_PUBLIC_PADDLE_SANDBOX === 'true';
          if (isSandbox) {
            (window as any).Paddle.Environment.set("sandbox");
            console.log("Paddle environment set to sandbox");
          } else {
            console.log("Paddle environment set to production");
          }
          
          // Paddle'ı initialize et
          (window as any).Paddle.Initialize({
            token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
            checkout: {
              settings: {
                locale: localStorage.getItem('selectedLanguage')
              }
            },
            eventCallback: function(eventData: any) {
              // Checkout tamamlandı olayını dinle (başarılı ödeme)
              if (eventData.name === 'checkout.completed') {
                console.log('Ödeme başarıyla tamamlandı!', eventData);
                
                // Başarılı mesajı göster
                toast.success(t('pricing.subscriptionSuccess') || 'Aboneliğiniz başarıyla oluşturuldu!', { id: 'paddle-success-toast' });
                
                // Dashboard'a yönlendir
                window.location.href = '/dashboard';
              } 
              // Checkout kapatıldı olayı (kullanıcı pencereyi kapattığında)
              else if (eventData.name === 'checkout.closed') {
                console.log('Checkout penceresi kapatıldı', eventData);
                toast.dismiss('paddle-toast');
              }
              // Checkout yüklendi olayı
              else if (eventData.name === 'checkout.loaded') {
                console.log('Checkout yüklendi', eventData);
                toast.dismiss('paddle-toast');
              }
            }
          });
          
          console.log("Paddle initialized");
        }
      };
      
      document.head.appendChild(script);
    }
  }, [t]);

  // Ödeme yöntemlerinin değişimini takip et
  useEffect(() => {
    console.log('Payment Gateways updated:', paymentGateways);
    console.log('Selected Gateway:', selectedGateway);
  }, [paymentGateways, selectedGateway]);

  // Planı seçme ve ödeme sağlayıcılarını gösterme
  const handlePlanSelect = () => {
    if (!isAuthenticated) {
      // Redirect to login page with redirect back to pricing
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }
    
    // Ödeme sağlayıcısı seçim dialogunu göster
    setShowGatewayDialog(true);
  };
  
  // Ödeme sağlayıcısını seçme ve ödeme işlemini başlatma
  const handleGatewaySelect = async () => {
    if (!selectedGateway) {
      toast.error(t('pricing.selectPaymentProvider'));
      return;
    }
    
    try {
      // Sadece PayTR seçilmişse adres ve telefon bilgilerini kontrol et
      if (selectedGateway === 'paytr') {
        console.log("PayTR selected, checking user profile...");
        
        // API'dan güncel kullanıcı bilgilerini getir
        try {
          const userProfileResponse = await axiosInstance.get('/api/users/me/');
          console.log("Current user profile:", userProfileResponse.data);
          
          // API'dan gelen verilere göre kontrol et
          const userProfile = userProfileResponse.data;
          if (!userProfile.address || !userProfile.phone) {
            console.log("Missing address or phone:", { address: userProfile.address, phone: userProfile.phone });
            toast.error(t('pricing.missingUserInfo', 'PayTR ödemesi için adres ve telefon bilgileriniz gereklidir. Lütfen profil sayfanızdan bu bilgileri doldurun.'));
            router.push('/profile');
            return;
          }
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast.error(t('common.errors.profileFetchError', 'Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.'));
          return;
        }
      }
      
      // Yükleniyor durumunu göster
      toast.loading(t('pricing.processingCheckout'), { id: 'payment-toast' });
      
      // Abonelik oluşturma isteği yap
      const response = await subscriptionService.createSubscription({
        plan_id: plan.plan_id,
        period: isYearly ? 'yearly' : 'monthly',
        payment_provider: selectedGateway,
      });
      
      // Dialog'u kapat
      setShowGatewayDialog(false);
      
      console.log('Create subscription response:', response);
      
      // Seçilen ödeme sağlayıcısına göre işlem yap
      if (selectedGateway === 'paddle') {
        // Paddle için
        const priceId = response.data?.price_id;
        
        // Kullanıcı dilini al (varsayılan tr)
        const userLocale = localStorage.getItem('selectedLanguage') || 'tr';
  
        // Paddle'ın kullanılmaya hazır olup olmadığını kontrol et
        if (typeof window !== 'undefined' && 
            (window as any).Paddle && 
            (window as any).Paddle.Checkout) {
          
          console.log("Paddle is ready, opening checkout...");
          
          // Checkout'u aç
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
            console.error("Error opening Paddle checkout:", checkoutError);
            toast.error(t('pricing.checkoutError'), { id: 'payment-toast' });
          }
        } else {
          console.error("Paddle is not loaded properly");
          toast.error(t('pricing.paddleNotLoaded'), { id: 'payment-toast' });
        }
      } else if (selectedGateway === 'paytr') {
        // PayTR için
        console.log('Full PayTR response:', response);
        
        if (response.data?.iframe_url) {
          console.log('PayTR iframe URL:', response.data.iframe_url);
          
          // Dialog'ı kapat
          setShowGatewayDialog(false);
          
          // PayTR iframe'ini doğrudan sayfada göster
          setPaytrIframeUrl(response.data.iframe_url);
          setShowPaytrModal(true);
          
          toast.dismiss('payment-toast');
        } else {
          console.error('PayTR iframe URL not found in response:', response.data);
          toast.error(t('pricing.paytrError') || 'Error with PayTR payment.', { id: 'payment-toast' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('pricing.checkoutError'), { id: 'payment-toast' });
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

  const price = plan.price_monthly;
  const currency = plan.currency;
  const isCurrentPlan = currentSubscription && 
    currentSubscription?.plan?.plan_id === plan.plan_id && 
    currentSubscription.status === 'active';
  const isPeriodMatch = currentSubscription && currentSubscription.period === 'monthly';
  // Yeni kontrol: herhangi bir aktif abonelik var mı?
  const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active';

  return (
    <Layout>
      <Head>
        <title>{t('pricing.pageTitle')}</title>
        <meta name="description" content={t('pricing.pageDescription')} />
      </Head>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          {t('pricing.title')}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          {t('pricing.description')}
        </Typography>

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
                  {currency}{price}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('pricing.perMonth')}
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
                {hasActiveSubscription ? (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    disabled
                  >
                    {isCurrentPlan ? t('pricing.currentPlan') : t('pricing.alreadySubscribed', 'Zaten Aboneliğiniz Var')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    color="primary"
                    onClick={handlePlanSelect}
                  >
                    {t('pricing.selectPlan')}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
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