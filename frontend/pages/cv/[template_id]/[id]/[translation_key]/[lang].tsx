import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axios';
import { CV } from '@/types/cv';
import ModernTemplate from '@/templates/web/ModernTemplate';
import MinimalTemplate from '@/templates/web/MinimalTemplate';
import ColorfulTemplate from '@/templates/web/ColorfulTemplate';
import ProfessionalTemplate from '@/templates/web/ProfessionalTemplate';
import CreativeTemplate from '@/templates/web/CreativeTemplate';
import { Box, CircularProgress } from '@mui/material';

const CVPage = () => {
  const router = useRouter();
  const { template_id, id, translation_key, lang } = router.query;
  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      if (!id || !translation_key || !lang) return;

      try {
        console.log(`Fetching CV with ID: ${id}, translation key: ${translation_key}, lang: ${lang}`);
        const response = await axiosInstance.get(`/cvs/${id}/${translation_key}/${lang}/`);
        setCV(response.data);
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

  // Şablona göre uygun bileşeni göster
  switch (template_id) {
    case 'web-template1':
      return <ModernTemplate cv={cv} />;
    case 'web-template2':
      return <MinimalTemplate cv={cv} />;
    case 'web-template3':
      return <ColorfulTemplate cv={cv} />;
    case 'web-template4':
      return <ProfessionalTemplate cv={cv} />;
    case 'web-template5':
      return <CreativeTemplate cv={cv} />;
    default:
      return <ModernTemplate cv={cv} />;
  }
};

export default CVPage; 