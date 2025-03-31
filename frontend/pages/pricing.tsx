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
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import Head from 'next/head';
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
  const { isAuthenticated, user } = useAuth();
  const isYearly = false;
  const [plan, setPlan] = useState<SubscriptionPlan>(DEFAULT_SUBSCRIPTION_PLAN);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // localStorage'dan user verisini kontrol et
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage) {
          const parsedUser = JSON.parse(userFromStorage);
        
        }
        
        const plansData = await subscriptionService.getPlans();
        if (plansData && plansData.length > 0) {
          setPlan(plansData[0]); // Just take the first plan
        }
        
        if (isAuthenticated) {
          const subscription = await subscriptionService.getCurrentSubscription();
          // Check if subscription exists and has a valid structure
          if (subscription && subscription.status !== 'no_subscription') {
            console.log("User has a subscription:", subscription);
            setCurrentSubscription(subscription);
          } else {
            console.log("User has no active subscription");
            setCurrentSubscription(null);
          }
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

  // Paddle.js'i kullanarak doğrudan ödeme işlemini başlat
  const handlePlanSelect = async () => {
    if (!isAuthenticated) {
      // Redirect to login page with redirect back to pricing
      router.push(`/login?redirect=${encodeURIComponent('/pricing')}`);
      return;
    }

    try {
      // Paddle işleminin başladığını göster
      toast.loading(t('pricing.processingCheckout'), { id: 'paddle-toast' });
      
      // Paddle için price_id'yi kullan
      const priceId = plan.paddle_price_id;
      
      // Kullanıcı dilini al (varsayılan tr)
      const userLocale = localStorage.getItem('selectedLanguage') || 'tr';

      console.log("Locale:", userLocale);
      
      // Paddle'ın kullanılmaya hazır olup olmadığını kontrol et
      if (typeof window !== 'undefined' && 
          (window as any).Paddle && 
          (window as any).Paddle.Checkout) {
        
        console.log("Paddle is ready, opening checkout...");
        
        // Checkout'u aç - daha güvenli şekilde
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
          console.log("Paddle checkout opened successfully");
        } catch (checkoutError) {
          console.error("Error opening Paddle checkout:", checkoutError);
          toast.error(t('pricing.checkoutError'), { id: 'paddle-toast' });
        }
      } else {
        console.error("Paddle is not loaded properly");
        toast.error(t('pricing.paddleNotLoaded'), { id: 'paddle-toast' });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('pricing.checkoutError'), { id: 'paddle-toast' });
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
                  ${price}
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