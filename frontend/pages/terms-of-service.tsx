import { Container, Typography, Box, Paper } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function TermsOfService() {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <Head>
        <title>{t('terms.pageTitle')}</title>
        <meta name="description" content={t('terms.pageDescription')} />
      </Head>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 6 } }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('terms.title')}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {t('terms.lastUpdated')}: {t('terms.lastUpdatedDate')}
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="body1" paragraph>
              {t('terms.introduction')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.acceptance.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.acceptance.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.accountRegistration.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.accountRegistration.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('terms.accountRegistration.accurate')}</li>
              <li>{t('terms.accountRegistration.oneAccount')}</li>
              <li>{t('terms.accountRegistration.security')}</li>
              <li>{t('terms.accountRegistration.prohibited')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.userContent.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.userContent.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('terms.userContent.ownership')}</li>
              <li>{t('terms.userContent.license')}</li>
              <li>{t('terms.userContent.prohibited')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.subscriptions.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.subscriptions.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('terms.subscriptions.payment')}</li>
              <li>{t('terms.subscriptions.renewal')}</li>
              <li>{t('terms.subscriptions.cancellation')}</li>
              <li>{t('terms.subscriptions.refunds')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.intellectualProperty.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.intellectualProperty.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.prohibition.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.prohibition.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('terms.prohibition.illegal')}</li>
              <li>{t('terms.prohibition.harmful')}</li>
              <li>{t('terms.prohibition.impersonation')}</li>
              <li>{t('terms.prohibition.data')}</li>
              <li>{t('terms.prohibition.interference')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.termination.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.termination.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.disclaimer.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.disclaimer.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.limitation.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.limitation.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.indemnification.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.indemnification.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.governing.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.governing.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.changes.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.changes.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('terms.contact.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.contact.description')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('terms.contact.email')}: info@cvbuilder.dev
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'tr', ['common'])),
    },
  };
}; 