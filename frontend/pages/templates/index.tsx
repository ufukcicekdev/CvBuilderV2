import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/layout/Layout';
import TemplateManager from '../../components/cv/TemplateManager';

const TemplatesPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Layout title={t('cv.template.manageTemplates')}>
      <Box sx={{ py: 3 }}>
        <TemplateManager />
      </Box>
    </Layout>
  );
};

export default TemplatesPage; 