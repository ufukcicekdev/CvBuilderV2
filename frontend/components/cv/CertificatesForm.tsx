import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
  Grid,
  Paper,
  Input,
  Dialog,
  CardMedia,
  Divider,
  Tooltip,
  FormHelperText,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Upload as UploadIcon, 
  Visibility as VisibilityIcon,
  WorkspacePremium as CertificateIcon
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { showToast } from '../../utils/toast';
import { cvAPI } from '../../services/api';
import { useRouter } from 'next/router';

interface CertificatesFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any[];
}

interface CertificateData {
  id?: number;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  document?: File;
  documentUrl?: string;
  document_type?: string;
  credentialId?: string;
}

interface CertificatesFormData {
  certificates: CertificateData[];
}

const CertificatesForm = ({ cvId, onPrev, onStepComplete, initialData }: CertificatesFormProps) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const router = useRouter();
  const initialLoadDone = useRef(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<CertificatesFormData>({
    defaultValues: {
      certificates: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certificates'
  });

  const handleFileChange = (index: number) => async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showToast.error(t('cv.certificates.uploadError'));
        return;
      }
      
      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast.error(t('cv.certificates.uploadError'));
        return;
      }

      try {
        setUploadLoading(index);
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload the file
        const response = await cvAPI.uploadCertificate(Number(cvId), formData);
        
        // Store the document URL and update form data
        if (response.data.certificates?.length > 0) {
          const latestCertificate = response.data.certificates[response.data.certificates.length - 1];
          const documentUrl = latestCertificate.document_url;
          
          // Update form values for the current index
          setValue(`certificates.${index}.documentUrl`, documentUrl);
          setValue(`certificates.${index}.document_type`, latestCertificate.document_type);
          
          // Show preview immediately after upload
          setPreviewUrl(documentUrl);
          setOpenPreview(true);
        }
        showToast.success(t('cv.certificates.uploadSuccess'));
      } catch (error) {
        console.error('Error uploading file:', error);
        showToast.error(t('cv.certificates.uploadError'));
      } finally {
        setUploadLoading(null);
      }
    }
  };

  const handlePreview = (index: number) => {
    const certificate = watch(`certificates.${index}`);
    if (certificate.documentUrl) {
      setPreviewUrl(certificate.documentUrl);
      setOpenPreview(true);
    }
  };

  useEffect(() => {
    // Eğer daha önce veri yüklendiyse, tekrar yüklemiyoruz
    if (initialLoadDone.current) return;
    
    const loadCertificates = async () => {
      setIsDataLoading(true);
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.certificates && response.data.certificates.length > 0) {
          const formattedCertificates = response.data.certificates.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date,
            description: cert.description || '',
            documentUrl: cert.document_url || '',
            document_type: cert.document_type || '',
            credentialId: cert.credentialId || ''
          }));
          
          reset({ certificates: formattedCertificates });
        }
        // İlk yükleme tamamlandı olarak işaretliyoruz
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading certificates data:', error);
        showToast.error(t('cv.loadError'));
      } finally {
        setIsDataLoading(false);
      }
    };

    if (cvId) {
      loadCertificates();
    } else {
      setIsDataLoading(false);
      initialLoadDone.current = true;
    }
  }, [cvId, setValue, reset, t]); // router.locale bağımlılığını çıkardık

  const onSubmit = async (data: CertificatesFormData) => {
    try {
      setLoading(true);
      
      // Parent component'e bildir
      await onStepComplete({ 
        certificates: data.certificates,
        language: router.locale 
      });
      
    } catch (error) {
      console.error('Error saving certificates:', error);
      showToast.error(t('cv.errors.validationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const certificate = watch(`certificates.${index}`) as CertificateData;
      if (certificate.id) {
        // Önce sertifikayı sil
        await cvAPI.deleteCertificate(Number(cvId), certificate.id);
        
        // Formdan sertifikayı kaldır
        remove(index);
        
        // Parent component'e güncel sertifika listesini bildir
        const remainingCertificates = watch('certificates').filter((_, i) => i !== index);
        await onStepComplete({ 
          certificates: remainingCertificates,
          language: router.locale 
        });
        
        showToast.success(t('common.success'));
      } else {
        // Eğer sertifikanın ID'si yoksa sadece formdan kaldır
        remove(index);
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      showToast.error(t('common.errors.unknown'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CertificateIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" color="primary.main">
            {t('cv.certificates.title')}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
          {t('cv.certificates.subtitle')}
        </Typography>
        
        {isDataLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>{t('common.loading')}</Typography>
          </Box>
        ) : (
          <>
            {fields.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {t('cv.certificates.noCertificates')}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => append({
                    name: '',
                    issuer: '',
                    date: '',
                    description: '',
                    documentUrl: ''
                  })}
                >
                  {t('cv.certificates.addMore')}
                </Button>
              </Box>
            )}

            {fields.map((field, index) => (
              <Paper
                key={field.id}
                elevation={1}
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 2,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <Tooltip title={t('common.delete')} placement="top">
                  <IconButton 
                    onClick={() => handleDelete(index)}
                    color="error"
                    sx={{ position: 'absolute', top: 10, right: 10 }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  {t('cv.certificates.certificateItem')} #{index + 1}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('cv.certificates.name')}
                      {...register(`certificates.${index}.name` as const, { required: true })}
                      error={!!errors.certificates?.[index]?.name}
                      helperText={errors.certificates?.[index]?.name && t('common.required')}
                      placeholder={t('cv.certificates.namePlaceholder')}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('cv.certificates.issuer')}
                      {...register(`certificates.${index}.issuer` as const, { required: true })}
                      error={!!errors.certificates?.[index]?.issuer}
                      helperText={errors.certificates?.[index]?.issuer && t('common.required')}
                      placeholder={t('cv.certificates.issuerPlaceholder')}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label={t('cv.certificates.issueDate')}
                      InputLabelProps={{ shrink: true }}
                      {...register(`certificates.${index}.date` as const, { required: true })}
                      error={!!errors.certificates?.[index]?.date}
                      helperText={errors.certificates?.[index]?.date && t('common.required')}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('cv.certificates.credentialId')}
                      {...register(`certificates.${index}.credentialId` as any)}
                      placeholder={t('cv.certificates.credentialIdPlaceholder')}
                      helperText={t('cv.certificates.credentialIdHelper')}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label={t('cv.certificates.description')}
                      {...register(`certificates.${index}.description` as const)}
                      placeholder={t('cv.certificates.descriptionPlaceholder')}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={uploadLoading === index ? <CircularProgress size={20} /> : <UploadIcon />}
                        disabled={uploadLoading !== null}
                      >
                        {t('cv.certificates.uploadFile')}
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange(index)}
                          accept=".pdf,.jpg,.jpeg,.png,.gif"
                        />
                      </Button>
                      
                      {watch(`certificates.${index}.documentUrl`) && (
                        <Tooltip title={t('cv.template.viewCertificate')}>
                          <IconButton 
                            color="primary" 
                            onClick={() => handlePreview(index)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {watch(`certificates.${index}.documentUrl`) && (
                        <Typography variant="body2" color="text.secondary">
                          {t('common.uploadSuccess')}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            {fields.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => append({
                  name: '',
                  issuer: '',
                  date: '',
                  description: '',
                  documentUrl: ''
                })}
                sx={{ mt: 2 }}
              >
                {t('cv.certificates.addMore')}
              </Button>
            )}
          </>
        )}
      </Paper>
      
      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('cv.template.viewCertificate')}</DialogTitle>
        <DialogContent>
          {previewUrl && (
            previewUrl.endsWith('.pdf') ? (
              <Box sx={{ height: '70vh', width: '100%' }}>
                <iframe 
                  src={previewUrl} 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Certificate Preview"
                />
              </Box>
            ) : (
              <CardMedia
                component="img"
                image={previewUrl}
                alt="Certificate Preview"
                sx={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>
            {t('cv.template.close')}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onPrev}
          size="large"
        >
          {t('common.previous')}
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={loading || isDataLoading}
          size="large"
        >
          {loading ? t('common.submitting') : t('common.next')}
        </Button>
      </Box>
    </form>
  );
};

export default CertificatesForm; 