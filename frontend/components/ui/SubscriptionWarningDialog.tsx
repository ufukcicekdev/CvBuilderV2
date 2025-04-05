import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';

interface SubscriptionWarningDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

/**
 * Abonelik uyarı dialog bileşeni
 * Deneme sürümünde veya diğer abonelik durumlarında kullanıcıya bilgi vermek için
 */
const SubscriptionWarningDialog = ({ open, onClose, message }: SubscriptionWarningDialogProps) => {
  const { t } = useTranslation('common');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="subscription-warning-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="subscription-warning-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        {t('subscription.warningTitle')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
          <Typography variant="body1">
            {message || t('subscription.trialLimit')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {t('subscription.upgradeToCreate')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">
          {t('common.close')}
        </Button>
        <Button 
          component={NextLink} 
          href="/pricing" 
          variant="contained" 
          color="primary"
          onClick={onClose}
        >
          {t('subscription.goToPricing')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionWarningDialog; 