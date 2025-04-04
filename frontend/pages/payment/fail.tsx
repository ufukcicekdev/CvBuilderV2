import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Button, Paper, Divider } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { red } from '@mui/material/colors';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentFail() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Eğer kullanıcı oturum açmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const goToPricing = () => {
    router.push('/pricing');
  };

  const goToSupport = () => {
    router.push('/contact');
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
            <CancelIcon sx={{ 
              fontSize: 80, 
              color: red[500],
              mb: 2
            }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              {t('payment.fail.title', 'Ödeme Başarısız')}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {t('payment.fail.description', 'Ödeme işlemi sırasında bir sorun oluştu. Lütfen daha sonra tekrar deneyin veya destek ekibimizle iletişime geçin.')}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ 
            mt: 3,
            mb: 4,
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            p: 2,
            borderRadius: 1,
          }}>
            <Typography variant="body2">
              {t('payment.fail.notice', 'Eğer hesabınızdan para çekildiğini düşünüyorsanız lütfen bizimle iletişime geçin. En kısa sürede sorunu çözeceğiz.')}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: 2,
            mt: 4
          }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={goToPricing}
              sx={{ minWidth: 200 }}
            >
              {t('payment.fail.tryAgain', 'Tekrar Dene')}
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={goToSupport}
              sx={{ minWidth: 200 }}
            >
              {t('payment.fail.contactSupport', 'Destek Ekibi')}
            </Button>
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