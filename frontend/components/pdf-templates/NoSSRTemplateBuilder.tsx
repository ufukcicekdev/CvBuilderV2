'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import dynamic from 'next/dynamic';
import { PDFTemplateProps } from './types';
import { TemplateBuilderProps, CustomTemplateData } from './NoDndTemplateBuilder';

// Dynamically import the No-DnD version of the template builder with no SSR
const NoDndTemplateBuilder = dynamic(() => import('./NoDndTemplateBuilder'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading template builder...
        </Typography>
      </Box>
    </Box>
  )
});

/**
 * A wrapper component that ensures NoDndTemplateBuilder only renders client-side
 * without any problematic React.useId hooks
 */
const NoSSRTemplateBuilder: React.FC<TemplateBuilderProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    let mounted = true;
    
    // Use a short delay to ensure we're past hydration
    const timer = setTimeout(() => {
      if (mounted) {
        try {
          setIsMounted(true);
        } catch (error) {
          console.error('Error during initialization:', error);
          setErrorMessage('Initialization error: ' + (error instanceof Error ? error.message : String(error)));
          setHasError(true);
        }
      }
    }, 500);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Error handler
  const handleError = (error: Error) => {
    console.error('Error in NoSSRTemplateBuilder:', error);
    setErrorMessage('Render error: ' + error.message);
    setHasError(true);
  };
  
  if (!isMounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Preparing template builder...
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            This may take a moment to load
          </Typography>
        </Box>
      </Box>
    );
  }
  
  if (hasError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Something went wrong while loading the template builder.
        </Alert>
        {errorMessage && (
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            Error details: {errorMessage}
          </Typography>
        )}
        <Typography color="textSecondary" variant="body1">
          Please try refreshing the page or using a different browser.
        </Typography>
      </Box>
    );
  }
  
  try {
    return (
      <Box sx={{ position: 'relative' }}>
        <NoDndTemplateBuilder {...props} />
      </Box>
    );
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};

export default NoSSRTemplateBuilder; 