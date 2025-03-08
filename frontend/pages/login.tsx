'use client';

import { useState } from 'react';
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
      await login(data.email, data.password);
      toast.success(t('auth.loginSuccess'));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.email?.[0]) {
          const errorCode = errorData.email[0];
          switch (errorCode) {
            case 'email.not_verified':
              setFormError('email', { message: t('auth.errors.emailNotVerified') });
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
      const response = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'jobseeker');
      router.push('/dashboard');
      toast.success(t('auth.loginSuccess'));
    } catch (error) {
      toast.error(t('auth.loginError'));
    }
  };

  const handleLinkedInSuccess = async (code: string) => {
    try {
      const response = await axios.post('/api/auth/linkedin', { code });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'jobseeker');
      router.push('/dashboard');
      toast.success(t('auth.loginSuccess'));
    } catch (error) {
      toast.error(t('auth.loginError'));
    }
  };

  const handleResendVerification = async () => {
    const email = localStorage.getItem('registrationEmail');
    if (!email) {
      setError('Email adresi bulunamadı.');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/users/resend-verification-email/', { email });
      toast.success('Yeni doğrulama maili gönderildi. Lütfen email kutunuzu kontrol edin.');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Doğrulama maili gönderilemedi.');
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
                {loginError.includes('email adresinizi doğrulayın') && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={handleResendVerification}
                    disabled={loading}
                    sx={{ mt: 1 }}
                  >
                    Yeni Doğrulama Maili Gönder
                  </Button>
                )}
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

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error(t('auth.loginError'))}
                      useOneTap
                      theme="outline"
                      size="large"
                      width="200"
                      locale={router.locale}
                    />
                  </GoogleOAuthProvider>
                </Grid>
                
                
              </Grid>
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