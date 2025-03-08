import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, CircularProgress, Button, Alert } from '@mui/material';
import { verifyEmail, resendVerificationEmail } from '@/services/api';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

const EmailVerification = () => {
  const router = useRouter();
  const { token } = router.query;
  const { t } = useTranslation();
  
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || typeof token !== 'string') return;

      try {
        const response = await verifyEmail(token);
        setSuccess(true);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Doğrulama işlemi başarısız oldu.');
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleResendEmail = async () => {
    try {
      // Bu örnekte email adresini localStorage'dan alıyoruz
      // Gerçek uygulamada bu bilgiyi daha güvenli bir şekilde saklamalısınız
      const email = localStorage.getItem('registrationEmail');
      
      if (!email) {
        setError('Email adresi bulunamadı. Lütfen tekrar kayıt olun.');
        return;
      }

      await resendVerificationEmail(email);
      setError(null);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email gönderme işlemi başarısız oldu.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Email Doğrulama
        </Typography>

        {verifying ? (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              Email adresiniz doğrulanıyor...
            </Typography>
          </Box>
        ) : success ? (
          <Box sx={{ mt: 4 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Email adresiniz başarıyla doğrulandı!
            </Alert>
            <Typography sx={{ mb: 2 }}>
              Artık giriş yapabilirsiniz.
            </Typography>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              color="primary"
              fullWidth
            >
              Giriş Yap
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 4, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography sx={{ mb: 2 }}>
              Doğrulama bağlantısının süresi dolmuş olabilir.
            </Typography>
            <Button
              onClick={handleResendEmail}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Yeni Doğrulama Maili Gönder
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              color="primary"
              fullWidth
            >
              Giriş Sayfasına Dön
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EmailVerification; 