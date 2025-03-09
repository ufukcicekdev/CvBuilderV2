import React, { useState } from 'react';
import { 
  TextField, Button, Container, Typography, Box, 
  Grid, Paper, Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import { authAPI } from '../services/api';

// Form şemasını oluşturmak için fonksiyon
const createSchema = (t: any) => yup.object().shape({
  email: yup
    .string()
    .email(t('validation.invalidEmail', 'Geçerli bir email adresi giriniz'))
    .required(t('validation.required', 'Bu alan zorunludur')),
}).required();

// Form verilerinin tipi
interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form şemasını t fonksiyonu ile oluştur
  const schema = createSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // API isteği
      await authAPI.forgotPassword(data.email);
      
      // Başarılı
      setSuccess(true);
      toast.success(t('auth.forgotPasswordSuccess', 'Şifre sıfırlama bağlantısı email adresinize gönderildi.'));
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data);
      setError(error.response?.data?.message || t('auth.forgotPasswordError', 'Şifre sıfırlama işlemi sırasında bir hata oluştu.'));
      toast.error(error.response?.data?.message || t('auth.forgotPasswordError', 'Şifre sıfırlama işlemi sırasında bir hata oluştu.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              {t('auth.forgotPassword', 'Şifremi Unuttum')}
            </Typography>
            
            {success ? (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {t('auth.forgotPasswordSuccess', 'Şifre sıfırlama bağlantısı email adresinize gönderildi.')}
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  {t('auth.checkEmail', 'Lütfen email kutunuzu kontrol edin ve şifre sıfırlama bağlantısına tıklayın.')}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={() => router.push('/login')}
                >
                  {t('auth.backToLogin', 'Giriş Sayfasına Dön')}
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                  {t('auth.forgotPasswordInstructions', 'Şifrenizi sıfırlamak için kayıtlı email adresinizi girin.')}
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('common.submitting', 'Gönderiliyor...') : t('auth.sendResetLink', 'Sıfırlama Bağlantısı Gönder')}
                  </Button>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link href="/login" passHref>
                      <Typography component="a" variant="body2" sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                        {t('auth.backToLogin', 'Giriş Sayfasına Dön')}
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
} 