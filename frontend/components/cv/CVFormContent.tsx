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
  Typography,
  Alert,
  Stack
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
import Link from 'next/link';

interface CVFormContentProps {
  activeStep: number;
  cvId: number;
  onStepChange: (step: number) => void;
  isReadOnly?: boolean;
}

export default function CVFormContent({ activeStep, cvId, onStepChange, isReadOnly = false }: CVFormContentProps) {
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
      // Eğer salt okunur modda ise, düzenlemeye izin verme
      if (isReadOnly) {
        toast.error(t('cv.editNotAllowed'));
        
        // Görüntüleme modunda da adımlar arası geçişe izin ver
        if (activeStep < steps.length - 1) {
          onStepChange(activeStep + 1);
        }
        return;
      }

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
  }, [activeStep, cvId, onStepChange, t, isReadOnly, steps.length]);

  const renderStepContent = useCallback(() => {
    if (!cvData) return null;

    // Form içeriğini oluştur
    let formContent;
    switch (activeStep) {
      case 0:
        formContent = (
          <PersonalInfoForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={activeStep > 0 ? () => onStepChange(activeStep - 1) : undefined}
          />
        );
        break;
      case 1:
        formContent = (
          <ExperienceForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.experience}
          />
        );
        break;
      case 2:
        formContent = (
          <EducationForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.education}
          />
        );
        break;
      case 3:
        formContent = (
          <SkillsForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.skills}
          />
        );
        break;
      case 4:
        formContent = (
          <LanguagesForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.languages}
          />
        );
        break;
      case 5:
        formContent = (
          <CertificatesForm 
            cvId={String(cvId)} 
            onStepComplete={handleStepComplete}
            onPrev={() => onStepChange(activeStep - 1)}
            initialData={cvData.certificates}
          />
        );
        break;
      case 6:
        formContent = (
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
        break;
      case 7:
        formContent = (
          <TemplatePreviewForm
            cvId={String(cvId)}
            onPrev={() => onStepChange(activeStep - 1)}
            onStepComplete={handleStepComplete}
            initialData={cvData}
          />
        );
        break;
      default:
        return null;
    }

    // Eğer salt okunur modda ise ve Template Preview sayfasında değilse
    if (isReadOnly && activeStep !== 7) {
      return (
        <Stack spacing={2}>
          {/* Uyarı mesajı */}
          <Alert 
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                component={Link} 
                href="/pricing"
              >
                {t('pricing.upgradeNow')}
              </Button>
            }
          >
            {t('cv.editDisabled')}
          </Alert>
          
          {/* Form içeriği (salt okunur) */}
          <Box sx={{ 
            opacity: 0.8,
            '& input, & textarea, & select': { 
              pointerEvents: 'none !important',
              backgroundColor: '#f9f9f9 !important'
            },
            '& .MuiOutlinedInput-root, & .MuiTextField-root, & .MuiSelect-select, & .MuiAutocomplete-root, & .MuiCheckbox-root, & .MuiRadio-root': {
              pointerEvents: 'none !important'
            },
            '& button, & .MuiButton-root, & .MuiIconButton-root': {
              display: 'none !important'
            },
            '& .custom-nav-button': {
              display: 'inline-flex !important'
            }
          }}>
            {formContent}
          </Box>
          
          {/* Sadece bizim gezinme butonlarımız */}
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            borderTop: '1px solid #eee',
            pt: 2
          }}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={() => onStepChange(activeStep - 1)}
                className="custom-nav-button"
              >
                {t('common.previous')}
              </Button>
            )}
            
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => onStepChange(activeStep + 1)}
                sx={{ ml: 'auto' }}
                className="custom-nav-button"
              >
                {t('common.next')}
              </Button>
            )}
          </Box>
        </Stack>
      );
    }

    return formContent;
  }, [activeStep, cvData, cvId, handleStepComplete, onStepChange, isReadOnly, t, steps.length]);

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