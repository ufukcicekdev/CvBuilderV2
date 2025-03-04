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

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
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
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  useEffect(() => {
    const loadEducation = async () => {
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.education) {
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
          
          // console.log('Formatted education for form:', formattedEducation); // Debug için
          setValue('education', formattedEducation);
        }
      } catch (error) {
        console.error('Error loading education data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadEducation();
    }
  }, [cvId, setValue, t]);

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('cv.education.title')}
        </Typography>
        
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('cv.education.school')}
                  {...register(`education.${index}.school` as const)}
                  error={!!errors.education?.[index]?.school}
                  helperText={errors.education?.[index]?.school && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.education.degree')}
                  {...register(`education.${index}.degree` as const)}
                  error={!!errors.education?.[index]?.degree}
                  helperText={errors.education?.[index]?.degree && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.education.field')}
                  {...register(`education.${index}.field` as const)}
                  error={!!errors.education?.[index]?.field}
                  helperText={errors.education?.[index]?.field && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv.education.startDate')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`education.${index}.startDate` as const)}
                  error={!!errors.education?.[index]?.startDate}
                  helperText={errors.education?.[index]?.startDate && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv.education.endDate')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`education.${index}.endDate` as const)}
                  disabled={watchFieldArray[index]?.current}
                  error={!watchFieldArray[index]?.current && !!errors.education?.[index]?.endDate}
                  helperText={!watchFieldArray[index]?.current && errors.education?.[index]?.endDate && t('common.required')}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register(`education.${index}.current` as const)}
                      onChange={(e) => handleCurrentChange(index, e.target.checked)}
                    />
                  }
                  label={t('cv.education.current')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('cv.education.description')}
                  {...register(`education.${index}.description` as const)}
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
          {t('common.add')}
        </Button>
      </Box>

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

export default EducationForm; 