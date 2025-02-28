import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  Input,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axios';

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
  url?: string;
  document?: File;
}

const CertificatesForm = ({ cvId, onPrev, onStepComplete, initialData }: CertificatesFormProps) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      certificates: [
        {
          name: '',
          issuer: '',
          date: '',
          description: '',
          url: '',
          document: undefined
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certificates'
  });

  // Sertifikaları yükle
  const fetchCertificates = async () => {
    try {
      const response = await axiosInstance.get(`/api/cvs/${cvId}/`);
      if (response.data.certificates?.length > 0) {
        // Backend'den gelen veriyi form yapısına dönüştür
        const formattedCertificates = response.data.certificates.map((cert: any) => ({
          id: cert.id,
          name: cert.name || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          description: cert.description || '',
          url: cert.url || '',
          document: undefined // Dosya yükleme için boş bırak
        }));
        
        // Form alanlarını doldur
        reset({ certificates: formattedCertificates });
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error(t('cv.certificates.fetchError'));
    }
  };

  useEffect(() => {
    if (cvId) {
      fetchCertificates();
    }
  }, [cvId]);

  // Initial data geldiğinde form alanlarını doldur
  useEffect(() => {
    if (initialData?.certificates?.length > 0) {
      const formattedCertificates = initialData.certificates.map(cert => ({
        id: cert.id,
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        description: cert.description || '',
        url: cert.url || '',
        document: undefined
      }));
      reset({ certificates: formattedCertificates });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: { certificates: CertificateData[] }) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Sertifika verilerini formData'ya ekle
      data.certificates.forEach((cert, index) => {
        formData.append(`certificates[${index}][name]`, cert.name);
        formData.append(`certificates[${index}][issuer]`, cert.issuer);
        formData.append(`certificates[${index}][date]`, cert.date);
        formData.append(`certificates[${index}][description]`, cert.description || '');
        formData.append(`certificates[${index}][url]`, cert.url || '');
        if (cert.document) {
          formData.append(`certificates[${index}][document]`, cert.document);
        }
      });

      await onStepComplete({ certificates: data.certificates });
    } catch (error) {
      console.error('Error saving certificates:', error);
      toast.error(t('cv.certificates.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Dosya tipini kontrol et
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error(t('cv.certificates.invalidFileType'));
        return;
      }
      
      // Dosya boyutunu kontrol et (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('cv.certificates.fileTooLarge'));
        return;
      }
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
              <IconButton
                onClick={() => remove(index)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main',
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>

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
                    label={t('cv.certificates.date')}
                    InputLabelProps={{ shrink: true }}
                    {...register(`certificates.${index}.date` as const, { required: true })}
                    error={!!errors.certificates?.[index]?.date}
                    helperText={errors.certificates?.[index]?.date && t('common.required')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.certificates.url')}
                    {...register(`certificates.${index}.url` as const)}
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
                  <Input
                    type="file"
                    id={`certificate-file-${index}`}
                    style={{ display: 'none' }}
                    onChange={handleFileChange(index)}
                    inputProps={{
                      accept: '.pdf,.jpg,.jpeg,.png,.gif'
                    }}
                  />
                  <label htmlFor={`certificate-file-${index}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      sx={{ mt: 1 }}
                    >
                      {t('cv.certificates.uploadDocument')}
                    </Button>
                  </label>
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
            url: '',
            document: undefined
          })}
          sx={{ mt: 2 }}
        >
          {t('cv.certificates.addMore')}
        </Button>

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
            {t('common.next')}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default CertificatesForm; 