import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
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

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
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
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  useEffect(() => {
    const loadExperience = async () => {
      try {
        const response = await cvAPI.getOne(Number(cvId));
        // console.log('Loaded CV data:', response.data); // Debug için
        
        if (response.data.experience) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedExperience = response.data.experience.map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.start_date,
            endDate: exp.end_date || '',
            current: exp.is_current,
            description: exp.description || ''
          }));
          
          // console.log('Formatted experience for form:', formattedExperience); // Debug için
          setValue('experience', formattedExperience);
        }
      } catch (error) {
        console.error('Error loading experience data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadExperience();
    }
  }, [cvId, setValue, t]);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('cv.experience.title')}
        </Typography>
        
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.experience.company')}
                  {...register(`experience.${index}.company` as const)}
                  error={!!errors.experience?.[index]?.company}
                  helperText={errors.experience?.[index]?.company && t('common.required')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.experience.position')}
                  {...register(`experience.${index}.position` as const)}
                  error={!!errors.experience?.[index]?.position}
                  helperText={errors.experience?.[index]?.position && t('common.required')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv.experience.startDate')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`experience.${index}.startDate` as const)}
                  error={!!errors.experience?.[index]?.startDate}
                  helperText={errors.experience?.[index]?.startDate && t('common.required')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv.experience.endDate')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`experience.${index}.endDate` as const)}
                  disabled={watchFieldArray[index]?.current}
                  error={!watchFieldArray[index]?.current && !!errors.experience?.[index]?.endDate}
                  helperText={!watchFieldArray[index]?.current && errors.experience?.[index]?.endDate && t('common.required')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register(`experience.${index}.current` as const)}
                      onChange={(e) => handleCurrentChange(index, e.target.checked)}
                    />
                  }
                  label={t('cv.experience.current')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('cv.experience.description')}
                  {...register(`experience.${index}.description` as const)}
                />
              </Grid>
            </Grid>

            <IconButton 
              onClick={() => remove(index)}
              color="error"
              sx={{ mt: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
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
          {t('common.add')}
        </Button>
      </Box>

      {/* Form butonları */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        {onPrev && (
          <Button
            onClick={onPrev}
            variant="contained"
            disabled={loading}
          >
            {t('common.previous')}
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {t('common.next')}
        </Button>
      </Box>
    </form>
  );
};

export default ExperienceForm; 