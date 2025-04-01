import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Grid, 
  Paper,
  Alert,
  Snackbar,
  AlertColor,
  Divider,
  TextField
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import templateService from '../../../services/templateService';
import { CustomTemplateData } from '../../../components/pdf-templates/CustomTemplateRenderer';
import Layout from '../../../components/layout/Layout';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

const TemplateEditPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  
  const [template, setTemplate] = useState<CustomTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    severity: AlertColor
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const fetchTemplate = useCallback(async (templateId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getCustomTemplate(templateId);
      setTemplate(data);
      setTemplateName(data.name);
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
  
  const handleSave = async () => {
    if (!template || !user) return;
    
    try {
      setSaving(true);
      
      // Şablonu güncelle
      const updatedTemplate = {
        ...template,
        name: templateName.trim(),
      };
      
      await templateService.updateCustomTemplate(template.id, updatedTemplate);
      
      showNotification(t('cv.template.saveSuccess'), 'success');
    } catch (err: any) {
      console.error('Şablon kaydedilirken hata oluştu:', err);
      showNotification(err.message || t('cv.template.error.saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!template || !user) return;
    
    try {
      await templateService.deleteCustomTemplate(template.id);
      
      // Şablonlar sayfasına yönlendir
      router.push('/templates');
      
      showNotification(t('cv.template.deleteSuccess'), 'success');
    } catch (err: any) {
      console.error('Şablon silinirken hata oluştu:', err);
      showNotification(err.message || t('cv.template.error.deleteFailed'), 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
  const handleBack = () => {
    router.push(`/templates/view/${id}`);
  };
  
  const showNotification = (message: string, severity: AlertColor) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  if (loading) {
    return (
      <Layout title={t('cv.template.editTitle')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title={t('cv.template.editTitle')}>
        <Box sx={{ mt: 3, mb: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => router.push('/templates')}
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
      <Layout title={t('cv.template.editTitle')}>
        <Box sx={{ mt: 3, mb: 3 }}>
          <Alert severity="warning">{t('cv.template.notFound')}</Alert>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => router.push('/templates')}
            sx={{ mt: 2 }}
          >
            {t('common.back')}
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title={`${t('cv.template.edit')}: ${template.name}`}>
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
              {t('cv.template.edit')}: {template.name}
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleteDialog(true)}
              sx={{ mr: 2 }}
            >
              {t('common.delete')}
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || !templateName.trim() || templateName === template.name}
            >
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('cv.template.generalSettings')}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('cv.template.name')}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {t('cv.template.editor')}
              </Typography>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, minHeight: 400 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {t('cv.template.editorComingSoon')}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Silme onayı için diyalog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title={t('cv.template.deleteConfirmTitle')}
        message={t('cv.template.deleteConfirmMessage', { name: template.name })}
        confirmButtonText={t('common.delete')}
        cancelButtonText={t('common.cancel')}
        confirmButtonColor="error"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
      
      {/* Bildirim */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default TemplateEditPage; 