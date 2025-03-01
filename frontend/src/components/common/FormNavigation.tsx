import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface FormNavigationProps {
  onNext: () => Promise<void>;
  onPrevious?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  onNext,
  onPrevious,
  showPrevious = true,
  showNext = true,
  nextLabel,
  previousLabel,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    try {
      await onNext();
    } catch (error) {
      console.error('Error during form navigation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
      {showPrevious && (
        <Button
          variant="outlined"
          onClick={onPrevious}
          disabled={isLoading}
        >
          {previousLabel || t('common.next')}
        </Button>
      )}
      {showNext && (
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isLoading}
          style={{ position: 'relative' }}
        >
          {isLoading ? (
            <>
              <CircularProgress
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }}
              />
              <span style={{ visibility: 'hidden' }}>
                {nextLabel || t('common.next')}
              </span>
            </>
          ) : (
            nextLabel || t('common.next')
          )}
        </Button>
      )}
    </div>
  );
}; 