import { useRouter } from 'next/router';
import { Container, Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '../components/Layout';
import Image from 'next/image';

export default function Custom404() {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <Layout>
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            py: 8,
          }}
        >
          <Image
            src="/404.svg"
            alt="404"
            width={300}
            height={300}
            priority
          />
          <Typography variant="h1" component="h1" sx={{ mb: 2, fontSize: { xs: '3rem', md: '4rem' } }}>
            404
          </Typography>
          <Typography variant="h4" component="h2" sx={{ mb: 4 }}>
            {t('errors.404.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            {t('errors.404.description')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/')}
          >
            {t('errors.backToHome')}
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}; 