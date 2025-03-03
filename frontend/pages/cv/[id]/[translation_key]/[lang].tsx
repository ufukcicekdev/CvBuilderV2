import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axios';
import { CV } from '@/types/cv';
import ModernTemplate from '@/templates/web/ModernTemplate';
import MinimalTemplate from '@/templates/web/MinimalTemplate';
import { Box, CircularProgress } from '@mui/material';

const CVPage = () => {
  const router = useRouter();
  const { id, translation_key, lang } = router.query;
  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<'modern' | 'minimal'>('modern');

  useEffect(() => {
    const fetchCV = async () => {
      if (!id || !translation_key || !lang) return;

      try {
        const response = await axiosInstance.get(`/cvs/${id}/${translation_key}/${lang}/`);
        setCV(response.data);
        
        // Get template from CV data or use default
        setTemplate(response.data.template || 'modern');
      } catch (err) {
        console.error('Error fetching CV:', err);
        setError('Failed to load CV');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id, translation_key, lang]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !cv) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <h1>{error || 'CV not found'}</h1>
      </Box>
    );
  }

  // Render selected template
  return template === 'modern' ? (
    <ModernTemplate cv={cv} />
  ) : (
    <MinimalTemplate cv={cv} />
  );
};

export default CVPage; 