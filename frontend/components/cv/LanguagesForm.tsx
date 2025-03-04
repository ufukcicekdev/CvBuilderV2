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
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';

interface LanguagesFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any[];
}

interface LanguageItem {
  name: string;
  level: number;
}

interface LanguagesFormData {
  languages: LanguageItem[];
}

const LANGUAGE_LEVELS = [
  'A1', 'A2',  // Temel
  'B1', 'B2',  // Orta
  'C1', 'C2'   // İleri
];

const LanguagesForm = ({ cvId, onPrev, onStepComplete, initialData }: LanguagesFormProps) => {
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
  } = useForm<LanguagesFormData>({
    defaultValues: {
      languages: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages"
  });

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.languages && response.data.languages.length > 0) {
          const formattedLanguages = response.data.languages.map(lang => ({
            name: lang.name,
            level: lang.level
          }));
          
          // console.log('Formatted languages for form:', formattedLanguages);
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
  }, [cvId, setValue, t]);

  const onSubmit = async (data: LanguagesFormData) => {
    try {
      setLoading(true);
      
      const formattedData = {
        languages: data.languages.map(lang => ({
          name: lang.name,
          level: lang.level
        }))
      };

      await onStepComplete({
        ...formattedData,
        language: router.locale
      });
      
    } catch (error) {
      console.error('Error saving languages:', error);
      showToast.error(t('cv.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="languagesForm">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('cv.languages.title')}
        </Typography>

        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.languages.name')}
                  {...register(`languages.${index}.name` as const)}
                  error={!!errors.languages?.[index]?.name}
                  helperText={errors.languages?.[index]?.name && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography component="legend" gutterBottom>
                    {t('cv.languages.level')}
                  </Typography>
                  <Rating
                    name={`languages.${index}.level`}
                    value={watch(`languages.${index}.level`)}
                    onChange={(_, newValue) => {
                      setValue(`languages.${index}.level`, newValue || 0);
                    }}
                  />
                </Box>
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
            name: '',
            level: 3
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

export default LanguagesForm; 