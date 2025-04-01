import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress, 
  Grid, 
  Divider,
  Paper,
  Alert
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import templateService from '../../../services/templateService';
import { CustomTemplateData } from '../../../components/pdf-templates/CustomTemplateRenderer';
import Layout from '../../../components/layout/Layout';

const TemplateViewPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  
  const [template, setTemplate] = useState<CustomTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTemplate = useCallback(async (templateId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getCustomTemplate(templateId);
      setTemplate(data);
    } catch (err: any) {
      console.error('Şablon getirilirken hata oluştu:', err);
      setError(err.message || t('cv.template.error.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  useEffect(() => {
    if (id && typeof id === 'string' && user) {
      fetchTemplate(id);
    }
  }, [id, user, fetchTemplate]);
  
  const handleEdit = () => {
    if (template) {
      router.push(`/templates/edit/${template.id}`);
    }
  };
  
  const handleBack = () => {
    router.push('/templates');
  };
  
  if (loading) {
    return (
      <Layout title={t('cv.template.viewTitle')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title={t('cv.template.viewTitle')}>
        <Box sx={{ mt: 3, mb: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            startIcon={<BackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Layout>
    );
  }
  
  if (!template) {
    return (
      <Layout title={t('cv.template.viewTitle')}>
        <Box sx={{ mt: 3, mb: 3 }}>
          <Alert severity="warning">{t('cv.template.notFound')}</Alert>
          <Button 
            startIcon={<BackIcon />} 
            onClick={handleBack}
            sx={{ mt: 2 }}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${t('cv.template.view')}: ${template.name}`}>
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<BackIcon />} 
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              {t('common.back')}
            </Button>
            <Typography variant="h5" component="h1">
              {template.name}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            {t('cv.template.edit')}
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('cv.template.details')}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>{t('cv.template.created')}:</strong> {new Date(template.createdAt).toLocaleDateString()}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>{t('cv.template.lastModified')}:</strong> {new Date(template.updatedAt).toLocaleDateString()}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>{t('cv.template.layout')}:</strong> {template.globalSettings?.layout || 'single'}
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  <strong>{t('cv.template.primaryColor')}:</strong> {template.globalSettings?.primaryColor || '#1976d2'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('cv.template.preview')}
              </Typography>
              
              <Box sx={{ mt: 3, bgcolor: 'background.default', p: 2, borderRadius: 1, minHeight: 400 }}>
                {/* Şablon önizlemesi burada gösterilecek */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">
                    {t('cv.template.previewNotAvailable')}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default TemplateViewPage; 