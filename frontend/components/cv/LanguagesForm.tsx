import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  MenuItem,
  FormHelperText,
  Paper,
  Divider,
  Tooltip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  level: string;
  certificate?: string;
}

interface LanguagesFormData {
  languages: LanguageItem[];
}

// Dil seviye seçenekleri
const LANGUAGE_LEVELS = [
  'A1', 'A2',  // Temel
  'B1', 'B2',  // Orta
  'C1', 'C2'   // İleri
];

const LanguagesForm = ({ cvId, onPrev, onStepComplete, initialData }: LanguagesFormProps) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
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
  } = useForm<LanguagesFormData>({
    defaultValues: {
      languages: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages"
  });

  const watchFieldArray = watch("languages");
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  useEffect(() => {
    // Eğer daha önce veri yüklendiyse, tekrar yüklemiyoruz
    if (initialLoadDone.current) return;
    
    const loadLanguages = async () => {
      setIsDataLoading(true);
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.languages && response.data.languages.length > 0) {
          const formattedLanguages = response.data.languages.map(lang => ({
            name: lang.name,
            level: lang.level,
            certificate: lang.certificate || ''
          }));
          
          reset({ languages: formattedLanguages });
        }
        // İlk yükleme tamamlandı olarak işaretliyoruz
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading languages data:', error);
        showToast.error(t('cv.loadError'));
      } finally {
        setIsDataLoading(false);
      }
    };

    if (cvId) {
      loadLanguages();
    } else {
      setIsDataLoading(false);
      initialLoadDone.current = true;
    }
  }, [cvId, setValue, reset, t]); // router.locale bağımlılığını çıkardık

  const onSubmit = async (data: LanguagesFormData) => {
    try {
      setLoading(true);
      
      const formattedData = {
        languages: data.languages.map(lang => ({
          name: lang.name,
          level: lang.level,
          certificate: lang.certificate || ''
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

  // Dil seviyesi için yardımcı fonksiyon
  const getLevelDescription = (level: string): string => {
    const levelDescriptions: Record<string, string> = {
      'A1': t('cv.languages.a1'),
      'A2': t('cv.languages.a2'),
      'B1': t('cv.languages.b1'),
      'B2': t('cv.languages.b2'),
      'C1': t('cv.languages.c1'),
      'C2': t('cv.languages.c2')
    };
    return levelDescriptions[level] || '';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="languagesForm">
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" color="primary.main">
            {t('cv.languages.title')}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          {t('cv.languages.subtitle')}
        </Typography>
        
        {isDataLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <>
            {fields.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {t('cv.languages.noLanguages')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => append({
                    name: '',
                    level: 'B1',
                    certificate: ''
                  })}
                >
                  {t('cv.languages.addMore')}
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
                  {t('cv.languages.languageItem')} #{index + 1}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('cv.languages.name')}
                      {...register(`languages.${index}.name` as const, { required: true })}
                      error={!!errors.languages?.[index]?.name}
                      helperText={errors.languages?.[index]?.name && t('common.required')}
                      placeholder={t('cv.languages.namePlaceholder')}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`language-level-label-${index}`}>
                        {t('cv.languages.level')}
                      </InputLabel>
                      <Controller
                        name={`languages.${index}.level`}
                        control={control}
                        defaultValue="B1"
                        render={({ field }) => (
                          <Select
                            {...field}
                            label={t('cv.languages.level')}
                            labelId={`language-level-label-${index}`}
                            error={!!errors.languages?.[index]?.level}
                          >
                            {LANGUAGE_LEVELS.map(level => (
                              <MenuItem key={level} value={level}>
                                {level} - {getLevelDescription(level)}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                      {errors.languages?.[index]?.level && (
                        <FormHelperText error>{t('common.required')}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('cv.languages.certificate')}
                      {...register(`languages.${index}.certificate` as const)}
                      placeholder={t('cv.languages.certificatePlaceholder')}
                      helperText={t('cv.languages.certificateHelper')}
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
                  name: '',
                  level: 'B1',
                  certificate: ''
                })}
                sx={{ mt: 2 }}
              >
                {t('cv.languages.addMore')}
              </Button>
            )}
          </>
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
          disabled={loading || isDataLoading}
          size="large"
        >
          {loading ? t('common.submitting') : t('common.next')}
        </Button>
      </Box>
    </form>
  );
};

export default LanguagesForm;