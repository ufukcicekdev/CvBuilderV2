import { useState, useEffect } from 'react';
import { 
  Box, 
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  useMediaQuery,
  MobileStepper 
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
import axiosInstance from '../../utils/axios';
import { toast } from 'react-hot-toast';

interface CVFormContentProps {
  activeStep: number;
  cvId: number;
  onStepChange: (step: number) => void;
}

interface CVData {
  personal_info: any;
  experience: any[];
  education: any[];
  skills: any[];
  languages: any[];
  certificates: any[];
  video_url: string;
  video_description: string;
  current_step: number;
}

export default function CVFormContent({ activeStep, cvId, onStepChange }: CVFormContentProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isStepValid, setIsStepValid] = useState(true);
  const [cvData, setCvData] = useState<CVData | null>(null);

  const totalSteps = 8;

  const steps = [
    t('cv.steps.personalInfo'),
    t('cv.steps.experience'),
    t('cv.steps.education'),
    t('cv.steps.skills'),
    t('cv.steps.languages'),
    t('cv.steps.certificates'),
    t('cv.steps.video'),
    t('cv.steps.template')
  ];

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await axiosInstance.get(`/api/cvs/${cvId}/`);
        setCvData(response.data);
      } catch (error) {
        console.error('Error fetching CV data:', error);
      }
    };

    fetchCVData();
  }, [cvId]);

  const handleStepComplete = async (data: any) => {
    try {
      // Form verilerini ve current step'i güncelle
      await axiosInstance.patch(`/cvs/${cvId}/`, {
        ...data,
        current_step: activeStep  // Şu anki adımı gönder, bir sonraki değil
      });

      // Başarılı kayıt sonrası bir sonraki adıma geç
      onStepChange(activeStep + 1);
    } catch (error) {
      console.error('Error saving form data:', error);
      toast.error('Veriler kaydedilirken bir hata oluştu');
    }
  };

  const renderStepContent = () => {
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
              video_url: cvData.video_url,
              video_description: cvData.video_description
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
  };

  const renderStepper = () => {
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
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          backgroundColor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {renderStepper()}
      </Paper>

      {renderStepContent()}
    </Box>
  );
} 