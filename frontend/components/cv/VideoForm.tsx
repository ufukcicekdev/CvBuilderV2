import { useState, useEffect } from 'react';
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
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { cvAPI } from '../../services/api';

interface VideoFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any;
}

const VideoForm = ({ cvId, onPrev, onStepComplete, initialData }: VideoFormProps) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm();

  useEffect(() => {
    if (initialData) {
      if (initialData.video_url) {
        setCurrentVideo(initialData.video_url);
      }
      setValue('videoDescription', initialData.video_description || '');
    }
  }, [initialData, setValue]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Video boyut kontrolü (100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(t('cv.video.fileTooLarge'));
        return;
      }

      // Video tipi kontrolü
      if (!file.type.startsWith('video/')) {
        toast.error(t('cv.video.invalidFileType'));
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
      setLoading(true);
      await cvAPI.deleteVideo(Number(cvId));
      setCurrentVideo(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      setValue('videoDescription', '');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(t('cv.video.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      if (selectedFile) {
        formData.append('video', selectedFile);
      }
      formData.append('video_description', data.videoDescription || '');

      await cvAPI.uploadVideo(Number(cvId), formData);

      await onStepComplete({
        video_description: data.videoDescription,
        language: router.locale
      });
    } catch (error) {
      console.error('Error saving video data:', error);
      toast.error(t('cv.video.saveError'));
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
                    disabled={loading}
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
                    {t('cv.video.dragDropHint')}
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
                    {`${uploadProgress}% ${t('cv.video.uploading')}`}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('cv.video.description')}
              {...register('videoDescription')}
              disabled={loading}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {onPrev && (
            <Button
              onClick={onPrev}
              variant="contained"
              disabled={loading}
            >
              {t('navigation.previous')}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? t('common.uploading') : t('navigation.next')}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default VideoForm; 