import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  Rating,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { showToast } from '../../utils/toast';
import axiosInstance from '../../utils/axios';

interface LanguagesFormProps {
  cvId: string;
  onPrev: () => void;
  onStepComplete: (data: any) => void;
}

interface LanguageItem {
  name: string;
  level: string;
  certificate?: string;
}

interface LanguagesFormData {
  languages: LanguageItem[];
}

const LANGUAGE_LEVELS = [
  'A1', 'A2',  // Temel
  'B1', 'B2',  // Orta
  'C1', 'C2'   // İleri
];

export default function LanguagesForm({ cvId, onPrev, onStepComplete }: LanguagesFormProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LanguagesFormData>({
    defaultValues: {
      languages: [{
        name: '',
        level: 'B1',
        certificate: ''
      }]
    }
  });

  // Verileri yükle
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await axiosInstance.get(`/cvs/${cvId}/`);
        if (response.data.languages && response.data.languages.length > 0) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedLanguages = response.data.languages.map(lang => ({
            name: lang.name,
            level: lang.level || 'B1',  // Eğer level yoksa default B1
            certificate: lang.certificate || ''
          }));
          
          console.log('Formatted languages for form:', formattedLanguages);
          setValue('languages', formattedLanguages);
        }
      } catch (error) {
        console.error('Error loading languages data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadLanguages();
    }
  }, [cvId, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages"
  });

  const onSubmit = async (data: LanguagesFormData) => {
    try {
      setLoading(true);
      
      // Veriyi formatlayalım
      const formattedData = {
        languages: data.languages.map(lang => ({
          name: lang.name,
          level: lang.level,
          certificate: lang.certificate || ''
        }))
      };

      // Parent component'e bildir
      await onStepComplete(formattedData);
      
    } catch (error) {
      console.error('Error saving languages:', error);
      showToast.error(t('cv.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" gutterBottom>
        {t('cv.languages.title')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {t('cv.languages.subtitle')}
      </Typography>

      {fields.map((field, index) => (
        <Box key={field.id} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('cv.languages.name')}
                {...register(`languages.${index}.name` as const, { required: true })}
                error={!!errors.languages?.[index]?.name}
                helperText={errors.languages?.[index]?.name && t('common.required')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label={t('cv.languages.level')}
                defaultValue="B1"
                {...register(`languages.${index}.level` as const, { required: true })}
                error={!!errors.languages?.[index]?.level}
                helperText={errors.languages?.[index]?.level && t('common.required')}
              >
                {LANGUAGE_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level} - {t(`cv.languages.levels.${level.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('cv.languages.certificate')}
                {...register(`languages.${index}.certificate` as const)}
                helperText={t('cv.languages.certificateHelper')}
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
        type="button"
        startIcon={<AddIcon />}
        onClick={() => append({
          name: '',
          level: 'B1',
          certificate: ''
        })}
        sx={{ mb: 2 }}
      >
        {t('cv.languages.addMore')}
      </Button>

    </form>
  );
} 