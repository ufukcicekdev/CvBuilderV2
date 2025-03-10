import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  useMediaQuery,
  MobileStepper,
  CircularProgress,
  Backdrop,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import CertificatesForm from './CertificatesForm';
import VideoForm from './VideoForm';
import TemplatePreviewForm from './TemplatePreviewForm';
import { cvAPI, CV } from '../../services/api';
import { toast } from 'react-hot-toast';

interface CVFormContentProps {
  activeStep: number;
  cvId: number;
  onStepChange: (step: number) => void;
}

export default function CVFormContent({ activeStep, cvId, onStepChange }: CVFormContentProps) {
  const { t } = useTranslation('common');
  const [cvData, setCvData] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const steps = useMemo(() => [
    t('cv.steps.personalInfo'),
    t('cv.steps.experience'),
    t('cv.steps.education'),
    t('cv.steps.skills'),
    t('cv.steps.languages'),
    t('cv.steps.certificates'),
    'Video',
    'Template'
  ], [t]);

  const fetchCVData = useCallback(async () => {
    try {
      const response = await cvAPI.getOne(cvId);
      setCvData(response.data);
    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast.error(t('cv.loadError'));
    }
  }, [cvId, t]);

  useEffect(() => {
    fetchCVData();
  }, [fetchCVData]);

  // Dil değişikliğini dinle
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguage') {
        fetchCVData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchCVData]);

  const handleStepComplete = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      await cvAPI.update(cvId, {
        ...data,
        current_step: activeStep
      });

      onStepChange(activeStep + 1);
      toast.success(t('cv.saveSuccess'));
    } catch (error) {
      console.error('Error saving form data:', error);
      toast.error(t('cv.saveError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeStep, cvId, onStepChange, t]);

  const renderStepContent = useCallback(() => {
    if (!cvData) return null;

    switch (activeStep) {
      case 0:
        return (
          <PersonalInfoForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={activeStep > 0 ? () => onStepChange(activeStep - 1) : undefined}
          />
        );
      case 1:
        return (
          <ExperienceForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.experience}
          />
        );
      case 2:
        return (
          <EducationForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.education}
          />
        );
      case 3:
        return (
          <SkillsForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.skills}
          />
        );
      case 4:
        return (
          <LanguagesForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.languages}
          />
        );
      case 5:
        return (
          <CertificatesForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.certificates}
          />
        );
      case 6:
        return (
          <VideoForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={{
              video_url: cvData.video_url || null,
              video_description: cvData.video_description || null
            }}
          />
        );
      case 7:
        return (
          <TemplatePreviewForm
            cvId={String(cvId)}
            onPrev={() => onStepChange(activeStep - 1)}
            onStepComplete={handleStepComplete}
            initialData={cvData}
          />
        );
      default:
        return null;
    }
  }, [activeStep, cvData, cvId, handleStepComplete, onStepChange]);

  const renderStepper = useCallback(() => {
    if (isMobile) {
      return (
        <Box sx={{ width: '100%', mb: 2 }}>
          <MobileStepper
            variant="dots"
            steps={steps.length}
            position="static"
            activeStep={activeStep}
            sx={{
              backgroundColor: 'background.default',
              flexGrow: 1,
              '& .MuiMobileStepper-dot': {
                width: 8,
                height: 8,
                mx: 0.5
              },
              '& .MuiMobileStepper-dotActive': {
                backgroundColor: 'primary.main'
              }
            }}
            nextButton={<Box />}
            backButton={<Box />}
          />
          <Box sx={{ textAlign: 'center', mt: 1, color: 'text.secondary' }}>
            {steps[activeStep]}
          </Box>
        </Box>
      );
    }

    return (
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{
          '& .MuiStepLabel-root': {
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  }, [activeStep, isMobile, steps]);

  return (
    <Box sx={{ width: '100%' }}>
      {renderStepper()}
      <Box sx={{ mt: 4 }}>
        {renderStepContent()}
      </Box>
      
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">{t('common.loading')}</Typography>
      </Backdrop>
    </Box>
  );
} 