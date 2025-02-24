import { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import LanguagesForm from './LanguagesForm';
import CertificatesForm from './CertificatesForm';
import axiosInstance from '../../utils/axios';

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
  current_step: number;
}

export default function CVFormContent({ activeStep, cvId, onStepChange }: CVFormContentProps) {
  const { t } = useTranslation('common');
  const [isStepValid, setIsStepValid] = useState(true);
  const [cvData, setCvData] = useState<CVData | null>(null);

  const totalSteps = 6;

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

  const handleNext = () => {
    if (isStepValid && activeStep < totalSteps - 1) {
      onStepChange(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      onStepChange(activeStep - 1);
    }
  };

  const renderStepContent = () => {
    if (!cvData) return null;

    switch (activeStep) {
      case 0:
        return (
          <PersonalInfoForm 
            cvId={String(cvId)} 
            onValidationChange={setIsStepValid}
            initialData={cvData.personal_info}
          />
        );
      case 1:
        return (
          <ExperienceForm 
            cvId={String(cvId)} 
            onValidationChange={setIsStepValid}
            initialData={cvData.experience}
          />
        );
      case 2:
        return (
          <EducationForm 
            cvId={String(cvId)} 
            onValidationChange={setIsStepValid}
            initialData={cvData.education}
          />
        );
      case 3:
        return (
          <SkillsForm 
            cvId={String(cvId)} 
            onValidationChange={setIsStepValid}
            initialData={cvData.skills}
          />
        );
      case 4:
        return (
          <LanguagesForm 
            cvId={String(cvId)} 
            onValidationChange={setIsStepValid}
            initialData={cvData.languages}
          />
        );
      case 5:
        return (
          <CertificatesForm 
            cvId={String(cvId)} 
            onValidationChange={setIsStepValid}
            initialData={cvData.certificates}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderStepContent()}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="contained"
        >
          {t('navigation.previous')}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isStepValid || activeStep === totalSteps - 1}
          variant="contained"
          color="primary"
        >
          {t('navigation.next')}
        </Button>
      </Box>
    </>
  );
} 