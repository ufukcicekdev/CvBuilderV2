import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Container, Typography, Box, 
  Grid, Paper, Alert, CircularProgress
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
  password: yup
    .string()
    .min(8, ({ min }) => t('validation.passwordMinLength', `Şifre en az ${min} karakter olmalıdır`))
    .matches(/[0-9]/, t('validation.passwordNumber', 'Şifre en az bir rakam içermelidir'))
    .matches(/[a-z]/, t('validation.passwordLowercase', 'Şifre en az bir küçük harf içermelidir'))
    .matches(/[A-Z]/, t('validation.passwordUppercase', 'Şifre en az bir büyük harf içermelidir'))
    .required(t('validation.required', 'Bu alan zorunludur')),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], t('validation.passwordMatch', 'Şifreler eşleşmiyor'))
    .required(t('validation.required', 'Bu alan zorunludur')),
}).required();

// Form verilerinin tipi
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form şemasını t fonksiyonu ile oluştur
  const schema = createSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  // Token doğrulama
  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        // Token doğrulama API isteği
        await authAPI.validateResetToken(String(token));
        setIsValidToken(true);
      } catch (error: any) {
        console.error('Token validation error:', error);
        setError(t('auth.invalidToken', 'Geçersiz veya süresi dolmuş token.'));
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, t]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError(t('auth.missingToken', 'Token bulunamadı.'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      // API isteği
      await authAPI.resetPassword({
        token: String(token),
        password: data.password,
        password_confirm: data.confirmPassword
      });
      
      // Başarılı
      setSuccess(true);
      toast.success(t('auth.resetPasswordSuccess', 'Şifreniz başarıyla sıfırlandı.'));
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data);
      setError(error.response?.data?.message || t('auth.resetPasswordError', 'Şifre sıfırlama işlemi sırasında bir hata oluştu.'));
      toast.error(error.response?.data?.message || t('auth.resetPasswordError', 'Şifre sıfırlama işlemi sırasında bir hata oluştu.'));
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
              {t('auth.resetPassword', 'Şifre Sıfırlama')}
            </Typography>
            
            {isValidating ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : success ? (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {t('auth.resetPasswordSuccess', 'Şifreniz başarıyla sıfırlandı.')}
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  {t('auth.canLoginNow', 'Artık yeni şifrenizle giriş yapabilirsiniz.')}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => router.push('/login')}
                >
                  {t('auth.goToLogin', 'Giriş Yap')}
                </Button>
              </Box>
            ) : !isValidToken ? (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error || t('auth.invalidToken', 'Geçersiz veya süresi dolmuş token.')}
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  {t('auth.requestNewLink', 'Lütfen yeni bir şifre sıfırlama bağlantısı talep edin.')}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={() => router.push('/forgot-password')}
                >
                  {t('auth.forgotPassword', 'Şifremi Unuttum')}
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                  {t('auth.resetPasswordInstructions', 'Lütfen yeni şifrenizi girin.')}
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
                        type="password"
                        label={t('auth.newPassword', 'Yeni Şifre')}
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label={t('auth.confirmPassword', 'Şifre Tekrarı')}
                        {...register('confirmPassword')}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
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
                    {isSubmitting ? t('common.submitting', 'Gönderiliyor...') : t('auth.resetPassword', 'Şifremi Sıfırla')}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
} 