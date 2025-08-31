'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField, Button, Container, Typography, Box, 
  Grid, Link as MuiLink, Paper, useTheme, CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SEO from '../components/SEO';
import NextLink from 'next/link';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  const schema = useMemo(() => 
    yup.object().shape({
      email: yup.string().email(t('validation.invalidEmail')).required(t('validation.required')),
      username: yup.string().min(3, t('validation.usernameMinLength')).required(t('validation.required')),
      password: yup.string().min(8, t('validation.passwordMinLength')).matches(/[0-9]/, t('validation.passwordNumber')).matches(/[a-z]/, t('validation.passwordLowercase')).matches(/[A-Z]/, t('validation.passwordUppercase')).required(t('validation.required')),
      confirmPassword: yup.string().oneOf([yup.ref('password')], t('validation.passwordMatch')).required(t('validation.required')),
    }).required(),
    [t]
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const formData = {
        email: data.email,
        username: data.username,
        password: data.password,
        password2: data.confirmPassword,
        user_type: 'jobseeker',
      };
      await authAPI.register(formData);
      localStorage.setItem('registrationEmail', data.email);
      toast.success(t('auth.registerSuccess'));
      toast(t('auth.checkEmail'), { icon: 'ℹ️', duration: 5000 });
      router.push('/login');
    } catch (error: any) {
      const backendErrors = error?.response?.data;
      if (backendErrors) {
        Object.entries(backendErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors) && errors.length > 0) {
            setError(field as keyof RegisterFormData, {
              type: 'manual',
              message: errors[0],
            });
          }
        });
        toast.error(t('errors.formErrors'));
      } else {
        toast.error(t('errors.registrationFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title={t('register.seo.title', 'Create Your CV Builder Account')}
        description={t('register.seo.description', 'Sign up for CV Builder to create professional resumes and CVs.')}
      />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(170deg, ${theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.grey[100]} 0%, ${theme.palette.mode === 'dark' ? '#1a1d24' : theme.palette.grey[200]} 100%)`,
          py: 5,
        }}
      >
        <Container component="main" maxWidth="sm">
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
                maxWidth: 450,
                mx: 'auto'
              }}
            >
              <Logo size={40} />
              <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                {t('auth.register')}
              </Typography>

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('auth.email')}
                      autoComplete="email"
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('auth.username')}
                      autoComplete="username"
                      {...register('username')}
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label={t('auth.password')}
                      autoComplete="new-password"
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label={t('auth.confirmPassword')}
                      autoComplete="new-password"
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
                  size="large"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : t('auth.register')}
                </Button>
                
                <Grid container justifyContent="center">
                  <Grid item>
                    <MuiLink component={NextLink} href="/login" variant="body2">
                      {t('auth.alreadyHaveAccount')}
                    </MuiLink>
                  </Grid>
                </Grid>
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
