import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  AlertColor,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import templateService from '../../services/templateService';
import { CustomTemplateData } from '../pdf-templates/CustomTemplateRenderer';
import { ConfirmDialog } from '../ui/ConfirmDialog';

/**
 * TemplateManager - Özel şablonların listelenmesi, oluşturulması, düzenlenmesi ve silinmesi
 * 
 * Bu bileşen şablon yönetimi için tam bir arayüz sunar:
 * - Şablonları listeler
 * - Yeni şablon oluşturur
 * - Şablonları düzenler
 * - Şablonları siler
 * - Şablonları kopyalar
 */
const TemplateManager: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  
  // State tanımlamaları
  const [templates, setTemplates] = useState<CustomTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplateData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    severity: AlertColor
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Kullanıcının şablonlarını yükle
  useEffect(() => {
    fetchTemplates();
  }, [user]);
  
  // Şablonları getir
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getCustomTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Şablonları getirirken hata oluştu:', err);
      setError(t('cv.template.error.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  // Şablonu sil
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await templateService.deleteCustomTemplate(selectedTemplate.id);
      
      // Şablonları yenile
      await fetchTemplates();
      
      // Kullanıcıya bildirim göster
      showNotification(t('cv.template.deleteSuccess'), 'success');
    } catch (err) {
      console.error('Şablon silinirken hata oluştu:', err);
      showNotification(t('cv.template.error.deleteFailed'), 'error');
    } finally {
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    }
  };
  
  // Şablonu yeniden adlandır
  const handleRenameTemplate = async () => {
    if (!selectedTemplate || !newName.trim()) return;
    
    try {
      // Şablonu güncellemek için önceki verileri kullan, sadece adı değiştir
      const updatedTemplate = {
        ...selectedTemplate,
        name: newName.trim()
      };
      
      await templateService.updateCustomTemplate(
        selectedTemplate.id,
        updatedTemplate
      );
      
      // Şablonları yenile
      await fetchTemplates();
      
      // Kullanıcıya bildirim göster
      showNotification(t('cv.template.renameSuccess'), 'success');
    } catch (err) {
      console.error('Şablon yeniden adlandırılırken hata oluştu:', err);
      showNotification(t('cv.template.error.renameFailed'), 'error');
    } finally {
      setShowRenameDialog(false);
      setSelectedTemplate(null);
      setNewName('');
    }
  };
  
  // Şablonu kopyala
  const handleDuplicateTemplate = async (template: CustomTemplateData) => {
    try {
      // Şablonun kopyasını oluştur, ID olmadan yeni olarak kaydedilecek
      const { id, ...templateCopy } = template;
      
      const duplicatedTemplate = {
        ...templateCopy,
        name: `${template.name} ${t('cv.template.copyLabel')}`
      };
      
      await templateService.saveCustomTemplate(duplicatedTemplate);
      
      // Şablonları yenile
      await fetchTemplates();
      
      // Kullanıcıya bildirim göster
      showNotification(t('cv.template.duplicateSuccess'), 'success');
    } catch (err) {
      console.error('Şablon kopyalanırken hata oluştu:', err);
      showNotification(t('cv.template.error.duplicateFailed'), 'error');
    }
  };
  
  // Yeni şablon oluştur
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    
    try {
      // Varsayılan bir şablon yapısı oluştur
      const newTemplate = {
        name: newTemplateName.trim(),
        template_data: {
          sections: [],
          globalSettings: {
            layout: 'single',
            fontFamily: 'Arial',
            fontSize: 12,
            primaryColor: '#1976d2',
            secondaryColor: '#f5f5f5',
            textColor: '#333333'
          }
        }
      };
      
      await templateService.saveCustomTemplate(newTemplate);
      
      // Şablonları yenile
      await fetchTemplates();
      
      // Kullanıcıya bildirim göster
      showNotification(t('cv.template.createSuccess'), 'success');
    } catch (err) {
      console.error('Şablon oluşturulurken hata oluştu:', err);
      showNotification(t('cv.template.error.createFailed'), 'error');
    } finally {
      setShowCreateDialog(false);
      setNewTemplateName('');
    }
  };
  
  // Şablonu görüntüle
  const handleViewTemplate = (templateId: string) => {
    router.push(`/templates/view/${templateId}`);
  };
  
  // Şablonu düzenle
  const handleEditTemplate = (templateId: string) => {
    router.push(`/templates/edit/${templateId}`);
  };
  
  // Bildirim göster
  const showNotification = (message: string, severity: AlertColor) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Bildirim kapat
  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          {t('cv.template.myTemplates')}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => {
            setShowCreateDialog(true);
            setNewTemplateName('');
          }}
        >
          {t('cv.template.createNew')}
        </Button>
      </Box>
      
      {/* Hata mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Yükleniyor göstergesi */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : templates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t('cv.template.noTemplates')}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => {
              setShowCreateDialog(true);
              setNewTemplateName('');
            }}
            sx={{ mt: 2 }}
          >
            {t('cv.template.createFirst')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {templates.map(template => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.lastModified')}: {new Date(template.updatedAt).toLocaleDateString()}
                  </Typography>
                  
                  {/* Şablon özellikleri */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>{t('cv.template.layout')}:</strong> {template.globalSettings?.layout || 'single'}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Tooltip title={t('cv.template.view')}>
                    <IconButton 
                      size="small"
                      onClick={() => handleViewTemplate(template.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('cv.template.edit')}>
                    <IconButton 
                      size="small"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('cv.template.duplicate')}>
                    <IconButton 
                      size="small"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <DuplicateIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('cv.template.rename')}>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setNewName(template.name);
                        setShowRenameDialog(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('cv.template.delete')}>
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Silme onayı için diyalog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title={t('cv.template.deleteConfirmTitle')}
        message={t('cv.template.deleteConfirmMessage', { name: selectedTemplate?.name })}
        confirmButtonText={t('common.delete')}
        cancelButtonText={t('common.cancel')}
        confirmButtonColor="error"
        onConfirm={handleDeleteTemplate}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedTemplate(null);
        }}
      />
      
      {/* Yeniden adlandırma için diyalog */}
      <Dialog 
        open={showRenameDialog} 
        onClose={() => {
          setShowRenameDialog(false);
          setSelectedTemplate(null);
          setNewName('');
        }}
      >
        <DialogTitle>{t('cv.template.rename')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('cv.template.name')}
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowRenameDialog(false);
            setSelectedTemplate(null);
            setNewName('');
          }}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleRenameTemplate} 
            variant="contained"
            disabled={!newName.trim() || newName === selectedTemplate?.name}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Yeni şablon oluşturma için diyalog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => {
          setShowCreateDialog(false);
          setNewTemplateName('');
        }}
      >
        <DialogTitle>{t('cv.template.createNew')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('cv.template.createDescription')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t('cv.template.name')}
            type="text"
            fullWidth
            variant="outlined"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCreateDialog(false);
            setNewTemplateName('');
          }}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCreateTemplate} 
            variant="contained"
            color="primary"
            disabled={!newTemplateName.trim()}
          >
            {t('cv.template.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </Box>
  );
};

export default TemplateManager; 