import React, { useState, useEffect, useMemo } from 'react';
import { 
  TextField, Button, Container, Typography, Box, 
  FormControl, InputLabel, Grid, FormHelperText,
  Alert
} from '@mui/material';
import { authAPI } from '../services/api';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../services/axios';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';

// Desteklenen diller
const SUPPORTED_LANGUAGES = ['tr', 'en', 'fr', 'de', 'ru', 'hi', 'ar', 'zh', 'es', 'it'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Form verilerinin tipi
interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  user_type: 'jobseeker' | 'employer';
  language?: SupportedLanguage;
}

export default function Register() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const { currentLanguage, changeLanguage } = useLanguage();

  // Kullanıcının seçtiği dili al
  const getUserLanguage = (): SupportedLanguage => {
    // Önce localStorage'dan dil tercihini kontrol et
    const storedLang = localStorage.getItem('selectedLanguage') as SupportedLanguage;
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }
    // Yoksa tarayıcı dilini kontrol et
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
  };

  // Form şeması
  const schema = useMemo(() => 
    yup.object().shape({
      email: yup
        .string()
        .email(t('validation.invalidEmail'))
        .required(t('validation.required')),
      username: yup
        .string()
        .min(3, t('validation.usernameMinLength'))
        .required(t('validation.required')),
      password: yup
        .string()
        .min(8, t('validation.passwordMinLength'))
        .matches(/[0-9]/, t('validation.passwordNumber'))
        .matches(/[a-z]/, t('validation.passwordLowercase'))
        .matches(/[A-Z]/, t('validation.passwordUppercase'))
        .required(t('validation.required')),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], t('validation.passwordMatch'))
        .required(t('validation.required')),
      user_type: yup
        .string()
        .oneOf(['jobseeker', 'employer'], t('validation.invalidUserType'))
        .required(t('validation.required'))
    }).required(),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    setError
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

  const getErrorMessage = (field: string, errorMessage: string) => {
    // Backend'den gelen tam mesajı kontrol et
    if (errorMessage.includes("user with this username already exists")) {
      return t('errors.usernameExists');
    }
    if (errorMessage.includes("user with this email already exists")) {
      return t('errors.emailExists');
    }

    // Diğer hata kodları için mevcut mantığı kullan
    const errorCodes: { [key: string]: string } = {
      'exists': field === 'username' ? t('errors.usernameExists') : t('errors.emailExists'),
      'invalid': field === 'username' ? t('errors.invalidUsername') : t('errors.invalidEmail'),
      'weak': t('errors.weakPassword'),
      'mismatch': t('errors.passwordMismatch'),
    };

    return errorCodes[errorMessage] || t('errors.unknown');
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setRegistrationError('');
      
      const formData = {
        email: data.email,
        username: data.username,
        password: data.password,
        password2: data.confirmPassword,
        user_type: 'jobseeker',
        language: getUserLanguage() // Kullanıcının dil tercihini ekle
      };

      try {
        const response = await axiosInstance.post('/api/users/register/', formData);
        
        // Başarılı kayıt durumu
        localStorage.setItem('registrationEmail', data.email);
        toast.success(t('auth.registerSuccess'));
        toast(t('auth.checkEmail'), {
          icon: 'ℹ️',
          duration: 5000,
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
      } catch (networkError: any) {
        // Eğer istek başarılı olduysa (response alındıysa) ama işlenirken hata olduysa
        if (networkError.response) {
          // Backend'den yanıt aldık ama başarısız durum kodu
          if (networkError.response.status === 400) {
            const backendErrors = networkError.response.data;
            setRegistrationError(backendErrors[Object.keys(backendErrors)[0]][0]);
            
            Object.entries(backendErrors).forEach(([field, errors]) => {
              if (Array.isArray(errors) && errors.length > 0) {
                const errorMessage = errors[0];
                if (field in data) {
                  setError(field as keyof RegisterFormData, {
                    type: 'manual',
                    message: getErrorMessage(field, errorMessage)
                  });
                }
              }
            });
            
            toast.error(t('errors.formErrors'));
          } else {
            // Diğer HTTP hata kodları
            toast.error(t('errors.registrationFailed'));
          }
        } else if (networkError.request) {
          // İstek yapıldı ama yanıt alınamadı - muhtemelen kayıt başarılı oldu
          console.log('Request was made but no response received - assuming registration was successful');
          
          // Başarılı kayıt mesajlarını göster
          localStorage.setItem('registrationEmail', data.email);
          toast.success(t('auth.registerSuccess'));
          toast(t('auth.checkEmail'), {
            icon: 'ℹ️',
            duration: 5000,
          });
          
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          // İstek oluşturulurken hata
          console.error('Error setting up request:', networkError.message);
          toast.error(t('common.errors.networkError'));
        }
      }
    } catch (error: any) {
      // Genel hata durumu
      console.error('General error:', error);
      toast.error(t('errors.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Component mount olduğunda dili ayarla
  useEffect(() => {
    const currentLang = getUserLanguage();
    if (changeLanguage) {
      changeLanguage(currentLang);
    }
  }, [changeLanguage]);

  return (
    <Layout>
      <SEO 
        title={t('register.seo.title', 'Create Your CV Builder Account')}
        description={t('register.seo.description', 'Sign up for CV Builder to create professional resumes and CVs. Get started with our easy-to-use resume builder today.')}
        keywords={t('register.seo.keywords', 'register, sign up, create account, cv builder, resume creator')}
        ogType="website"
      />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            {t('auth.register')}
          </Typography>

          {registrationError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {registrationError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
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

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}; 