import { useState, useEffect } from 'react';
import { withAuth } from '../../components/withAuth';
import Layout from '../../components/Layout';
import { Container, Paper } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import CreateCVForm from '../../components/cv/CreateCVForm';
import CVFormContent from '../../components/cv/CVFormContent';
import { GetServerSideProps } from 'next';

function CreateCV() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { id, step } = router.query;
  const [activeStep, setActiveStep] = useState(0);

  // URL parametrelerini izle ve değiştiğinde state'i güncelle
  useEffect(() => {
    if (router.isReady) {
      // URL'de step parametresi varsa ve geçerli bir sayı ise, activeStep'i güncelle
      if (step && !isNaN(Number(step))) {
        setActiveStep(Number(step));
      }
    }
  }, [router.isReady, step]);

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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'tr', ['common', 'cv'])),
    },
  };
};

export default withAuth(CreateCV);