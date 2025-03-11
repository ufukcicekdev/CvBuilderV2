import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  Rating,
  FormHelperText,
  Paper,
  Divider,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { showToast } from '../../utils/toast';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';

interface SkillsFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any[];
}

interface SkillItem {
  name: string;
  level: number;
  description?: string;
}

interface SkillsFormData {
  skills: SkillItem[];
}

const SkillsForm = ({ cvId, onPrev, onStepComplete, initialData }: SkillsFormProps) => {
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
  } = useForm<SkillsFormData>({
    defaultValues: {
      skills: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills"
  });

  const watchFieldArray = watch("skills");
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  // Verileri yükle
  useEffect(() => {
    // Eğer daha önce veri yüklendiyse, tekrar yüklemiyoruz
    if (initialLoadDone.current) return;
    
    const loadSkills = async () => {
      setIsDataLoading(true);
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.skills && response.data.skills.length > 0) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedSkills = response.data.skills.map(skill => ({
            name: skill.name,
            level: skill.level || 3,
            description: skill.description || ''
          }));
          
          reset({ skills: formattedSkills });
        }
        // İlk yükleme tamamlandı olarak işaretliyoruz
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading skills data:', error);
        showToast.error(t('cv.loadError'));
      } finally {
        setIsDataLoading(false);
      }
    };

    if (cvId) {
      loadSkills();
    } else {
      setIsDataLoading(false);
      initialLoadDone.current = true;
    }
  }, [cvId, setValue, reset, t]); // router.locale bağımlılığını çıkardık

  const onSubmit = async (data: SkillsFormData) => {
    try {
      setLoading(true);
      
      // Veriyi formatlayalım
      const formattedData = {
        skills: data.skills.map(skill => ({
          name: skill.name,
          level: skill.level,
          description: skill.description || ''
        }))
      };

      // Parent component'e bildir
      await onStepComplete({
        ...formattedData,
        language: router.locale
      });
      
    } catch (error) {
      console.error('Error saving skills:', error);
      showToast.error(t('cv.saveError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Seviye seçenekleri için yardımcı fonksiyon
  const getLevelText = (level: number): string => {
    switch(level) {
      case 1:
      case 2:
        return t('cv.skills.beginner');
      case 3:
        return t('cv.skills.intermediate');
      case 4:
        return t('cv.skills.advanced');
      case 5:
        return t('cv.skills.expert');
      default:
        return t('cv.skills.intermediate');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="skillsForm">
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" color="primary.main">
            {t('cv.skills.title')}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          {t('cv.skills.subtitle')}
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
                  {t('cv.skills.noSkills')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => append({
                    name: '',
                    level: 3,
                    description: ''
                  })}
                >
                  {t('cv.skills.addMore')}
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
                  {t('cv.skills.skillItem')} #{index + 1}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('cv.skills.name')}
                      {...register(`skills.${index}.name` as const, { required: true })}
                      error={!!errors.skills?.[index]?.name}
                      helperText={errors.skills?.[index]?.name && t('common.required')}
                      placeholder={t('cv.skills.namePlaceholder')}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography component="legend" gutterBottom>
                        {t('cv.skills.level')} - {getLevelText(watchFieldArray[index]?.level || 3)}
                      </Typography>
                      <Controller
                        name={`skills.${index}.level`}
                        control={control}
                        defaultValue={3}
                        render={({ field }) => (
                          <Rating
                            {...field}
                            onChange={(_, newValue) => {
                              field.onChange(newValue || 3);
                            }}
                            size="large"
                            sx={{ mb: 1 }}
                          />
                        )}
                      />
                      <FormHelperText>{t('cv.skills.levelPlaceholder')}</FormHelperText>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label={t('cv.skills.description')}
                      {...register(`skills.${index}.description` as const)}
                      placeholder={t('cv.skills.descriptionPlaceholder')}
                      helperText={t('cv.skills.descriptionHelper')}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({
                name: '',
                level: 3,
                description: ''
              })}
              sx={{ mt: 2 }}
            >
              {t('cv.skills.addMore')}
            </Button>
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

export default SkillsForm; 