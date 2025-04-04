import { useState } from 'react';
import Layout from '../components/Layout';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
  CircularProgress,
  Divider
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useForm } from 'react-hook-form';
import axiosInstance from '../services/axios';
import { showToast } from '../utils/toast';
import SEO from '../components/SEO';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    try {
      setLoading(true);
      await axiosInstance.post('/api/contact/', data);
      showToast.success(t('contact.successMessage'));
      reset(); // Formu temizle
    } catch (error) {
      console.error('Contact form error:', error);
      showToast.error(t('contact.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO 
        title={t('contact.seo.title', 'Contact Us')}
        description={t('contact.seo.description', 'Get in touch with the CV Builder team. We\'re here to help with any questions about our resume building services.')}
        keywords={t('contact.seo.keywords', 'contact, support, help, questions, cv builder')}
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {t('contact.title')}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            {t('contact.description')}
          </Typography>

          <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LocationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {t('footer.address')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                CV Builder Headquarters<br />
                Emek Mahallesi<br />
                Fatih Caddesi Ihlamur Sokak No:1<br />
                34785 Sancaktepe/İstanbul<br />
                Türkiye
              </Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
            
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PhoneIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {t('footer.phone')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                +90 (549) 517 06 19<br />
        
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4 }}>
            <TextField
              fullWidth
              label={t('contact.name')}
              {...register('name', { required: true })}
              error={!!errors.name}
              helperText={errors.name && t('common.required')}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('contact.email')}
              type="email"
              {...register('email', {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
              })}
              error={!!errors.email}
              helperText={errors.email && t('common.invalidEmail')}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label={t('contact.subject')}
              {...register('subject', { required: true })}
              error={!!errors.subject}
              helperText={errors.subject && t('common.required')}
              sx={{ mb: 2 }}
              defaultValue=""
            >
              {Object.keys(t('contact.subjects', { returnObjects: true })).map((key) => (
                <MenuItem key={key} value={key}>
                  {t(`contact.subjects.${key}`)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('contact.message')}
              {...register('message', { required: true })}
              error={!!errors.message}
              helperText={errors.message && t('common.required')}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('contact.send')
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 