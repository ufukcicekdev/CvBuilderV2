import { useState } from 'react';
import { 
  TextField, Button, Container, Typography, Box, Select, 
  MenuItem, FormControl, InputLabel, Grid, FormHelperText 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { authAPI } from '../services/api';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { tr } from 'date-fns/locale';
import axios from 'axios';
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
    .required('Kullanıcı tipi zorunludur'),
  phone: yup
    .string()
    .when('user_type', {
      is: 'jobseeker',
      then: () => yup
        .string()
        .matches(/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz')
        .required('Telefon numarası zorunludur'),
      otherwise: () => yup.string().notRequired()
    }),
  birth_date: yup
    .date()
    .when('user_type', {
      is: 'jobseeker',
      then: () => yup
        .date()
        .max(new Date(), 'Geçerli bir doğum tarihi giriniz')
        .required('Doğum tarihi zorunludur'),
      otherwise: () => yup.date().notRequired()
    }),
  company_name: yup
    .string()
    .when('user_type', {
      is: 'employer',
      then: () => yup
        .string()
        .min(2, 'Şirket adı en az 2 karakter olmalıdır')
        .required('Şirket adı zorunludur'),
      otherwise: () => yup.string().notRequired()
    }),
  company_website: yup
    .string()
    .when('user_type', {
      is: 'employer',
      then: () => yup
        .string()
        .url('Geçerli bir website adresi giriniz')
        .notRequired(),
      otherwise: () => yup.string().notRequired()
    })
}).required();

// Form verilerinin tipi
interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  user_type: 'jobseeker' | 'employer';
  phone?: string;
  birth_date?: Date;
  company_name?: string;
  company_website?: string;
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
    mode: 'onChange'
  });

  const userType = watch('user_type');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData: any = {
        email: data.email,
        username: data.username,
        password: data.password,
        password2: data.confirmPassword,
        user_type: data.user_type
      };

      if (data.user_type === 'jobseeker') {
        formData.phone = data.phone;
        formData.birth_date = data.birth_date;
      } else if (data.user_type === 'employer') {
        formData.company_name = data.company_name;
        formData.company_website = data.company_website;
      }

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

              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.user_type}>
                  <InputLabel>{t('auth.userType')}</InputLabel>
                  <Select
                    {...register('user_type')}
                    label={t('auth.userType')}
                  >
                    <MenuItem value="jobseeker">{t('auth.jobseeker')}</MenuItem>
                    <MenuItem value="employer">{t('auth.employer')}</MenuItem>
                  </Select>
                  {errors.user_type && (
                    <FormHelperText>{errors.user_type.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {userType === 'jobseeker' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('auth.phone')}
                      {...register('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                      <DatePicker<Date>
                        label={t('auth.birthDate')}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setValue('birth_date', date);
                          }
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.birth_date,
                            helperText: errors.birth_date?.message
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
              )}

              {userType === 'employer' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('auth.companyName')}
                      {...register('company_name')}
                      error={!!errors.company_name}
                      helperText={errors.company_name?.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('auth.companyWebsite')}
                      {...register('company_website')}
                      error={!!errors.company_website}
                      helperText={errors.company_website?.message}
                    />
                  </Grid>
                </>
              )}
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