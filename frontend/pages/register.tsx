import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Container, Typography, Box, 
  FormControl, InputLabel, Grid, FormHelperText 
} from '@mui/material';
import { authAPI } from '../services/api';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../services/axios';

// Form şeması
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Geçerli bir email adresi giriniz')
    .required('Email adresi zorunludur'),
  username: yup
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .required('Kullanıcı adı zorunludur'),
  password: yup
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .required('Şifre zorunludur'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
  user_type: yup
    .string()
    .oneOf(['jobseeker', 'employer'], 'Geçerli bir kullanıcı tipi seçiniz')
    .required('Kullanıcı tipi zorunludur')
}).required();

// Form verilerinin tipi
interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  user_type: 'jobseeker' | 'employer';
}

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      user_type: 'jobseeker'
    }
  });

  const userType = watch('user_type');

  useEffect(() => {
    setValue('user_type', 'jobseeker');
  }, [setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData: any = {
        email: data.email,
        username: data.username,
        password: data.password,
        password2: data.confirmPassword,
        user_type: 'jobseeker'
      };

      const response = await axiosInstance.post('/api/users/register/', formData);
      
      if (response.data) {
        toast.success(t('auth.registerSuccess'));
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      toast.error(error.response?.data?.message || t('auth.registerError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            {t('auth.register')}
          </Typography>
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('auth.username')}
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
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>

              {/* User type selection is hidden and set to jobseeker by default */}
              <input type="hidden" {...register('user_type')} value="jobseeker" />
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.submitting') : t('auth.register')}
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
} 