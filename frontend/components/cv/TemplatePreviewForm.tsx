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
  DialogTitle,
  DialogActions,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  TextField,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Download as DownloadIcon, Language as WebIcon, ContentCopy as CopyIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import ModernTemplate from '../../templates/web/ModernTemplate';
import MinimalTemplate from '../../templates/web/MinimalTemplate';
import { CV } from '../../types/cv';
import Image from 'next/image';

interface TemplatePreviewFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any;
}

// SVG içerikleri
const modernWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f5f5f5"/>
  <rect x="20" y="20" width="100" height="100" rx="50" fill="#2196f3"/>
  <rect x="140" y="30" width="240" height="20" rx="4" fill="#333"/>
  <rect x="140" y="60" width="180" height="15" rx="4" fill="#666"/>
  <rect x="140" y="85" width="220" height="15" rx="4" fill="#666"/>
  <rect x="20" y="140" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="160" width="150" height="15" rx="4" fill="#2196f3"/>
  <rect x="20" y="185" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="205" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="225" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="245" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="265" width="180" height="10" rx="4" fill="#eee"/>
</svg>`;

const classicWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f8f8f8"/>
  <rect x="20" y="20" width="360" height="40" rx="4" fill="#333"/>
  <rect x="30" y="30" width="200" height="20" rx="4" fill="#fff"/>
  <rect x="20" y="80" width="150" height="20" rx="4" fill="#444"/>
  <rect x="20" y="110" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="130" width="100" height="15" rx="4" fill="#555"/>
  <rect x="20" y="155" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="175" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="195" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="225" width="100" height="15" rx="4" fill="#555"/>
  <rect x="20" y="250" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="270" width="360" height="10" rx="4" fill="#eee"/>
</svg>`;

const modernPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#fff"/>
  <rect x="20" y="20" width="360" height="30" rx="4" fill="#2196f3"/>
  <rect x="30" y="25" width="180" height="20" rx="4" fill="#fff"/>
  <rect x="20" y="70" width="100" height="100" rx="4" fill="#f0f0f0"/>
  <rect x="140" y="70" width="240" height="15" rx="4" fill="#333"/>
  <rect x="140" y="95" width="180" height="10" rx="4" fill="#666"/>
  <rect x="140" y="115" width="220" height="10" rx="4" fill="#666"/>
  <rect x="140" y="135" width="200" height="10" rx="4" fill="#666"/>
  <rect x="20" y="190" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="210" width="150" height="15" rx="4" fill="#2196f3"/>
  <rect x="20" y="235" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="255" width="360" height="10" rx="4" fill="#eee"/>
  <rect x="20" y="275" width="180" height="10" rx="4" fill="#eee"/>
</svg>`;

const classicPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#fff"/>
  <rect x="20" y="20" width="360" height="40" rx="0" fill="#333"/>
  <rect x="30" y="30" width="200" height="20" rx="0" fill="#fff"/>
  <rect x="20" y="80" width="150" height="20" rx="0" fill="#444"/>
  <rect x="20" y="110" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="130" width="100" height="15" rx="0" fill="#555"/>
  <rect x="20" y="155" width="360" height="10" rx="0" fill="#eee"/>
  <rect x="20" y="175" width="360" height="10" rx="0" fill="#eee"/>
  <rect x="20" y="195" width="360" height="10" rx="0" fill="#eee"/>
  <rect x="20" y="225" width="100" height="15" rx="0" fill="#555"/>
  <rect x="20" y="250" width="360" height="10" rx="0" fill="#eee"/>
  <rect x="20" y="270" width="180" height="10" rx="0" fill="#eee"/>
</svg>`;

// SVG'leri data URL'lerine dönüştürme
const svgToDataUrl = (svgContent: string) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
};

const TemplatePreviewForm = ({ cvId, onPrev, onStepComplete, initialData }: TemplatePreviewFormProps) => {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [previewData, setPreviewData] = useState<CV | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

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
      
      // Ensure we have the complete CV data including video_info
      const cvData = response.data;
      
      // Log the data to verify video_info is included
      console.log('CV data for preview:', cvData);
      
      // Check if video_info exists and has video_url
      if (cvData.video_info && cvData.video_info.video_url) {
        console.log('Video URL found:', cvData.video_info.video_url);
      } else {
        console.warn('No video URL found in CV data');
        
        // Video bilgilerini boş olarak ayarla
        if (!cvData.video_info) {
          cvData.video_info = {
            video_url: null,
            description: null,
            type: null,
            uploaded_at: null
          };
        }
      }
      
      console.log('Final CV data with video info:', cvData);
      setPreviewData(cvData);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast.error('Failed to load CV data');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast.error('Failed to copy URL');
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
      
      // CV verilerini alalım
      const cvResponse = await axiosInstance.get(`/api/cvs/${cvId}/`, {
        headers: {
          'Accept-Language': i18n.language || 'en'
        }
      });
      
      const cvData = cvResponse.data;
      
      // CV verilerini ve template_id'yi backend'e gönderelim
      const response = await axiosInstance.post(`/api/cvs/${cvId}/${isWebTemplate ? 'generate-web' : 'generate-pdf'}/`, {
        template_id: selectedTemplate,
        cv_data: cvData
      });

      if (isWebTemplate) {
        const webUrl = response.data.web_url;
        
        // Frontend URL'sini ekleyerek tam URL oluştur
        const baseUrl = window.location.origin;
        const fullUrl = webUrl.startsWith('/') ? `${baseUrl}${webUrl}` : `${baseUrl}/${webUrl}`;
        
        setGeneratedUrl(fullUrl);
        setUrlModalOpen(true);
      } else {
        const pdfUrl = response.data.pdf_url;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `cv-${cvId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        await onStepComplete({
          template_id: selectedTemplate,
          output_type: 'pdf',
          output_url: response.data.pdf_url
        });
        
        router.push('/dashboard');
      }

    } catch (error) {
      console.error('Error generating CV:', error);
      toast.error('Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    if (!selectedTemplate) return;
    
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split('?')[0];
    const newUrl = baseUrl.replace(/\/[a-z]{2}\/(?=[^/]*$)/, `/${newLang}/`);
    window.location.href = `${newUrl}?template=${selectedTemplate}`;
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate || !previewData) return null;

    // Ensure video_info is properly set
    if (!previewData.video_info) {
      previewData.video_info = {
        video_url: null,
        description: null,
        type: null,
        uploaded_at: null
      };
    }

    // Video URL'sinin geçerli olup olmadığını kontrol et
    const hasValidVideo = previewData.video_info && 
                         previewData.video_info.video_url && 
                         typeof previewData.video_info.video_url === 'string' && 
                         previewData.video_info.video_url.trim() !== '';
    
    // Video URL'si geçerli değilse null olarak ayarla
    if (!hasValidVideo && previewData.video_info) {
      previewData.video_info.video_url = null;
    }

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
      <Image 
        src={(activeTab === 0 ? webTemplates : pdfTemplates)
          .find(t => t.id === selectedTemplate)?.image || ''}
        alt="Template Preview"
        width={800}
        height={600}
        style={{ width: '100%', height: 'auto' }}
      />
    );
  };

  // Şablon verilerini çeviri dosyalarından alarak oluştur
  const webTemplates = [
    {
      id: 'web-template1',
      name: t('cv.template.templates.modernWeb.name'),
      description: t('cv.template.templates.modernWeb.description'),
      image: svgToDataUrl(modernWebTemplateSvg),
      type: 'web'
    },
    {
      id: 'web-template2',
      name: t('cv.template.templates.classicWeb.name'),
      description: t('cv.template.templates.classicWeb.description'),
      image: svgToDataUrl(classicWebTemplateSvg),
      type: 'web'
    }
  ];

  const pdfTemplates = [
    {
      id: 'pdf-template1',
      name: t('cv.template.templates.modernPdf.name'),
      description: t('cv.template.templates.modernPdf.description'),
      image: svgToDataUrl(modernPdfTemplateSvg),
      type: 'pdf'
    },
    {
      id: 'pdf-template2',
      name: t('cv.template.templates.classicPdf.name'),
      description: t('cv.template.templates.classicPdf.description'),
      image: svgToDataUrl(classicPdfTemplateSvg),
      type: 'pdf'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('cv.template.selectTitle')}
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
            label={t('cv.template.webVersion')}
            sx={{ textTransform: 'none' }}
          />
          {/* 
          <Tab 
            icon={<DownloadIcon />} 
            label={t('cv.template.pdfVersion')}
            sx={{ textTransform: 'none' }}
          />
          */}
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
               {t('common.previous')}
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
            {t('common.preview')}
          </Button>
          <Button
            onClick={handleGenerateCV}
            variant="contained"
            color="primary"
            disabled={!selectedTemplate || loading}
            startIcon={activeTab === 0 ? <WebIcon /> : <DownloadIcon />}
          >
            {loading 
              ? t('cv.template.generating')
              : activeTab === 0 
                ? t('cv.template.generateWeb')
                : t('cv.template.generatePDF')
            }
          </Button>
        </Box>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => {
          console.log('Closing preview modal');
          setPreviewOpen(false);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{t('cv.template.preview')}</Typography>
          <IconButton
            aria-label="close"
            onClick={() => {
              console.log('Closing preview modal via icon');
              setPreviewOpen(false);
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {console.log('Rendering preview content, previewData:', previewData)}
              {renderTemplatePreview()}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>CV URL</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              value={generatedUrl}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <IconButton onClick={handleCopyUrl} color="primary">
              <CopyIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUrlModalOpen(false)}>
            {t('cv.template.close')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              window.open(generatedUrl, '_blank');
            }}
          >
            {t('common.openInNewTab')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="URL kopyalandı!"
      />
    </Box>
  );
};

export default TemplatePreviewForm; 