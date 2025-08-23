import { Container, Typography, Box, Paper } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function PrivacyPolicy() {
  const { t } = useTranslation('common');

  return (
    <Layout>
      <Head>
        <title>{t('privacy.pageTitle')}</title>
        <meta name="description" content={t('privacy.pageDescription')} />
      </Head>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 6 } }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {t('privacy.title')}
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {t('privacy.lastUpdated')}: {t('privacy.lastUpdatedDate')}
          </Typography>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="body1" paragraph>
              {t('privacy.introduction')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.dataCollection.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.dataCollection.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('privacy.dataCollection.personalInfo')}</li>
              <li>{t('privacy.dataCollection.profileInfo')}</li>
              <li>{t('privacy.dataCollection.resumeData')}</li>
              <li>{t('privacy.dataCollection.usageInfo')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.dataUsage.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.dataUsage.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('privacy.dataUsage.providingService')}</li>
              <li>{t('privacy.dataUsage.improving')}</li>
              <li>{t('privacy.dataUsage.personalizing')}</li>
              <li>{t('privacy.dataUsage.communications')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.dataSharing.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.dataSharing.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('privacy.dataSharing.serviceProviders')}</li>
              <li>{t('privacy.dataSharing.legal')}</li>
              <li>{t('privacy.dataSharing.business')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.dataSecurity.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.dataSecurity.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.dataRetention.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.dataRetention.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.userRights.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.userRights.description')}
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>{t('privacy.userRights.access')}</li>
              <li>{t('privacy.userRights.correction')}</li>
              <li>{t('privacy.userRights.deletion')}</li>
              <li>{t('privacy.userRights.objection')}</li>
              <li>{t('privacy.userRights.withdrawal')}</li>
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.cookies.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.cookies.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.thirdParty.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.thirdParty.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.children.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.children.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.changes.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.changes.description')}
            </Typography>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>
              {t('privacy.contact.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.contact.description')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('privacy.contact.email')}: info@cvbuilder.dev
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