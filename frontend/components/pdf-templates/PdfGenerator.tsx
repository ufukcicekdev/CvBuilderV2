'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getTemplateById, templateInfo } from './index';
import { pdfService } from '../../services/pdfService';
import { PDFTemplateProps } from './types';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import CustomTemplateRenderer from './CustomTemplateRenderer';
import { CustomTemplateData } from './TemplateBuilder';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { patchReactUseId } from './useIdSafeguard';
import ReactDOM from 'react-dom/client';

interface PdfGeneratorProps {
  data: PDFTemplateProps['data'];
  language?: string;
  translations?: Record<string, string>;
  customTemplate?: CustomTemplateData;
}

// Patch React.useId at module level
if (typeof window !== 'undefined') {
  patchReactUseId();
}

// Helper function to safely render React components
const safeRender = (element: React.ReactElement, container: HTMLElement) => {
  try {
    // Patch React.useId again just before rendering
    if (typeof window !== 'undefined') {
      patchReactUseId();
    }
    
    // Safety check for container
    if (!container) {
      console.error('Container element is null');
      return;
    }
    
    // Use createRoot API with try/catch
    try {
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          {element}
        </React.StrictMode>
      );
    } catch (error) {
      console.error('Error in ReactDOM.createRoot render:', error);
      // Fallback display
      container.innerHTML = '<div>Error rendering PDF preview. Please try again.</div>';
    }
  } catch (error) {
    console.error('Fatal error in safeRender:', error);
  }
};

// PdfGenerator bileşenini sunucu tarafında render etmemek için dinamik olarak import ediyoruz
const PdfGenerator = dynamic(
  () => Promise.resolve(
    (props: PdfGeneratorProps) => {
      const { data, language = 'en', translations, customTemplate } = props;
      const { t } = useTranslation('common');
      
      // Patch React.useId on component mount
      useEffect(() => {
        if (typeof window !== 'undefined') {
          patchReactUseId();
        }
      }, []);
      
      // Use translations from props or data.i18n, prioritizing the explicitly passed translations
      const translationData = translations || data.i18n || {
        summary: "Özet",
        experience: "Deneyim",
        education: "Eğitim",
        skills: "Beceriler",
        languages: "Diller",
        certificates: "Sertifikalar",
        present: "Halen",
        skill_level: '/ 5',
      };

      const containerRef = useRef<HTMLDivElement>(null);
      const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
      const [isGenerating, setIsGenerating] = useState(false);

      // PDF indirme işlemini başlat
      const handleGeneratePdf = React.useCallback(async () => {
        if (!containerRef.current) return;
        
        setIsGenerating(true);
        try {
          // Patch React.useId again before generating PDF
          if (typeof window !== 'undefined') {
            patchReactUseId();
          }
          
          // PDF container referansını al
          const pdfContainer = containerRef.current.querySelector('#pdf-container');
          
          if (!pdfContainer) {
            throw new Error('PDF container not found');
          }
          
          // PDF oluştur ve indir
          const success = await pdfService.generatePdf({
            element: pdfContainer as HTMLElement,
            filename: `${data.personal_info?.full_name || 'CV'}.pdf`,
            scale: 2, // Kalite/boyut dengesi için daha az ölçek kullan
            margin: [10, 10, 10, 10], // Daha küçük marjlar
            singlePage: true, // Tek sayfaya sığdırma özelliği aktif
          });
          
          if (success) {
            console.log('PDF successfully generated');
          } else {
            console.error('PDF generation failed');
          }
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          setIsGenerating(false);
        }
      }, [data.personal_info?.full_name, containerRef]);

      // TemplatePreviewForm'dan gelen PDF oluşturma eventini dinle
      useEffect(() => {
        const handleGeneratePdfEvent = (event: Event) => {
          try {
            // Patch React.useId before handling event
            if (typeof window !== 'undefined') {
              patchReactUseId();
            }
            
            const customEvent = event as CustomEvent;
            const { templateId, data: eventData, language: eventLanguage, translations: eventTranslations, isCustomTemplate, customTemplate: eventCustomTemplate } = customEvent.detail;
            
            // Şablonu güncelle
            if (templateId) {
              setSelectedTemplate(templateId);
            }
            
            // PDF oluşturma işlemini tetikle (timeout ile render tamamlandıktan sonra)
            setTimeout(() => {
              handleGeneratePdf();
            }, 300);
          } catch (error) {
            console.error('Error handling PDF generation event:', error);
          }
        };
        
        // Event listener'ı ekle
        document.addEventListener('generate-pdf', handleGeneratePdfEvent);
        
        // Cleanup
        return () => {
          document.removeEventListener('generate-pdf', handleGeneratePdfEvent);
        };
      }, [data, language, handleGeneratePdf]); // data, language ve handleGeneratePdf değiştiğinde event listener'ı güncelle

      // Seçilen şablonu render et
      const renderTemplate = () => {
        try {
          // Patch React.useId before rendering template
          if (typeof window !== 'undefined') {
            patchReactUseId();
          }
          
          // Özel şablon olup olmadığını kontrol et
          if (customTemplate) {
            return (
              <CustomTemplateRenderer 
                data={data} 
                language={language}
                translations={translationData}
                templateData={{
                  ...customTemplate,
                  type: 'pdf',
                  globalSettings: {
                    ...customTemplate.globalSettings,
                    textColor: customTemplate.globalSettings.primaryColor || '#000000'
                  }
                }}
              />
            );
          }
          
          // Standart şablonu oluştur
          const TemplateComponent = getTemplateById(selectedTemplate);
          
          return (
            <TemplateComponent 
              data={data} 
              language={language}
              translations={translationData}
            />
          );
        } catch (error) {
          console.error('Error rendering template:', error);
          
          // Fallback component if rendering fails
          return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error">
                Error rendering template. Please try a different template.
              </Typography>
            </Box>
          );
        }
      };

      return (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Mobilde alt alta
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 3,
            gap: { xs: 2, sm: 0 }
          }}>
            <FormControl variant="outlined" size="small" sx={{ 
              minWidth: { xs: '100%', sm: 200 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              <InputLabel id="template-select-label">{t('cv.preview.templateSelection')}</InputLabel>
              <Select
                labelId="template-select-label"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as string)}
                label={t('cv.preview.templateSelection')}
              >
                {Object.entries(templateInfo).map(([id, info]) => (
                  <MenuItem key={id} value={id}>
                    {info.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              fullWidth={false} // Mobilde tam genişlikte olmaması için
              sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
              startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
              onClick={handleGeneratePdf}
              disabled={isGenerating}
            >
              {isGenerating ? t('cv.preview.generating') : t('cv.preview.downloadPdf')}
            </Button>
          </Box>
          
          <Box 
            ref={containerRef}
            sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1,
              p: { xs: 1, sm: 2 }, // Mobilde padding azalt
              backgroundColor: '#f9f9f9',
              maxWidth: '100%',
              overflow: 'auto',
              // PDF şablonlarının mobil görünümü için
              '& .pdf-template': {
                maxWidth: '100%',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto'
                },
                '& table': {
                  maxWidth: '100%',
                  tableLayout: 'fixed'
                },
                '& td, & th': {
                  wordBreak: 'break-word'
                }
              }
            }}
          >
            {renderTemplate()}
          </Box>
        </Box>
      );
    }
  ),
  { ssr: false }
);

export default PdfGenerator; 