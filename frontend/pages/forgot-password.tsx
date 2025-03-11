import React, { useState } from 'react';
import { 
  TextField, Button, Container, Typography, Box, 
  Grid, Paper, Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import NextLink from 'next/link';
import { authAPI } from '../services/api';

// Form şemasını oluşturmak için fonksiyon
const createSchema = (t: any) => yup.object().shape({
  email: yup
    .string()
    .email(t('validation.invalidEmail'))
    .required(t('validation.required')),
}).required();

// Form verilerinin tipi
interface ForgotPasswordFormData {
  email: string;
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default function ForgotPassword() {
  const { t } = useTranslation('common');
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
      
      // API isteği - authAPI.forgotPassword fonksiyonu artık localStorage'dan dil bilgisini alıyor
      await authAPI.forgotPassword(data.email);
      
      // Başarılı
      setSuccess(true);
      toast.success(t('auth.forgotPasswordSuccess'));
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data);
      setError(error.response?.data?.message || t('auth.forgotPasswordError'));
      toast.error(error.response?.data?.message || t('auth.forgotPasswordError'));
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
              {t('auth.forgotPassword')}
            </Typography>
            
            {success ? (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {t('auth.forgotPasswordSuccess')}
                </Alert>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  {t('auth.checkEmail')}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={() => router.push('/login')}
                >
                  {t('auth.backToLogin')}
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                  {t('auth.forgotPasswordInstructions')}
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
                        label={t('auth.email')}
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
                    {isSubmitting ? t('common.submitting') : t('auth.sendResetLink')}
                  </Button>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography 
                      component={NextLink} 
                      href="/login" 
                      variant="body2" 
                      sx={{ cursor: 'pointer', textDecoration: 'none' }}
                    >
                      {t('auth.backToLogin')}
                    </Typography>
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