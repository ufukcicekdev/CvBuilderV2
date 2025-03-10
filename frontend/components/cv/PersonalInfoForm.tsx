import { useForm } from 'react-hook-form';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { showToast } from '../../utils/toast';
import { 
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon
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
    const [formData, setFormData] = useState({
      full_name: '',
      email: '',
      phone: '',
      address: ''
    });

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
        showToast.error('Kişisel bilgiler yüklenirken bir hata oluştu');
      }
    }, [cvId, setValue]);

    useEffect(() => {
      if (cvId) {
        fetchPersonalInfo();
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
        showToast.error('Kişisel bilgiler kaydedilirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleFormSubmit(onSubmit)} id="personalInfoForm">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('cv.personalInfo.title')}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('cv.personalInfo.fullName')}
                {...register('fullName', { required: true })}
                error={!!errors.fullName}
                helperText={errors.fullName && t('common.required')}
                InputLabelProps={{ shrink: true }}
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
                helperText={errors.email && t('common.invalidEmail')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('cv.personalInfo.phone')}
                {...register('phone', { required: true })}
                error={!!errors.phone}
                helperText={errors.phone && t('common.required')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('cv.personalInfo.location')}
                {...register('location', { required: true })}
                error={!!errors.location}
                helperText={errors.location && t('common.required')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('cv.personalInfo.summary')}
                {...register('summary')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={translations.website}
                {...register('website')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebsiteIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={translations.linkedin}
                {...register('linkedin')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={translations.github}
                {...register('github')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GitHubIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Form butonları */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Box>
              {onPrev && (
                <Button
                  onClick={onPrev}
                  variant="contained"
                  disabled={loading || isLoading}
                >
                  {t('common.previous')}
                </Button>
              )}
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || isLoading}
            >
              {(loading || isLoading) ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('common.next')
              )}
            </Button>
          </Box>
        </Box>
      </form>
    );
  }
);

PersonalInfoForm.displayName = 'PersonalInfoForm';

export default PersonalInfoForm; 