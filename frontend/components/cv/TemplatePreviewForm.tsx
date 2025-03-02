import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon, Language as WebIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import ModernTemplate from '../../templates/web/ModernTemplate';
import MinimalTemplate from '../../templates/web/MinimalTemplate';
import { CV } from '../../types/cv';

interface TemplatePreviewFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any;
}

const webTemplates = [
  {
    id: 'web-template1',
    name: 'Modern Web Template',
    description: 'Modern ve interaktif web tasarımı',
    image: '/templates/web-template1.png',
    type: 'web'
  },
  {
    id: 'web-template2',
    name: 'Classic Web Template',
    description: 'Klasik ve profesyonel web tasarımı',
    image: '/templates/web-template2.png',
    type: 'web'
  }
];

const pdfTemplates = [
  {
    id: 'pdf-template1',
    name: 'Modern PDF Template',
    description: 'Modern ve profesyonel PDF tasarımı',
    image: '/templates/pdf-template1.png',
    type: 'pdf'
  },
  {
    id: 'pdf-template2',
    name: 'Classic PDF Template',
    description: 'Klasik ve şık PDF tasarımı',
    image: '/templates/pdf-template2.png',
    type: 'pdf'
  }
];

const TemplatePreviewForm = ({ cvId, onPrev, onStepComplete, initialData }: TemplatePreviewFormProps) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [previewData, setPreviewData] = useState<CV | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handlePreview = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    try {
      setPreviewLoading(true);
      const response = await axiosInstance.get(`/api/cvs/${cvId}/`, {
        headers: {
          'Accept-Language': i18n.language || 'en'
        }
      });
      setPreviewData(response.data);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast.error('Failed to load CV data');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    try {
      setLoading(true);
      
      const isWebTemplate = selectedTemplate.startsWith('web-');
      const endpoint = isWebTemplate ? 'generate-web' : 'generate-pdf';
      
      const response = await axiosInstance.post(`/api/cvs/${cvId}/${endpoint}/`, {
        template_id: selectedTemplate
      }, {
        headers: {
          'Accept-Language': i18n.language || 'en'
        }
      });

      if (isWebTemplate) {
        const webUrl = response.data.web_url;
        window.open(webUrl, '_blank');
      } else {
        const pdfUrl = response.data.pdf_url;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `cv-${cvId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      await onStepComplete({
        template_id: selectedTemplate,
        output_type: isWebTemplate ? 'web' : 'pdf',
        output_url: isWebTemplate ? response.data.web_url : response.data.pdf_url
      });

      router.push('/dashboard');
      toast.success('CV generated successfully');
    } catch (error) {
      console.error('Error generating CV:', error);
      toast.error('Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate || !previewData) return null;

    // Web template preview
    if (activeTab === 0) {
      switch (selectedTemplate) {
        case 'web-template1':
          return <ModernTemplate cv={previewData} />;
        case 'web-template2':
          return <MinimalTemplate cv={previewData} />;
        default:
          return null;
      }
    }
    
    // PDF template preview - şimdilik sadece image gösteriyoruz
    return (
      <img 
        src={(activeTab === 0 ? webTemplates : pdfTemplates)
          .find(t => t.id === selectedTemplate)?.image}
        alt="Template Preview"
        style={{ width: '100%' }}
      />
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Select Template
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<WebIcon />} 
            label="Web Version"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            icon={<DownloadIcon />} 
            label="PDF Version"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {(activeTab === 0 ? webTemplates : pdfTemplates).map((template) => (
          <Grid item xs={12} sm={6} key={template.id}>
            <Card 
              sx={{ 
                border: selectedTemplate === template.id ? 2 : 0,
                borderColor: 'primary.main',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardActionArea 
                onClick={() => handleTemplateSelect(template.id)}
                sx={{ flexGrow: 1 }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={template.image}
                  alt={template.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Box>
          {onPrev && (
            <Button
              onClick={onPrev}
              variant="contained"
              disabled={loading}
            >
              Previous
            </Button>
          )}
        </Box>
        <Box>
          <Button
            onClick={handlePreview}
            variant="outlined"
            sx={{ mr: 2 }}
            disabled={!selectedTemplate || loading}
          >
            Preview
          </Button>
          <Button
            onClick={handleGenerateCV}
            variant="contained"
            color="primary"
            disabled={!selectedTemplate || loading}
            startIcon={activeTab === 0 ? <WebIcon /> : <DownloadIcon />}
          >
            {loading 
              ? 'Generating...'
              : activeTab === 0 
                ? 'Generate Web CV'
                : 'Download PDF'
            }
          </Button>
        </Box>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTemplatePreview()
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TemplatePreviewForm; 