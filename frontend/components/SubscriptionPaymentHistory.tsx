import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  AlertTitle
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import subscriptionService, { PaymentHistory } from '../services/subscriptionService';

interface SubscriptionPaymentHistoryProps {
  onRefresh?: () => void;
}

const SubscriptionPaymentHistory: React.FC<SubscriptionPaymentHistoryProps> = ({ onRefresh }) => {
  const { t } = useTranslation('common');
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getPaymentHistory();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(t('subscription.errorFetchingPayments', 'Error fetching payment history'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>{t('common.error')}</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('subscription.paymentHistory', 'Payment History')}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {payments.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            {t('subscription.noPayments', 'No payment records found')}
          </Typography>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('subscription.paymentDate', 'Date')}</TableCell>
                  <TableCell>{t('subscription.amount', 'Amount')}</TableCell>
                  <TableCell>{t('subscription.status', 'Status')}</TableCell>
                  <TableCell>{t('subscription.paymentId', 'Payment ID')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      {payment.amount} {payment.currency}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(`subscription.paymentStatus.${payment.status}`)} 
                        color={payment.status === 'success' ? 'success' : payment.status === 'pending' ? 'warning' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {payment.payment_id}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionPaymentHistory; 