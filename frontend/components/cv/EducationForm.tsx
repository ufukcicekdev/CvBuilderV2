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
import axiosInstance from '../../utils/axios';

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
  onPrev: () => void;
  onStepComplete: (data: any) => void;
}

interface EducationFormData {
  education: EducationItem[];
}

export default function EducationForm({ cvId, onPrev, onStepComplete }: EducationFormProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    school_name: '',
    degree: '',
    field_of_study: '',
    education_start_date: '',
    education_end_date: ''
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      education: [{
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
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
        const response = await axiosInstance.get(`/cvs/${cvId}`);
        if (response.data.education && response.data.education.length > 0) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedEducation = response.data.education.map(edu => ({
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            startDate: edu.start_date || '',  // Tarih formatını düzelt
            endDate: edu.end_date || '',      // Tarih formatını düzelt
            current: edu.is_current || false,
            description: edu.description || ''
          }));
          
          console.log('Formatted education for form:', formattedEducation); // Debug için
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
  }, [cvId, setValue]);

  const onSubmit = async (data: EducationFormData) => {
    try {
      setLoading(true);
      
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

      await onStepComplete(formattedData);
      
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
                  {...register(`education.${index}.school` as const, { required: true })}
                  error={!!errors.education?.[index]?.school}
                  helperText={errors.education?.[index]?.school && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.education.degree')}
                  {...register(`education.${index}.degree` as const, { required: true })}
                  error={!!errors.education?.[index]?.degree}
                  helperText={errors.education?.[index]?.degree && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.education.field')}
                  {...register(`education.${index}.field` as const, { required: true })}
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
                  {...register(`education.${index}.startDate` as const, { required: true })}
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

            {fields.length > 1 && (
              <IconButton 
                onClick={() => remove(index)}
                color="error"
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
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

    </form>
  );
} 