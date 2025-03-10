'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Grid,
  Tab,
  Tabs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon, LinkedIn as LinkedInIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { LinkedIn } from 'react-linkedin-login-oauth2';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import axiosInstance from '../services/axios';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { handleApiError } from '../utils/handleApiError';
import { resendVerificationEmail } from '@/services/api';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [userType, setUserType] = useState('jobseeker');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors }
  } = useForm<LoginFormData>();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Attempting login with:', { email: data.email });
      await login(data.email, data.password);
      console.log('Login successful');
      toast.success(t('auth.loginSuccess'));
    } catch (error) {
      console.error('Login error in component:', error);
      
      // Hata işleme
      const errorData = error as any;
      
      if (errorData) {
        console.log('Error data:', errorData);
        
        if (errorData.email?.[0]) {
          const errorCode = errorData.email[0];
          switch (errorCode) {
            case 'email.not_verified':
              setFormError('email', { message: t('auth.errors.emailNotVerified') });
              setLoginError(t('auth.errors.emailNotVerified'));
              localStorage.setItem('registrationEmail', data.email);
              break;
            case 'account.inactive':
              setFormError('email', { message: t('auth.errors.accountInactive') });
              break;
            case 'credentials.invalid':
              setFormError('email', { message: t('auth.errors.invalidCredentials') });
              setFormError('password', { message: t('auth.errors.invalidCredentials') });
              break;
            case 'field.required':
              setFormError('email', { message: t('auth.errors.emailRequired') });
              break;
            default:
              setFormError('email', { message: t('auth.errors.generalError') });
          }
        }
        
        if (errorData.password?.[0]) {
          const errorCode = errorData.password[0];
          switch (errorCode) {
            case 'field.required':
              setFormError('password', { message: t('auth.errors.passwordRequired') });
              break;
            default:
              setFormError('password', { message: t('auth.errors.generalError') });
          }
        }

        if (!errorData.email && !errorData.password && errorData.error) {
          toast.error(t('auth.errors.invalidCredentials'));
        }
      } else {
        toast.error(t('auth.errors.generalError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setUserType(newValue);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      console.log('Google login success:', credentialResponse);
      
      // Fetch kullanarak doğrudan backend URL'sine istek gönder
      const response = await fetch('/api/auth/google/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      // Normal login ile aynı response formatı
      // { refresh, access, user }
      
      // localStorage'a kaydet
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success(t('auth.loginSuccess'));
      
      // Kullanıcı tipine göre yönlendirme yap
      if (data.user.user_type === 'jobseeker') {
        router.push('/dashboard/create-cv');
      } else if (data.user.user_type === 'employer') {
        router.push('/dashboard/employer');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(t('auth.errors.googleLoginFailed'));
    }
  };

  const handleLinkedInSuccess = async (code: string) => {
    try {
      const response = await axios.post('/api/auth/linkedin', { code });
      
      // localStorage'a kaydet
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(t('auth.loginSuccess'));
      
      // Kullanıcı tipine göre yönlendirme yap
      if (response.data.user.user_type === 'jobseeker') {
        router.push('/dashboard/create-cv');
      } else if (response.data.user.user_type === 'employer') {
        router.push('/dashboard/employer');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('LinkedIn login error:', error);
      toast.error(t('auth.errors.linkedinLoginFailed'));
    }
  };

  const handleResendVerification = async () => {
    const email = localStorage.getItem('registrationEmail');
    if (!email) {
      setError(t('auth.emailNotFound'));
      return;
    }

    try {
      setLoading(true);
      await resendVerificationEmail(email);
      toast.success(t('auth.verificationEmailSent'));
    } catch (error: any) {
      setError(error.response?.data?.error || t('auth.verificationEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container component="main" maxWidth="xs">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            {t('auth.login')}
          </Typography>

          <Tabs value={userType} onChange={handleTabChange} sx={{ mt: 3 }}>
            <Tab label={t('auth.jobseeker')} value="jobseeker" />
            {/* <Tab label={t('auth.employer')} value="employer" /> */}
          </Tabs>

          <Box component="form" onSubmit={handleSubmit(handleLogin)} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              autoComplete="email"
              autoFocus
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', { 
                required: t('auth.errors.emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('validation.invalidEmail')
                }
              })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              disabled={loading}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', { 
                required: t('auth.errors.passwordRequired')
              })}
            />

            {loginError && (
              <Box sx={{ mt: 2 }}>
                <Typography color="error">
                  {loginError}
                </Typography>
                {(loginError.includes('email adresinizi doğrulayın') || loginError === t('auth.errors.emailNotVerified')) && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={handleResendVerification}
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    {t('auth.resendVerificationEmail')}
                  </Button>
                )}
              </Box>
            )}

            {!loginError && errors.email?.message === t('auth.errors.emailNotVerified') && (
              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleResendVerification}
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  {t('auth.resendVerificationEmail')}
                </Button>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login')}
            </Button>

            <Grid container spacing={2}>
              <Grid item xs>
                <Link href="/forgot-password" passHref>
                  <MuiLink variant="body2">
                    {t('auth.forgotPassword')}
                  </MuiLink>
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" passHref>
                  <MuiLink variant="body2">
                    {t('auth.register')}
                  </MuiLink>
                </Link>
              </Grid>
            </Grid>
          </Box>

          {userType === 'jobseeker' && (
            <>
              <Divider sx={{ width: '100%', my: 2 }}>
                <Typography color="textSecondary">
                  {t('auth.orLoginWith')}
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        console.error('Google login error');
                        toast.error(t('auth.loginError'));
                      }}
                      useOneTap
                      locale={router.locale}
                      text="signin_with"
                      shape="rectangular"
                      logo_alignment="left"
                      width="280"
                      theme="outline"
                    />
                  </Box>
                </GoogleOAuthProvider>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}; 