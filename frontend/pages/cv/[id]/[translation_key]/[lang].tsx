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
  const [template, setTemplate] = useState<string>('web-template1');

  useEffect(() => {
    const fetchCV = async () => {
      if (!id || !translation_key || !lang) return;

      try {
        const response = await axiosInstance.get(`/cvs/${id}/${translation_key}/${lang}/`);
        setCV(response.data);
        
        // URL'den şablon parametresini al
        const templateParam = router.query.template as string;
        if (templateParam) {
          setTemplate(templateParam);
        }
      } catch (err) {
        console.error('Error fetching CV:', err);
        setError('Failed to load CV');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id, translation_key, lang, router.query.template]);

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

  // Şablona göre uygun bileşeni göster
  switch (template) {
    case 'web-template1':
      return <ModernTemplate cv={cv} />;
    case 'web-template2':
      return <MinimalTemplate cv={cv} />;
    default:
      return <ModernTemplate cv={cv} />;
  }
};

export default CVPage; 