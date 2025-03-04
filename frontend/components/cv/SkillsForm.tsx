import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Grid,
  Rating,
  FormHelperText
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
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
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
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
    const loadSkills = async () => {
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.skills && response.data.skills.length > 0) {
          // Backend'den gelen veriyi form yapısına dönüştür
          const formattedSkills = response.data.skills.map(skill => ({
            name: skill.name,
            level: skill.level,
            description: skill.description || ''
          }));
          
          // console.log('Formatted skills for form:', formattedSkills); // Debug için
          setValue('skills', formattedSkills);
        }
      } catch (error) {
        console.error('Error loading skills data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadSkills();
    }
  }, [cvId, setValue, t]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="skillsForm">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('cv.skills.title')}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {t('cv.skills.subtitle')}
        </Typography>

        {controlledFields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 4, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv.skills.name')}
                  {...register(`skills.${index}.name` as const)}
                  error={!!errors.skills?.[index]?.name}
                  helperText={errors.skills?.[index]?.name && t('common.required')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography component="legend" gutterBottom>
                    {t('cv.skills.level')}
                  </Typography>
                  <Rating
                    name={`skills.${index}.level`}
                    value={watchFieldArray[index]?.level || 0}
                    onChange={(_, newValue) => {
                      setValue(`skills.${index}.level`, newValue || 0);
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={t('cv.skills.description')}
                  {...register(`skills.${index}.description` as const)}
                  helperText={t('cv.skills.descriptionHelper')}
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
            name: '',
            level: 3,
            description: ''
          })}
          sx={{ mt: 2 }}
        >
          {t('cv.skills.addMore')}
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

export default SkillsForm; 