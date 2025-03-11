import { useForm } from 'react-hook-form';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  InputAdornment,
  CircularProgress,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { showToast } from '../../utils/toast';
import { 
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as SummaryIcon
} from '@mui/icons-material';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';

interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  website: string;
  linkedin: string;
  github: string;
}

interface PersonalInfoFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  isLoading?: boolean;
}

interface PersonalInfoFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface PersonalInfoFormRef {
  getFormData: () => Promise<any>;
}

const PersonalInfoForm = forwardRef<PersonalInfoFormRef, PersonalInfoFormProps>(
  ({ cvId, onPrev, onStepComplete, isLoading }, ref) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const {
      register,
      handleSubmit: handleFormSubmit,
      formState: { errors },
      setValue,
      getValues
    } = useForm<PersonalInfoFormData>();

    useImperativeHandle(ref, () => ({
      getFormData: async () => {
        const values = getValues();
        return {
          personal_info: {
            full_name: values.fullName,
            email: values.email,
            phone: values.phone,
            address: values.location,
            summary: values.summary || '',
            website: values.website || '',
            linkedin: values.linkedin || '',
            github: values.github || ''
          }
        };
      }
    }));

    // Translation key'lerini string literal olarak belirtelim
    const translations = {
      email: t('cv.personalInfo.email', 'Email'),
      website: t('cv.personalInfo.website', 'Website'),
      linkedin: t('cv.personalInfo.linkedin', 'LinkedIn'),
      github: t('cv.personalInfo.github', 'GitHub')
    };

    const fetchPersonalInfo = useCallback(async () => {
      setIsDataLoading(true);
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.personal_info) {
          const personalInfo = response.data.personal_info;
          // Form alanlarını doldur
          setValue('fullName', personalInfo.full_name || '');
          setValue('email', personalInfo.email || '');
          setValue('phone', personalInfo.phone || '');
          setValue('location', personalInfo.address || '');
          setValue('summary', personalInfo.summary || '');
          setValue('website', personalInfo.website || '');
          setValue('linkedin', personalInfo.linkedin || '');
          setValue('github', personalInfo.github || '');
        }
      } catch (error) {
        console.error('Error fetching personal info:', error);
        showToast.error(t('cv.loadError'));
      } finally {
        setIsDataLoading(false);
      }
    }, [cvId, setValue, t]);

    useEffect(() => {
      if (cvId) {
        fetchPersonalInfo();
      } else {
        setIsDataLoading(false);
      }
    }, [cvId, fetchPersonalInfo]);

    const onSubmit = async (data: PersonalInfoFormData) => {
      try {
        setLoading(true);
        
        // Veriyi formatlayalım
        const formattedData = {
          personal_info: {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.location,
            summary: data.summary || '',
            website: data.website || '',
            linkedin: data.linkedin || '',
            github: data.github || ''
          }
        };

        // Parent component'e bildir
        await onStepComplete({
          ...formattedData,
          language: router.locale
        });
        
      } catch (error) {
        console.error('Error saving personal info:', error);
        showToast.error(t('cv.saveError'));
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleFormSubmit(onSubmit)} id="personalInfoForm">
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" color="primary.main">
              {t('cv.personalInfo.title')}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
            {t('cv.personalInfo.subtitle')}
          </Typography>
          
          {isDataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('cv.personalInfo.fullName')}
                  {...register('fullName', { required: true })}
                  error={!!errors.fullName}
                  helperText={errors.fullName && t('common.required')}
                  placeholder={t('cv.personalInfo.fullNamePlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.email}
                  type="email"
                  {...register('email', { 
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i 
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.type === 'required' 
                    ? t('common.required') 
                    : errors.email?.type === 'pattern'
                    ? t('common.invalidEmail')
                    : ''}
                  placeholder="example@domain.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.personalInfo.phone')}
                  {...register('phone', { required: true })}
                  error={!!errors.phone}
                  helperText={errors.phone && t('common.required')}
                  placeholder={t('cv.personalInfo.phonePlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('cv.personalInfo.location')}
                  {...register('location', { required: true })}
                  error={!!errors.location}
                  helperText={errors.location && t('common.required')}
                  placeholder={t('cv.personalInfo.locationPlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('cv.personalInfo.summary')}
                  {...register('summary')}
                  placeholder={t('cv.personalInfo.summaryPlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <SummaryIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.personalInfo.socialLinks')}
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.website}
                  {...register('website')}
                  placeholder="https://yourwebsite.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WebsiteIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={translations.linkedin}
                  {...register('linkedin')}
                  placeholder="https://linkedin.com/in/yourprofile"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedInIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={translations.github}
                  {...register('github')}
                  placeholder="https://github.com/yourusername"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHubIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          )}
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          {onPrev && (
            <Button
              variant="outlined"
              onClick={onPrev}
              size="large"
            >
              {t('common.previous')}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isDataLoading}
            size="large"
            sx={{ ml: 'auto' }}
          >
            {loading ? t('common.submitting') : t('common.next')}
          </Button>
        </Box>
      </form>
    );
  }
);

PersonalInfoForm.displayName = 'PersonalInfoForm';

export default PersonalInfoForm; 