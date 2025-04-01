import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  DialogContentText,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  ContentCopy as DuplicateIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  DesignServices as TemplateIcon,
  Palette as ColorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import templateService from '../services/templateService';
import { CustomTemplateData } from '../components/pdf-templates/CustomTemplateRenderer';

/**
 * Onay diyaloğu bileşeni
 */
const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  confirmButtonColor = 'primary',
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelButtonText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={confirmButtonColor}
          variant="contained"
          autoFocus
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
const TemplateManager = () => {
  const { t } = useTranslation();
  // Basitleştirmek için kullanıcı ID'sini mock ediyoruz
  const userId = "current-user-id";
  
  // State tanımlamaları
  const [templates, setTemplates] = useState<CustomTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplateData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    layout: 'single',
    primaryColor: '#3f51b5',
    secondaryColor: '#f50057'
  });
  const [newTemplateErrors, setNewTemplateErrors] = useState({
    name: false,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'warning' | 'error'
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Kullanıcının şablonlarını yükle
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Şablonları getir
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getCustomTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Şablonları getirirken hata oluştu:', err);
      setError(t('common.errors.errorOccurred'));
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
      // Hata mesajını doğrudan err objesinden alıyoruz varsa
      const errorMessage = err instanceof Error ? err.message : t('common.errors.errorOccurred');
      showNotification(errorMessage, 'error');
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
      // Hata mesajını doğrudan err objesinden alıyoruz varsa
      const errorMessage = err instanceof Error ? err.message : t('common.errors.errorOccurred');
      showNotification(errorMessage, 'error');
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
      // Hata mesajını doğrudan err objesinden alıyoruz varsa
      const errorMessage = err instanceof Error ? err.message : t('common.errors.errorOccurred');
      showNotification(errorMessage, 'error');
    }
  };
  
  // Yeni şablon oluştur
  const handleCreateTemplate = async () => {
    // Validasyon
    if (!newTemplateData.name.trim()) {
      setNewTemplateErrors({ ...newTemplateErrors, name: true });
      return;
    }
    
    setIsSaving(true);
    try {
      const newTemplate = {
        name: newTemplateData.name.trim(),
        globalSettings: {
          layout: newTemplateData.layout,
          colors: {
            primary: newTemplateData.primaryColor,
            secondary: newTemplateData.secondaryColor
          }
        },
        sections: []
      };
      
      await templateService.saveCustomTemplate(newTemplate);
      
      // Formu sıfırla
      setNewTemplateData({
        name: '',
        layout: 'single',
        primaryColor: '#3f51b5',
        secondaryColor: '#f50057'
      });
      
      // Dialog'u kapat
      setShowCreateDialog(false);
      
      // Şablonları yenile
      await fetchTemplates();
      
      // Kullanıcıya bildirim göster
      showNotification(t('cv.template.createSuccess'), 'success');
    } catch (err) {
      console.error('Şablon oluşturulurken hata oluştu:', err);
      const errorMessage = err instanceof Error ? err.message : t('common.errors.errorOccurred');
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Şablon görüntüle
  const handleViewTemplate = (template: CustomTemplateData) => {
    if (!template) return;
    window.location.href = `/templates/view/${template.id}`;
  };
  
  // Şablonu düzenle
  const handleEditTemplate = (template: CustomTemplateData) => {
    if (!template) return;
    window.location.href = `/templates/edit/${template.id}`;
  };
  
  // Bildirim göster
  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Bildirimi kapat
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };
  
  // Yeni şablon bilgilerini güncelle - Text inputlar için
  const handleNewTemplateChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewTemplateData({
      ...newTemplateData,
      [name]: value
    });
    
    // Doğrulama hatalarını temizle
    if (name === 'name' && value.trim() !== '') {
      setNewTemplateErrors(prev => ({ ...prev, name: false }));
    }
  };
  
  // Select input değişikliklerini yönet
  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setNewTemplateData({
      ...newTemplateData,
      [name]: value
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
          onClick={() => setShowCreateDialog(true)}
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
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
          <TemplateIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('cv.template.noTemplates')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('cv.template.createFirstDescription')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            size="large"
          >
            {t('cv.template.createFirst')}
          </Button>
        </Paper>
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
                    
                    {/* Şablonun renklerini gösteren renkli çippler */}
                    <Box sx={{ mt: 1 }}>
                      <strong>{t('cv.template.colors')}:</strong>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: template.globalSettings?.primaryColor || '#3f51b5',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: template.globalSettings?.secondaryColor || '#f50057',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Tooltip title={t('cv.template.view')}>
                    <IconButton 
                      size="small"
                      onClick={() => handleViewTemplate(template)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={t('cv.template.edit')}>
                    <IconButton 
                      size="small"
                      onClick={() => handleEditTemplate(template)}
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
      
      {/* Yeni şablon oluşturma diyaloğu */}
      <Dialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setNewTemplateData({
            name: '',
            layout: 'single',
            primaryColor: '#3f51b5',
            secondaryColor: '#f50057'
          });
          setNewTemplateErrors({ name: false });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('cv.template.createNew')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="normal"
              id="name"
              name="name"
              label={t('cv.template.name')}
              fullWidth
              variant="outlined"
              value={newTemplateData.name}
              onChange={handleNewTemplateChange}
              error={newTemplateErrors.name}
              helperText={newTemplateErrors.name ? t('common.required') : ''}
              disabled={isSaving}
            />
            
            <FormControl fullWidth margin="normal" disabled={isSaving}>
              <InputLabel id="layout-label">{t('cv.template.layout')}</InputLabel>
              <Select
                labelId="layout-label"
                id="layout"
                name="layout"
                value={newTemplateData.layout}
                label={t('cv.template.layout')}
                onChange={handleSelectChange}
              >
                <MenuItem value="single">{t('cv.template.layouts.single')}</MenuItem>
                <MenuItem value="double">{t('cv.template.layouts.double')}</MenuItem>
                <MenuItem value="sidebar">{t('cv.template.layouts.sidebar')}</MenuItem>
              </Select>
              <FormHelperText>{t('cv.template.layoutHelperText')}</FormHelperText>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <FormControl fullWidth margin="normal" disabled={isSaving}>
                <InputLabel id="primary-color-label">{t('cv.template.primaryColor')}</InputLabel>
                <TextField
                  id="primaryColor"
                  name="primaryColor"
                  label={t('cv.template.primaryColor')}
                  type="color"
                  fullWidth
                  variant="outlined"
                  value={newTemplateData.primaryColor}
                  onChange={handleNewTemplateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
              
              <FormControl fullWidth margin="normal" disabled={isSaving}>
                <InputLabel id="secondary-color-label">{t('cv.template.secondaryColor')}</InputLabel>
                <TextField
                  id="secondaryColor"
                  name="secondaryColor"
                  label={t('cv.template.secondaryColor')}
                  type="color"
                  fullWidth
                  variant="outlined"
                  value={newTemplateData.secondaryColor}
                  onChange={handleNewTemplateChange}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowCreateDialog(false);
              setNewTemplateData({
                name: '',
                layout: 'single',
                primaryColor: '#3f51b5',
                secondaryColor: '#f50057'
              });
              setNewTemplateErrors({ name: false });
            }}
            disabled={isSaving}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleCreateTemplate} 
            variant="contained"
            color="primary"
            disabled={isSaving || !newTemplateData.name.trim()}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSaving ? t('common.saving') : t('common.save')}
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