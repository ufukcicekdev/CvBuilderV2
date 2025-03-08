import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  LinearProgress,
  IconButton,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { showToast } from '../../utils/toast';
import { useRouter } from 'next/router';
import { cvAPI } from '../../services/api';
import { CV } from '../../types/cv';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../services/axios';

interface VideoFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: {
    video_url: string | null;
    video_description: string | null;
  };
}

interface VideoFormData {
  video_url?: string;
  video_description?: string;
}

const VideoForm = ({ cvId, onPrev, onStepComplete, initialData }: VideoFormProps) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<VideoFormData>();

  const loadVideoData = useCallback(async () => {
    try {
      const response = await cvAPI.getOne(Number(cvId));
      const data = response.data;
      if (data?.video_info) {
        setCurrentVideo(data.video_info.url);
      }
    } catch (error) {
      console.error('Error loading video data:', error);
      showToast.error(t('common.error'));
    }
  }, [cvId, t]);

  useEffect(() => {
    if (initialData?.video_url) {
      setCurrentVideo(initialData.video_url);
    } else {
      loadVideoData();
    }
  }, [initialData, cvId, loadVideoData]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Video boyut kontrolü (100MB)
      if (file.size > 100 * 1024 * 1024) {
        showToast.error(t('common.error'));
        return;
      }

      // Video tipi kontrolü
      if (!file.type.startsWith('video/')) {
        showToast.error(t('common.error'));
        return;
      }

      setSelectedFile(file);
      // Seçilen video için önizleme URL'i oluştur
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCurrentVideo(null);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      setIsDeleting(true);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Backend'den videoyu sil
      await axiosInstance.delete(`/api/cvs/${cvId}/delete-video/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // State'i güncelle
      setValue('video_url', '');
      setPreviewUrl(null);
      setCurrentVideo(null); // Mevcut videoyu da temizle
      
      toast.success(t('cv.video.deleteSuccess'));
    } catch (error) {
      console.error('Video silme hatası:', error);
      toast.error(t('cv.video.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      
      // Eğer yeni bir video seçilmişse yükle
      if (selectedFile) {
        const formData = new FormData();
        formData.append('video', selectedFile);
        
        const response = await cvAPI.uploadVideo(Number(cvId), formData);
        const responseData = response.data;

        await onStepComplete({
          video_info: responseData.video_info,
          language: router.locale,
          current_step: 6
        });
      } else {
        // Video seçilmemişse boş video_info objesi gönder
        await onStepComplete({
          video_info: {
            url: null,
            description: null,
            type: null,
            uploaded_at: null
          },
          language: router.locale,
          current_step: 6
        });
      }
    } catch (error) {
      console.error('Error saving video data:', error);
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('cv.video.title')}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: 'background.default',
                border: '2px dashed',
                borderColor: 'divider',
                position: 'relative'
              }}
            >
              {(currentVideo || previewUrl) ? (
                <Box sx={{ position: 'relative' }}>
                  <video
                    controls
                    style={{ width: '100%', maxHeight: '400px' }}
                    src={currentVideo || previewUrl || ''}
                  />
                  <IconButton
                    onClick={handleDeleteVideo}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="video-upload-input"
                  />
                  <label htmlFor="video-upload-input">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadIcon />}
                      disabled={loading}
                      sx={{ mb: 2 }}
                    >
                      {t('cv.video.selectVideo')}
                    </Button>
                  </label>
                  <Typography variant="body2" color="textSecondary">
                    {t('cv.video.dragDrop')}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {t('cv.video.maxSize')}
                  </Typography>
                </Box>
              )}

              {loading && uploadProgress > 0 && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {`${uploadProgress}% ${t('common.uploading')}`}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {onPrev && (
            <Button
              onClick={onPrev}
              variant="contained"
              disabled={loading}
            >
              {t('common.previous')}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? t('common.uploading') : t('common.next')}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default VideoForm; 