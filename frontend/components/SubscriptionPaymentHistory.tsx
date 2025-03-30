import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';

interface SubscriptionPaymentHistoryProps {
  onRefresh?: () => void;
}

const SubscriptionPaymentHistory: React.FC<SubscriptionPaymentHistoryProps> = ({ onRefresh }) => {
  const { t } = useTranslation('common');

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('subscription.paymentHistory', 'Payment History')}
        </Typography>
        
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {t('subscription.noPayments', 'No payment records found')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPaymentHistory; 