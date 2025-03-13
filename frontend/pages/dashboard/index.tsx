import { useState, useEffect, useCallback } from 'react';
import { withAuth } from '../../components/withAuth';
import Layout from '../../components/Layout';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import NextLink from 'next/link';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';
import { showToast } from '../../utils/toast';

// steps array'ini create-cv.tsx ile aynı şekilde tanımlayalım
const steps = ['personalInfo', 'experience', 'education', 'skills', 'languages', 'certificates'];

interface CV {
  id: number;
  title:string;
  personal_info: any;
  status: 'draft' | 'completed';
  current_step: number;
  updated_at: string;
}

function Dashboard() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);

  const fetchCVs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cvAPI.getAll();
      // console.log('CV Response:', response.data);
      setCvs(response.data as CV[]);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Dil değişikliğini izle (router ve özel event için)
  useEffect(() => {
    fetchCVs();

    // Dil değişikliklerini dinle
    const handleLanguageChange = () => {
      fetchCVs();
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, [router.locale, fetchCVs]);

  const handleDeleteClick = (cvId: number) => {
    setSelectedCvId(cvId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCvId) {
      try {
        await cvAPI.delete(selectedCvId);
        showToast.success(t('cv.deleteSuccess'));
        fetchCVs(); // Listeyi yenile
      } catch (error) {
        console.error('Error deleting CV:', error);
        showToast.error(t('cv.deleteError'));
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleContinueCV = (cv: CV) => {
    // CV'nin kaldığı adıma yönlendir
    router.push(`/dashboard/create-cv?id=${cv.id}&step=${cv.current_step}`);
  };

  const getStepLabel = (currentStep: number) => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return t('cv.steps.completed');
    }
    return t(`cv.steps.${steps[currentStep]}`);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Üst Başlık ve CV Oluştur Butonu */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                {t('nav.dashboard')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={NextLink}
                href="/dashboard/create-cv"
              >
                {t('dashboard.createNew')}
              </Button>
            </Box>
          </Grid>

          {/* CVs List */}
          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography>{t('common.loading')}</Typography>
              </Box>
            </Grid>
          ) : cvs.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  {t('cv.noCVs')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={Link}
                  href="/dashboard/create-cv"
                  sx={{ mt: 2 }}
                >
                  {t('cv.createFirst')}
                </Button>
              </Paper>
            </Grid>
          ) : (
            cvs.map((cv) => (
              <Grid item xs={12} md={6} key={cv.id}>
                <Paper sx={{ p: 3, position: 'relative' }}>
                  <IconButton
                    onClick={() => handleDeleteClick(cv.id)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {cv?.title || t('cv.untitled')}
                    </Typography>
                    <Chip
                      label={cv.status === 'draft' ? t('cv.draft') : t('cv.completed')}
                      color={cv.status === 'draft' ? 'warning' : 'success'}
                    />
                  </Box>

                  <Typography color="textSecondary" gutterBottom>
                    {t('cv.lastUpdated')}: {new Date(cv.updated_at).toLocaleDateString()}
                  </Typography>

                  <Typography color="textSecondary" gutterBottom>
                    {t('cv.currentStep')}: {getStepLabel(cv.current_step)}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleContinueCV(cv)}
                    sx={{ mt: 2 }}
                  >
                    {cv.status === 'draft' ? t('cv.continue') : t('cv.edit')}
                  </Button>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>

        {/* Silme Onay Dialog'u */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('cv.deleteConfirmTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('cv.deleteConfirmMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
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

export default withAuth(Dashboard); 