import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Upload as UploadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
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
}

interface CertificatesFormData {
  certificates: CertificateData[];
}

const CertificatesForm = ({ cvId, onPrev, onStepComplete, initialData }: CertificatesFormProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const router = useRouter();

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
    if (certificate.document) {
      const url = URL.createObjectURL(certificate.document);
      setPreviewUrl(url);
      setOpenPreview(true);
    } else if (certificate.documentUrl) {
      setPreviewUrl(certificate.documentUrl);
      setOpenPreview(true);
    }
  };

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const response = await cvAPI.getOne(Number(cvId));
        if (response.data.certificates && response.data.certificates.length > 0) {
          const formattedCertificates = response.data.certificates.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date,
            description: cert.description || '',
            document: undefined,
            documentUrl: cert.documentUrl || ''
          }));
          
          setValue('certificates', formattedCertificates);
        }
      } catch (error) {
        console.error('Error loading certificates data:', error);
        showToast.error(t('cv.loadError'));
      }
    };

    if (cvId) {
      loadCertificates();
    }
  }, [cvId, setValue, t]);

  const onSubmit = async (data: { certificates: CertificateData[] }) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      data.certificates.forEach((cert, index) => {
        formData.append(`certificates[${index}][name]`, cert.name);
        formData.append(`certificates[${index}][issuer]`, cert.issuer);
        formData.append(`certificates[${index}][date]`, cert.date);
        formData.append(`certificates[${index}][description]`, cert.description || '');
        if (cert.document) {
          formData.append(`certificates[${index}][document]`, cert.document);
        }
      });

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
        
        showToast.success(t('cv.success'));
      } else {
        // Eğer sertifikanın ID'si yoksa sadece formdan kaldır
        remove(index);
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      showToast.error(t('cv.errors.unknown'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('cv.certificates.title')}
        </Typography>

        <Box sx={{ mt: 3 }}>
          {fields.map((field, index) => (
            <Paper
              key={field.id}
              elevation={1}
              sx={{
                p: 3,
                mb: 3,
                position: 'relative',
                borderRadius: 2,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.certificates.name')}
                    {...register(`certificates.${index}.name` as const, { required: true })}
                    error={!!errors.certificates?.[index]?.name}
                    helperText={errors.certificates?.[index]?.name && t('common.required')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.certificates.issuer')}
                    {...register(`certificates.${index}.issuer` as const, { required: true })}
                    error={!!errors.certificates?.[index]?.issuer}
                    helperText={errors.certificates?.[index]?.issuer && t('common.required')}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={t('cv.certificates.description')}
                    {...register(`certificates.${index}.description` as const)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Input
                      type="file"
                      id={`certificate-file-${index}`}
                      style={{ display: 'none' }}
                      onChange={handleFileChange(index)}
                      inputProps={{
                        accept: '.pdf,.jpg,.jpeg,.png,.gif'
                      }}
                      disabled={uploadLoading === index}
                    />
                    <label htmlFor={`certificate-file-${index}`}>
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        disabled={uploadLoading === index}
                      >
                        {uploadLoading === index ? t('common.loading') : t('cv.certificates.uploadFile')}
                      </Button>
                    </label>
                    {(watch(`certificates.${index}.document`) || watch(`certificates.${index}.documentUrl`)) && (
                      <IconButton onClick={() => handlePreview(index)} size="small">
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => handleDelete(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>

        <Button
          type="button"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append({
            name: '',
            issuer: '',
            date: '',
            description: '',
            document: undefined,
            documentUrl: ''
          })}
          sx={{ mt: 2 }}
        >
          {t('cv.certificates.addMore')}
        </Button>

        <Dialog
          open={openPreview}
          onClose={() => {
            setOpenPreview(false);
            setPreviewUrl(null);
          }}
          maxWidth="md"
          fullWidth
        >
          {previewUrl && (
            previewUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={previewUrl}
                style={{ width: '100%', height: '80vh' }}
                title="Certificate Preview"
                frameBorder="0"
              />
            ) : (
              <CardMedia
                component="img"
                image={previewUrl}
                alt="Certificate Preview"
                sx={{ objectFit: 'contain', maxHeight: '80vh' }}
              />
            )
          )}
        </Dialog>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {onPrev && (
            <Button
              type="button"
              variant="outlined"
              onClick={onPrev}
              disabled={loading}
            >
              {t('common.previous')}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ ml: 'auto' }}
          >
            {loading ? t('common.loading') : t('common.next')}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default CertificatesForm; 