import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
  Input,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

interface CertificatesFormProps {
  cvId: string;
  onValidationChange: (isValid: boolean) => void;
  initialData?: any[];
}

interface CertificateItem {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  file?: File;
  file_url?: string;
}

interface CertificatesFormData {
  certificates: CertificateItem[];
}

export default function CertificatesForm({ cvId, onValidationChange, initialData = [] }: CertificatesFormProps) {
  const { t } = useTranslation(['cv', 'common']);
  const [loading, setLoading] = useState(false);

  const { control, register, handleSubmit, setValue } = useForm<CertificatesFormData>({
    defaultValues: {
      certificates: initialData.length > 0 ? initialData : [{
        name: '',
        issuer: '',
        date: '',
        url: '',
        file: undefined,
        file_url: ''
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "certificates"
  });

  const onSubmit = async (data: CertificatesFormData) => {
    try {
      setLoading(true);
      
      // Veriyi formatlayalım
      const formattedData = {
        certificates: data.certificates.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          url: cert.url || '',
          file: cert.file,
          file_url: cert.file_url || ''
        }))
      };

      // Parent component'e bildir
      await onValidationChange(true);
      
    } catch (error) {
      console.error('Error saving certificates:', error);
      toast.error(t('common:cv.saveError'));
      onValidationChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (index: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post(`/cvs/${cvId}/upload_certificate/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setValue(`certificates.${index}.file_url`, response.data.file_url);
      setValue(`certificates.${index}.file`, file);
      
      toast.success(t('common:cv.certificates.uploadSuccess'));
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('cv.certificates.fileUploadError'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="certificatesForm">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('cv:certificates.title')}
        </Typography>
        
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('cv:certificates.name')}
                  {...register(`certificates.${index}.name`)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('cv:certificates.issuer')}
                  {...register(`certificates.${index}.issuer`)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label={t('cv:certificates.date')}
                  InputLabelProps={{ shrink: true }}
                  {...register(`certificates.${index}.date`)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('cv:certificates.url')}
                  {...register(`certificates.${index}.url`)}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Input
                    type="file"
                    inputProps={{
                      accept: ".pdf,.jpg,.jpeg,.png"
                    }}
                    sx={{ display: 'none' }}
                    id={`certificate-file-${index}`}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(index, file);
                      }
                    }}
                  />
                  <label htmlFor={`certificate-file-${index}`}>
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      {t('cv:certificates.uploadFile')}
                    </Button>
                  </label>
                  {field.file_url && (
                    <Typography variant="body2" color="textSecondary">
                      {field.file?.name || t('cv:certificates.fileUploaded')}
                    </Typography>
                  )}
                </Box>
                <FormHelperText>
                  {t('cv:certificates.fileHelperText')}
                </FormHelperText>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton 
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}

        <Button onClick={() => append({ name: '', issuer: '', date: '', url: '', file: undefined, file_url: '' })} variant="contained" color="primary">
          {t('common:buttons.add')}
        </Button>
      </Box>
    </form>
  );
} 