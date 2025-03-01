import { useState } from 'react';
import { withAuth } from '../../components/withAuth';
import Layout from '../../components/Layout';
import { Container, Paper } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import CreateCVForm from '../../components/cv/CreateCVForm';
import CVFormContent from '../../components/cv/CVFormContent';

function CreateCV() {
  const router = useRouter();
  const { id, step } = router.query;
  const [activeStep, setActiveStep] = useState(Number(step) || 0);

  const handleCVCreated = (newCvId: number) => {
    router.push({
      pathname: '/dashboard/create-cv',
      query: { id: newCvId, step: 0 }
    }, undefined, { locale: router.locale });
  };

  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    router.push({
      pathname: '/dashboard/create-cv',
      query: { id, step: newStep }
    }, undefined, { locale: router.locale });
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          {!id ? (
            <CreateCVForm onSuccess={handleCVCreated} />
          ) : (
            <CVFormContent
              activeStep={activeStep}
              cvId={Number(id)}
              onStepChange={handleStepChange}
            />
          )}
        </Paper>
      </Container>
    </Layout>
  );
}

export default withAuth(CreateCV);