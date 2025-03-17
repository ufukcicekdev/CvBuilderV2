'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import dynamic from 'next/dynamic';
import { PDFTemplateProps } from './types';
import { CustomTemplateData } from './TemplateBuilder';
import { patchReactUseId } from './useIdSafeguard';
import { monkeyPatchDnd, ensureReactUseId } from './monkeyPatchDnd';

// Apply all available patches as early as possible
if (typeof window !== 'undefined') {
  patchReactUseId();
  ensureReactUseId();
  monkeyPatchDnd();
}

// Dynamic import with no SSR and add a loading indicator
const TemplateBuilder = dynamic(() => import('./TemplateBuilder'), {
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

interface ClientTemplateBuilderProps {
  data: PDFTemplateProps['data'];
  language?: string;
  translations?: Record<string, string>;
  onSaveTemplate?: (templateData: CustomTemplateData) => void;
  savedTemplates?: CustomTemplateData[];
}

/**
 * A wrapper component that ensures TemplateBuilder only renders client-side
 * and handles potential errors
 */
const ClientTemplateBuilder: React.FC<ClientTemplateBuilderProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  useEffect(() => {
    // Apply all patches in the effect
    if (typeof window !== 'undefined') {
      patchReactUseId();
      ensureReactUseId();
      monkeyPatchDnd();
    }
    
    let mounted = true;
    
    // Use a much longer delay (2.5 seconds) to make absolutely sure we're past hydration
    // and React.useId is fully available
    const timer = setTimeout(async () => {
      if (mounted) {
        try {
          // Apply patches again right before mounting
          if (typeof window !== 'undefined') {
            patchReactUseId();
            ensureReactUseId();
            await monkeyPatchDnd();
          }
          
          setIsMounted(true);
          setLoadAttempts(prev => prev + 1);
        } catch (error) {
          console.error('Error during initialization:', error);
          setErrorMessage('Initialization error: ' + (error instanceof Error ? error.message : String(error)));
          setHasError(true);
        }
      }
    }, 2500);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // If we've failed 3 times, show an error
  useEffect(() => {
    if (loadAttempts >= 3 && !isMounted) {
      setHasError(true);
      setErrorMessage('Failed to initialize after multiple attempts');
    }
  }, [loadAttempts, isMounted]);
  
  // Error handler
  const handleError = (error: Error) => {
    console.error('Error in ClientTemplateBuilder:', error);
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
    // Patch one more time just before rendering
    if (typeof window !== 'undefined') {
      patchReactUseId();
      ensureReactUseId();
      monkeyPatchDnd();
    }
    
    return (
      <Box sx={{ position: 'relative' }}>
        <TemplateBuilder {...props} />
      </Box>
    );
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};

export default ClientTemplateBuilder; 