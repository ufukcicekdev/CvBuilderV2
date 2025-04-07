import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Business as BusinessIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { showToast } from '../../utils/toast';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';

interface ExperienceFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any[];
}

interface ExperienceFormData {
  experience: ExperienceItem[];
}

interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

const ExperienceForm = ({ cvId, onPrev, onStepComplete, initialData }: ExperienceFormProps) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const initialLoadDone = useRef(false);
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ExperienceFormData>({
    defaultValues: {
      experience: []
    }
  });

  const { fields, append, remove } = useFieldArray<ExperienceFormData>({
    control,
    name: "experience"
  });

  const watchFieldArray = watch("experience");
  const watchCurrentFields = watchFieldArray?.map(item => item?.current) || [];
  
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  // İlk veri yüklemesi sadece bir kez gerçekleşsin
  useEffect(() => {
    // Eğer daha önce veri yüklendiyse, tekrar yüklemiyoruz
    if (initialLoadDone.current) return;
    
    const loadExperience = async () => {
      try {
        // console.log('İlk veri yükleniyor...');
        const response = await cvAPI.getOne(Number(cvId));
        
        if (response.data.experience && response.data.experience.length > 0) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedExperience = response.data.experience.map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.start_date,
            endDate: exp.end_date || '',
            current: exp.is_current,
            description: exp.description || ''
          }));
          
          // Form alanlarını sıfırla ve mevcut verileri doldur
          reset({ experience: formattedExperience });
        }
        
        // İlk yükleme tamamlandı olarak işaretliyoruz
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading experience data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadExperience();
    }
  }, [cvId, reset, t]); // router.locale bağımlılığını çıkardık

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      setLoading(true);

      // Deneyim verilerini düzenle
      const formattedData = {
        experience: data.experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          start_date: exp.startDate,
          end_date: exp.current ? null : exp.endDate,
          is_current: exp.current,
          description: exp.description || ''
        }))
      };

      // Parent component'e bildir
      await onStepComplete({
        ...formattedData,
        language: router.locale
      });
      
    } catch (error) {
      console.error('Error saving experience:', error);
      showToast.error(t('cv.saveError'));
    } finally {
      setLoading(false);
    }
  };

  // Current seçildiğinde endDate'i temizle
  const handleCurrentChange = (index: number, checked: boolean) => {
    if (checked) {
      setValue(`experience.${index}.endDate`, '');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="experienceForm">
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" color="primary.main">
            {t('cv.experience.title')}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          {t('cv.experience.subtitle')}
        </Typography>
        
        {fields.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('cv.experience.noExperience')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => append({
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
              })}
            >
              {t('cv.experience.addMore')}
            </Button>
          </Box>
        )}
        
        {fields.map((field, index) => (
          <Paper 
            key={field.id} 
            elevation={1} 
            sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 2, 
              position: 'relative',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 3
              }
            }}
          >
            <Tooltip title={t('common.delete')} placement="top">
              <IconButton 
                onClick={() => remove(index)}
                color="error"
                sx={{ position: 'absolute', top: 10, right: 10 }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              {t('cv.experience.experienceItem')} #{index + 1}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.experience.company')}
                  {...register(`experience.${index}.company` as const, { required: true })}
                  error={!!errors.experience?.[index]?.company}
                  helperText={errors.experience?.[index]?.company && t('common.required')}
                  placeholder={t('cv.experience.companyPlaceholder')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.experience.position')}
                  {...register(`experience.${index}.position` as const, { required: true })}
                  error={!!errors.experience?.[index]?.position}
                  helperText={errors.experience?.[index]?.position && t('common.required')}
                  placeholder={t('cv.experience.positionPlaceholder')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv.experience.startDate')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`experience.${index}.startDate` as const, { required: true })}
                  error={!!errors.experience?.[index]?.startDate}
                  helperText={errors.experience?.[index]?.startDate && t('common.required')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register(`experience.${index}.current` as const)}
                        checked={watchCurrentFields[index] || false}
                        onChange={(e) => handleCurrentChange(index, e.target.checked)}
                      />
                    }
                    label={t('cv.experience.current')}
                    sx={{ mb: 1 }}
                  />
                  
                  {!watchCurrentFields[index] && (
                    <TextField
                      fullWidth
                      type="date"
                      label={t('cv.experience.endDate')}
                      InputLabelProps={{ shrink: true }}
                      {...register(`experience.${index}.endDate` as const, { 
                        required: !watchCurrentFields[index] 
                      })}
                      error={!watchCurrentFields[index] && !!errors.experience?.[index]?.endDate}
                      helperText={!watchCurrentFields[index] && errors.experience?.[index]?.endDate && t('common.required')}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('cv.experience.description')}
                  {...register(`experience.${index}.description` as const)}
                  placeholder={t('cv.experience.descriptionPlaceholder')}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        {fields.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => append({
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            sx={{ mt: 2 }}
          >
            {t('cv.experience.addMore')}
          </Button>
        )}
      </Paper>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onPrev}
          size="large"
        >
          {t('common.previous')}
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading}
          size="large"
        >
          {loading ? t('common.submitting') : t('common.next')}
        </Button>
      </Box>
    </form>
  );
};

export default ExperienceForm;