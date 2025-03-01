import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { cvAPI } from '../../services/api';
import { showToast } from '../../utils/toast';

interface CreateCVFormProps {
  onSuccess: (cvId: number) => void;
}

const CreateCVForm = ({ onSuccess }: CreateCVFormProps) => {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await cvAPI.create({
        title: title || t('cv.untitled')
      });

      showToast.success(t('cv.createSuccess'));
      onSuccess(response.data.id);
    } catch (error) {
      console.error('Error creating CV:', error);
      showToast.error(t('cv.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {t('cv.create')}
      </Typography>

      <TextField
        fullWidth
        label={t('cv.titleLabel')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('cv.titlePlaceholder')}
        helperText={t('cv.titleHelper')}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={loading}
      >
        {loading ? t('common.submitting') : t('cv.startCreating')}
      </Button>
    </Box>
  );
};

export default CreateCVForm; 