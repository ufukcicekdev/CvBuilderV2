'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Grid,
  Link as MuiLink,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NextLink from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { resendVerificationEmail, authAPI } from '@/services/api';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { login, loginWithTokens } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors },
  } = useForm<LoginFormData>();

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setLoginError('');
    try {
      await login(data.email, data.password);
      toast.success(t('auth.loginSuccess'));
      const redirectUrl = (router.query.redirect as string) || '/dashboard';
      router.push(redirectUrl);
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData?.detail === 'email.not_verified') {
        setLoginError(t('auth.errors.emailNotVerified'));
        localStorage.setItem('registrationEmail', data.email);
      } else {
        setLoginError(t('auth.errors.invalidCredentials'));
      }
      toast.error(loginError || t('auth.errors.generalError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received');
      }
      const response = await authAPI.googleAuth({ token: credentialResponse.credential });
      const { access, refresh, user } = response.data;
      await loginWithTokens(access, refresh, user);
      toast.success(t('auth.loginSuccess'));
      const redirectUrl = (router.query.redirect as string) || (user.user_type === 'employer' ? '/dashboard/employer' : '/dashboard');
      router.push(redirectUrl);
    } catch (error) {
      toast.error(t('auth.errors.googleLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = localStorage.getItem('registrationEmail');
    if (!email) return;
    setLoading(true);
    try {
      await resendVerificationEmail(email);
      toast.success(t('auth.verificationEmailSent'));
    } catch (error) {
      toast.error(t('auth.verificationEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO
        title={t('login.seo.title', 'Login to Your Account')}
        description={t('login.seo.description', 'Log in to your CV Builder account to create, edit, and manage your professional resumes and CVs.')}
      />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)', // Adjust for navbar height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(170deg, ${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100]} 0%, ${theme.palette.mode === 'dark' ? '#1a1d24' : theme.palette.grey[200]} 100%)`,
          py: 5,
        }}
      >
        <Container component="main" maxWidth="xs">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={8}
              sx={{
                p: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 4,
              }}
            >
              <Logo size={40} />
              <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                {t('auth.login')}
              </Typography>

              <Box component="form" onSubmit={handleSubmit(handleLogin)} sx={{ mt: 3, width: '100%' }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label={t('auth.email')}
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register('email', {
                    required: t('validation.required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('validation.invalidEmail'),
                    },
                  })}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label={t('auth.password')}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  disabled={loading}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register('password', { required: t('validation.required') })}
                />

                {loginError && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography color="error" variant="body2">
                      {loginError}
                    </Typography>
                    {loginError === t('auth.errors.emailNotVerified') && (
                      <Button
                        size="small"
                        onClick={handleResendVerification}
                        disabled={loading}
                        sx={{ mt: 1, textTransform: 'none' }}
                      >
                        {t('auth.resendVerificationEmail')}
                      </Button>
                    )}
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.login')}
                </Button>

                <Grid container>
                  <Grid item xs>
                    <MuiLink component={NextLink} href="/forgot-password" variant="body2">
                      {t('auth.forgotPassword')}
                    </MuiLink>
                  </Grid>
                  <Grid item>
                    <MuiLink component={NextLink} href="/register" variant="body2">
                      {t('auth.dontHaveAccount')}
                    </MuiLink>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ width: '100%', my: 3 }}>{t('auth.orLoginWith')}</Divider>

              <Box sx={{ width: '100%' }}>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                   <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error(t('auth.errors.googleLoginFailed'))}
                      useOneTap
                      theme="outline"
                      size="large"
                      width="100%"
                      locale={router.locale || 'tr'}
                    />
                </GoogleOAuthProvider>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
