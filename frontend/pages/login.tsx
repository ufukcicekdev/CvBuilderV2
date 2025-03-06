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

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      
      // AuthContext'teki login fonksiyonunu kullan
      await login(data.email, data.password);
      
      showToast.success(t('auth.loginSuccess'));
      
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = handleApiError(error, t);
      showToast.error(errorMessage);
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

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message);
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

          <Box component="form" onSubmit={handleSubmitForm} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              autoFocus
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              disabled={loading}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
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

              <Grid container spacing={2}>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
                  <LinkedIn
                    clientId={process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!}
                    redirectUri={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/linkedin-callback`}
                    onSuccess={handleLinkedInSuccess}
                    onError={(error) => {
                      console.error(error);
                      toast.error(t('auth.loginError'));
                    }}
                  >
                    {({ linkedInLogin }) => (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<LinkedInIcon />}
                        onClick={linkedInLogin}
                      >
                        LinkedIn
                      </Button>
                    )}
                  </LinkedIn>
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