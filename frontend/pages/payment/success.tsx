import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Button, Paper, Divider } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { green } from '@mui/material/colors';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentSuccess() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showLoginButton, setShowLoginButton] = useState(false);

  // Oturum durumunu kontrol et, ancak hemen yönlendirme yapma
  useEffect(() => {
    // Kullanıcının sayfayı görmesine izin ver
    // Oturum açık değilse, 2 saniye sonra giriş butonunu göster
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowLoginButton(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const goToProfile = () => {
    router.push('/profile');
  };
  
  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            mb: 4
          }}>
            <CheckCircleIcon sx={{ 
              fontSize: 80, 
              color: green[500],
              mb: 2
            }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              {t('payment.success.title', 'Ödeme Başarılı')}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('payment.success.description', 'Ödemeniz başarıyla tamamlandı. Aboneliğiniz aktif hale getirildi.')}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: 2,
            mt: 4
          }}>
            {isAuthenticated ? (
              <>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={goToDashboard}
                  sx={{ minWidth: 200 }}
                >
                  {t('payment.success.goDashboard', 'Panele Git')}
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  onClick={goToProfile}
                  sx={{ minWidth: 200 }}
                >
                  {t('payment.success.goProfile', 'Profilim')}
                </Button>
              </>
            ) : (
              showLoginButton && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={goToLogin}
                  sx={{ minWidth: 200 }}
                >
                  {t('login', 'Giriş Yap')}
                </Button>
              )
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 