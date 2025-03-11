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
import { Delete as DeleteIcon, Add as AddIcon, School as SchoolIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { showToast } from '../../utils/toast';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';

interface EducationItem {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface EducationFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any[];
}

interface EducationFormData {
  education: EducationItem[];
}

const EducationForm = ({ cvId, onPrev, onStepComplete, initialData }: EducationFormProps) => {
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
  } = useForm<EducationFormData>({
    defaultValues: {
      education: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education"
  });

  const watchFieldArray = watch("education");
  const watchCurrentFields = watchFieldArray?.map(item => item?.current) || [];
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  useEffect(() => {
    // Eğer daha önce veri yüklendiyse, tekrar yüklemiyoruz
    if (initialLoadDone.current) return;
    
    const loadEducation = async () => {
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.education && response.data.education.length > 0) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedEducation = response.data.education.map(edu => ({
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            startDate: edu.start_date,
            endDate: edu.end_date || '',
            current: edu.is_current,
            description: edu.description || ''
          }));
          
          reset({ education: formattedEducation });
        }
        // İlk yükleme tamamlandı olarak işaretliyoruz
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading education data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadEducation();
    }
  }, [cvId, setValue, reset, t]); // router.locale bağımlılığını çıkardık

  const onSubmit = async (data: EducationFormData) => {
    try {
      setLoading(true);

      // Eğitim verilerini düzenle
      const formattedData = {
        education: data.education.map(edu => ({
          school: edu.school,
          degree: edu.degree,
          field: edu.field,
          start_date: edu.startDate,
          end_date: edu.current ? null : edu.endDate,
          is_current: edu.current,
          description: edu.description || ''
        }))
      };

      // Parent component'e bildir
      await onStepComplete({
        ...formattedData,
        language: router.locale
      });
      
    } catch (error) {
      console.error('Error saving education:', error);
      showToast.error(t('cv.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentChange = (index: number, checked: boolean) => {
    if (checked) {
      setValue(`education.${index}.endDate`, '');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="educationForm">
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" color="primary.main">
            {t('cv.education.title')}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          {t('cv.education.subtitle')}
        </Typography>
        
        {fields.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('cv.education.noEducation')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => append({
                school: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
              })}
            >
              {t('cv.education.addMore')}
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
              {t('cv.education.educationItem')} #{index + 1}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('cv.education.school')}
                  {...register(`education.${index}.school` as const, { required: true })}
                  error={!!errors.education?.[index]?.school}
                  helperText={errors.education?.[index]?.school && t('common.required')}
                  placeholder={t('cv.education.schoolPlaceholder')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.education.degree')}
                  {...register(`education.${index}.degree` as const, { required: true })}
                  error={!!errors.education?.[index]?.degree}
                  helperText={errors.education?.[index]?.degree && t('common.required')}
                  placeholder={t('cv.education.degreePlaceholder')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.education.field')}
                  {...register(`education.${index}.field` as const, { required: true })}
                  error={!!errors.education?.[index]?.field}
                  helperText={errors.education?.[index]?.field && t('common.required')}
                  placeholder={t('cv.education.fieldPlaceholder')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv.education.startDate')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`education.${index}.startDate` as const, { required: true })}
                  error={!!errors.education?.[index]?.startDate}
                  helperText={errors.education?.[index]?.startDate && t('common.required')}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register(`education.${index}.current` as const)}
                        checked={watchCurrentFields[index] || false}
                        onChange={(e) => handleCurrentChange(index, e.target.checked)}
                      />
                    }
                    label={t('cv.education.current')}
                    sx={{ mb: 1 }}
                  />
                  
                  {!watchCurrentFields[index] && (
                    <TextField
                      fullWidth
                      type="date"
                      label={t('cv.education.endDate')}
                      InputLabelProps={{ shrink: true }}
                      {...register(`education.${index}.endDate` as const, { 
                        required: !watchCurrentFields[index] 
                      })}
                      error={!watchCurrentFields[index] && !!errors.education?.[index]?.endDate}
                      helperText={!watchCurrentFields[index] && errors.education?.[index]?.endDate && t('common.required')}
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
                  label={t('cv.education.description')}
                  {...register(`education.${index}.description` as const)}
                  placeholder={t('cv.education.descriptionPlaceholder')}
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
              school: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            sx={{ mt: 2 }}
          >
            {t('cv.education.addMore')}
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

export default EducationForm; 