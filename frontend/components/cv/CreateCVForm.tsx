import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { cvAPI } from '../../services/api';
import { showToast } from '../../utils/toast';
import { useRouter } from 'next/router';

interface CreateCVFormProps {
  onSuccess: (cvId: number) => void;
  subscriptionStatus?: string;
  trialDaysLeft?: number;
}

const CreateCVForm = ({ onSuccess, subscriptionStatus, trialDaysLeft = 0 }: CreateCVFormProps) => {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Trial kullanıcıları için kalan gün kontrolü
    if (subscriptionStatus === 'trial' && trialDaysLeft <= 0) {
      showToast.error(t('subscription.trialExpired'));
      router.push('/pricing');
      return;
    }
    
    setLoading(true);

    try {
      const response = await cvAPI.create({
        title: title || t('cv.untitled'),
        status: 'draft',
        current_step: 0
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