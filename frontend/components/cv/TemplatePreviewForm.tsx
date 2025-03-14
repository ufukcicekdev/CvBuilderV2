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
  FormControl,
  Select,
  MenuItem,
  Modal,
} from '@mui/material';
import { Download as DownloadIcon, Language as WebIcon, ContentCopy as CopyIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import ModernTemplate from '@/templates/web/ModernTemplate';
import MinimalTemplate from '@/templates/web/MinimalTemplate';
import ColorfulTemplate from '@/templates/web/ColorfulTemplate';
import ProfessionalTemplate from '@/templates/web/ProfessionalTemplate';
import CreativeTemplate from '@/templates/web/CreativeTemplate';
import { CV } from '@/types/cv';
import Image from 'next/image';

interface TemplatePreviewFormProps {
  cvId: string;
  onPrev?: () => void;
  onStepComplete: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
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

// Adding new modern PDF templates
const minimalPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#ffffff"/>
  <rect x="20" y="20" width="360" height="50" rx="0" fill="#ffffff"/>
  <rect x="20" y="22" width="4" height="46" rx="0" fill="#555555"/>
  <rect x="30" y="30" width="200" height="20" rx="0" fill="#333333"/>
  <rect x="30" y="55" width="160" height="12" rx="0" fill="#777777"/>
  <rect x="20" y="90" width="100" height="16" rx="0" fill="#333333"/>
  <rect x="20" y="115" width="360" height="0.5" fill="#dddddd"/>
  <rect x="20" y="130" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="150" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="170" width="260" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="195" width="100" height="16" rx="0" fill="#333333"/>
  <rect x="20" y="220" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="240" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="260" width="260" height="10" rx="0" fill="#eeeeee"/>
</svg>`;

const creativePdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#ffffff"/>
  <rect x="0" y="0" width="120" height="300" fill="#6200EA"/>
  <rect x="25" y="30" width="70" height="70" rx="35" fill="#ffffff"/>
  <rect x="25" y="120" width="70" height="15" rx="2" fill="#ffffff" fill-opacity="0.9"/>
  <rect x="25" y="145" width="70" height="15" rx="2" fill="#ffffff" fill-opacity="0.9"/>
  <rect x="25" y="170" width="70" height="15" rx="2" fill="#ffffff" fill-opacity="0.9"/>
  <rect x="25" y="195" width="70" height="15" rx="2" fill="#ffffff" fill-opacity="0.9"/>
  <rect x="150" y="30" width="220" height="25" rx="2" fill="#333333"/>
  <rect x="150" y="65" width="160" height="15" rx="2" fill="#666666"/>
  <rect x="150" y="110" width="90" height="20" rx="2" fill="#6200EA"/>
  <rect x="150" y="140" width="220" height="10" rx="2" fill="#eeeeee"/>
  <rect x="150" y="160" width="220" height="10" rx="2" fill="#eeeeee"/>
  <rect x="150" y="180" width="160" height="10" rx="2" fill="#eeeeee"/>
  <rect x="150" y="210" width="90" height="20" rx="2" fill="#6200EA"/>
  <rect x="150" y="240" width="220" height="10" rx="2" fill="#eeeeee"/>
  <rect x="150" y="260" width="220" height="10" rx="2" fill="#eeeeee"/>
</svg>`;

const professionalPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#ffffff"/>
  <rect x="0" y="0" width="400" height="60" fill="#1976D2"/>
  <rect x="20" y="20" width="200" height="25" rx="0" fill="#ffffff"/>
  <rect x="20" y="80" width="120" height="170" fill="#f5f5f5"/>
  <rect x="35" y="100" width="90" height="15" rx="0" fill="#1976D2"/>
  <rect x="35" y="125" width="90" height="10" rx="0" fill="#333333"/>
  <rect x="35" y="145" width="90" height="10" rx="0" fill="#333333"/>
  <rect x="35" y="175" width="90" height="15" rx="0" fill="#1976D2"/>
  <rect x="35" y="200" width="90" height="10" rx="0" fill="#333333"/>
  <rect x="35" y="220" width="90" height="10" rx="0" fill="#333333"/>
  <rect x="160" y="80" width="220" height="15" rx="0" fill="#1976D2"/>
  <rect x="160" y="105" width="220" height="10" rx="0" fill="#eeeeee"/>
  <rect x="160" y="125" width="220" height="10" rx="0" fill="#eeeeee"/>
  <rect x="160" y="145" width="180" height="10" rx="0" fill="#eeeeee"/>
  <rect x="160" y="175" width="220" height="15" rx="0" fill="#1976D2"/>
  <rect x="160" y="200" width="220" height="10" rx="0" fill="#eeeeee"/>
  <rect x="160" y="220" width="220" height="10" rx="0" fill="#eeeeee"/>
  <rect x="160" y="240" width="180" height="10" rx="0" fill="#eeeeee"/>
</svg>`;

const elegantPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#ffffff"/>
  <rect x="0" y="0" width="400" height="80" fill="#263238"/>
  <rect x="20" y="25" width="240" height="30" rx="0" fill="#ffffff"/>
  <rect x="270" y="15" width="110" height="110" rx="55" fill="#f5f5f5"/>
  <rect x="20" y="90" width="240" height="15" rx="0" fill="#263238"/>
  <rect x="20" y="115" width="240" height="10" rx="0" fill="#666666"/>
  <rect x="20" y="135" width="240" height="10" rx="0" fill="#666666"/>
  <rect x="20" y="165" width="360" height="1" fill="#dddddd"/>
  <rect x="20" y="180" width="120" height="15" rx="0" fill="#263238"/>
  <rect x="20" y="205" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="225" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="245" width="360" height="10" rx="0" fill="#eeeeee"/>
  <rect x="20" y="265" width="240" height="10" rx="0" fill="#eeeeee"/>
</svg>`;

const colorfulModernPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#ffffff"/>
  <rect x="0" y="0" width="400" height="15" fill="#FF4081"/>
  <rect x="20" y="35" width="240" height="30" rx="4" fill="#333333"/>
  <rect x="20" y="75" width="180" height="15" rx="4" fill="#777777"/>
  <rect x="280" y="35" width="100" height="100" rx="10" fill="#f5f5f5"/>
  <rect x="20" y="110" width="240" height="15" rx="4" fill="#FF4081"/>
  <rect x="20" y="135" width="360" height="10" rx="4" fill="#eeeeee"/>
  <rect x="20" y="155" width="360" height="10" rx="4" fill="#eeeeee"/>
  <rect x="20" y="175" width="260" height="10" rx="4" fill="#eeeeee"/>
  <rect x="20" y="200" width="240" height="15" rx="4" fill="#FF4081"/>
  <rect x="20" y="225" width="360" height="10" rx="4" fill="#eeeeee"/>
  <rect x="20" y="245" width="360" height="10" rx="4" fill="#eeeeee"/>
  <rect x="20" y="265" width="260" height="10" rx="4" fill="#eeeeee"/>
</svg>`;

const minimalismPdfTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#ffffff"/>
  <rect x="40" y="40" width="320" height="35" rx="0" fill="#ffffff"/>
  <rect x="40" y="40" width="3" height="35" rx="0" fill="#000000"/>
  <rect x="50" y="45" width="200" height="25" rx="0" fill="#333333"/>
  <rect x="40" y="90" width="150" height="15" rx="0" fill="#333333"/>
  <rect x="40" y="115" width="320" height="0.5" fill="#dddddd"/>
  <rect x="40" y="130" width="320" height="10" rx="0" fill="#eeeeee"/>
  <rect x="40" y="150" width="320" height="10" rx="0" fill="#eeeeee"/>
  <rect x="40" y="170" width="220" height="10" rx="0" fill="#eeeeee"/>
  <rect x="40" y="195" width="150" height="15" rx="0" fill="#333333"/>
  <rect x="40" y="220" width="320" height="10" rx="0" fill="#eeeeee"/>
  <rect x="40" y="240" width="320" height="10" rx="0" fill="#eeeeee"/>
</svg>`;

const colorfulWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#FFFFFF"/>
  <rect x="20" y="20" width="100" height="100" rx="50" fill="#FF6B6B"/>
  <rect x="140" y="30" width="240" height="20" rx="4" fill="#333"/>
  <rect x="140" y="60" width="180" height="15" rx="4" fill="#666"/>
  <rect x="140" y="85" width="220" height="15" rx="4" fill="#666"/>
  <rect x="20" y="140" width="360" height="1" fill="#ddd"/>
  <rect x="20" y="160" width="150" height="15" rx="4" fill="#FF6B6B"/>
  <rect x="20" y="185" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="205" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="225" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="245" width="360" height="10" rx="4" fill="#F8F9FA"/>
  <rect x="20" y="265" width="180" height="10" rx="4" fill="#F8F9FA"/>
</svg>`;

const professionalWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F5F5F5"/>
  <rect x="0" y="0" width="400" height="60" fill="#1976D2"/>
  <rect x="20" y="20" width="200" height="20" rx="4" fill="#FFFFFF"/>
  <rect x="20" y="80" width="360" height="70" rx="4" fill="#FFFFFF"/>
  <rect x="20" y="170" width="170" height="110" rx="4" fill="#FFFFFF"/>
  <rect x="210" y="170" width="170" height="110" rx="4" fill="#FFFFFF"/>
</svg>`;

const creativeWebTemplateSvg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F7F7F7"/>
  <rect x="0" y="0" width="400" height="120" fill="#121212"/>
  <path d="M400 0 L400 120 L0 0 Z" fill="#6200EA" fill-opacity="0.6"/>
  <path d="M0 120 L400 120 L0 0 Z" fill="#FF4081" fill-opacity="0.6"/>
  <rect x="20" y="150" width="360" height="60" rx="8" fill="#FFFFFF"/>
  <rect x="20" y="220" width="170" height="60" rx="8" fill="#FFFFFF"/>
  <rect x="210" y="220" width="170" height="60" rx="8" fill="#FFFFFF"/>
</svg>`;

// SVG'leri data URL'lerine dönüştürme
const svgToDataUrl = (svgContent: string) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
};

const TemplatePreviewForm = ({ cvId, onPrev, onStepComplete, initialData, isLoading }: TemplatePreviewFormProps) => {
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('tr');

  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await axiosInstance.get(`/api/cvs/${cvId}/`);
        const cvData = response.data;
        setPreviewData(cvData);
        
        // Set Turkish as default language
        setSelectedLanguage('tr');
      } catch (error) {
        console.error('Error fetching CV data:', error);
        toast.error('Failed to load CV data');
      }
    };

    fetchCVData();
  }, [cvId]);

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
          'Accept-Language': selectedLanguage
        }
      });
      
      const cvData = response.data;
      
      // Ensure video_info exists with default values if not present
      cvData.video_info = cvData.video_info || {
        video_url: null,
        description: null,
        type: null,
        uploaded_at: null
      };
      
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
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast.error('Failed to copy URL');
    }
  };

  const mapTemplateIdToUrlFormat = (templateId: string): string => {
    const webTemplateMap: { [key: string]: string } = {
      'web-modern': 'web-template1',
      'web-minimal': 'web-template2',
      'web-colorful': 'web-template3',
      'web-professional': 'web-template4',
      'web-creative': 'web-template5'
    };

    const pdfTemplateMap: { [key: string]: string } = {
      'pdf-modern': 'modern',
      'pdf-classic': 'classic',
      'pdf-minimal': 'minimal',
      'pdf-creative': 'creative',
      'pdf-professional': 'professional'
    };

    if (templateId.startsWith('web-')) {
      return webTemplateMap[templateId] || templateId;
    } else {
      return pdfTemplateMap[templateId] || templateId;
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
      const templateFormat = mapTemplateIdToUrlFormat(selectedTemplate);
      
      const response = await axiosInstance.post(`/api/cvs/${cvId}/${isWebTemplate ? 'generate-web' : 'generate-pdf'}/`, {
        template_id: templateFormat,
        language: selectedLanguage
      });

      if (isWebTemplate) {
        const webUrl = response.data.web_url;
        const baseUrl = window.location.origin;
        const fullUrl = webUrl.startsWith('/') ? `${baseUrl}${webUrl}` : `${baseUrl}/${webUrl}`;
        
        setGeneratedUrl(fullUrl);
        setUrlModalOpen(true);
      } else {
        // PDF indirme işlemi - base64 formatında gelen PDF'i dönüştür ve indir
        const { pdf_base64, filename, content_type } = response.data;
        
        // Base64 verisini Blob'a dönüştür
        const pdfBlob = await fetch(`data:${content_type};base64,${pdf_base64}`).then(res => res.blob());
        
        // Blob'dan URL oluştur
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // PDF'i indir
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Blob URL'ini temizle
        URL.revokeObjectURL(blobUrl);
        
        // router.push('/dashboard'); yerine toast mesajı göster
        toast.success(t('CV başarıyla indirildi'));
      }

    } catch (error) {
      console.error('Error generating CV:', error);
      toast.error('Failed to generate CV');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    if (previewData) {
      handlePreview();
    }
  };

  const handleStepComplete = async (data: any) => {
    try {
      await onStepComplete(data);
      // Başarıyla tamamlandı mesajı göster
      toast.success(t('CV başarıyla oluşturuldu!'));
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error(t('CV oluşturulurken bir hata oluştu.'));
    }
  };

  const renderTemplatePreview = () => {
    if (!previewData) return null;

    // Web template'leri için preview
    if (selectedTemplate?.startsWith('web-')) {
      const templates = {
        'web-modern': ModernTemplate,
        'web-minimal': MinimalTemplate,
        'web-colorful': ColorfulTemplate,
        'web-professional': ProfessionalTemplate,
        'web-creative': CreativeTemplate,
      };

      const TemplateComponent = templates[selectedTemplate as keyof typeof templates];
      if (!TemplateComponent) return null;

      return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <TemplateComponent cv={previewData} />
        </Box>
      );
    }
    
    // PDF template'leri için preview
    if (selectedTemplate?.startsWith('pdf-')) {
      // Seçilen şablona göre stil ayarları
      const getTemplateStyles = () => {
        switch (selectedTemplate) {
          case 'pdf-modern':
            return {
              container: {
                bgcolor: '#fff',
                p: 3,
              },
              header: {
                mb: 3,
                pb: 2,
                borderBottom: '2px solid #2196f3'
              },
              title: {
                color: '#2196f3',
                fontSize: '2rem',
                fontWeight: 500
              },
              subtitle: {
                color: '#666',
                fontSize: '1.1rem'
              },
              sectionTitle: {
                color: '#2196f3',
                fontSize: '1.2rem',
                mb: 2,
                fontWeight: 500
              }
            };
          case 'pdf-classic':
            return {
              container: {
                bgcolor: '#fff',
                p: 3,
              },
              header: {
                mb: 3,
                bgcolor: '#333',
                p: 2,
                color: '#fff'
              },
              title: {
                color: '#fff',
                fontSize: '1.8rem'
              },
              subtitle: {
                color: '#ddd',
                fontSize: '1rem'
              },
              sectionTitle: {
                color: '#333',
                borderBottom: '1px solid #333',
                pb: 1,
                mb: 2
              }
            };
          case 'pdf-minimal':
            return {
              container: {
                bgcolor: '#fff',
                p: 4,
              },
              header: {
                mb: 4,
                borderLeft: '4px solid #555',
                pl: 2
              },
              title: {
                fontSize: '1.6rem',
                fontWeight: 400
              },
              subtitle: {
                color: '#777'
              },
              sectionTitle: {
                fontSize: '1.2rem',
                fontWeight: 400,
                borderLeft: '2px solid #555',
                pl: 1,
                mb: 2
              }
            };
          case 'pdf-creative':
            return {
              container: {
                bgcolor: '#fff',
                p: 3,
                display: 'flex'
              },
              sidebar: {
                width: '30%',
                bgcolor: '#6200EA',
                p: 2,
                color: '#fff'
              },
              mainContent: {
                width: '70%',
                p: 2
              },
              title: {
                color: '#6200EA',
                fontSize: '2rem'
              },
              subtitle: {
                color: '#666'
              },
              sectionTitle: {
                color: '#6200EA',
                mb: 2
              }
            };
          case 'pdf-professional':
            return {
              container: {
                bgcolor: '#fff',
                p: 0
              },
              header: {
                bgcolor: '#1976D2',
                p: 3,
                mb: 3,
                color: '#fff'
              },
              title: {
                fontSize: '2rem'
              },
              subtitle: {
                color: 'rgba(255,255,255,0.9)'
              },
              sectionTitle: {
                color: '#1976D2',
                mb: 2,
                fontWeight: 500
              }
            };
          default:
            return {
              container: {
                bgcolor: '#fff',
                p: 3,
              },
              header: { mb: 3 },
              title: { fontSize: '2rem' },
              subtitle: { color: 'text.secondary' },
              sectionTitle: { color: 'primary.main', mb: 2 }
            };
        }
      };

      const styles = getTemplateStyles();

      return (
        <Box sx={{ 
          p: 4, 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 600,
            aspectRatio: '1/1.414', // A4 aspect ratio
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            boxShadow: 3,
            ...styles.container
          }}>
            {selectedTemplate === 'pdf-creative' ? (
              // Creative template layout
              <Box sx={{ display: 'flex', height: '100%' }}>
                <Box sx={styles.sidebar}>
                  <Typography variant="h4" gutterBottom sx={{ color: '#fff' }}>
                    {previewData.personal_info.first_name}
                    <br />
                    {previewData.personal_info.last_name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                    {previewData.personal_info.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    {previewData.personal_info.email}
                    <br />
                    {previewData.personal_info.phone}
                    {previewData.personal_info.location && (
                      <><br />{previewData.personal_info.location}</>
                    )}
                  </Typography>
                  
                  {/* Skills in sidebar */}
                  {previewData.skills && previewData.skills.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                        {t('Yetenekler')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {previewData.skills.map((skill: any, index: number) => (
                          <Typography key={index} variant="body2" sx={{ 
                            bgcolor: 'rgba(255,255,255,0.1)',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            color: '#fff'
                          }}>
                            {skill.name}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
                <Box sx={styles.mainContent}>
                  {/* Experience */}
                  {previewData.experience && previewData.experience.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
                        {t('Deneyim')}
                      </Typography>
                      {previewData.experience.map((exp: any, index: number) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {exp.title} - {exp.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {exp.start_date} - {exp.end_date || t('Devam Ediyor')}
                          </Typography>
                          <Typography variant="body2">
                            {exp.description}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Education */}
                  {previewData.education && previewData.education.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
                        {t('Eğitim')}
                      </Typography>
                      {previewData.education.map((edu: any, index: number) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {edu.school} - {edu.degree}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {edu.start_date} - {edu.end_date || t('Devam Ediyor')}
                          </Typography>
                          {edu.description && (
                            <Typography variant="body2">
                              {edu.description}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              // Default layout for other templates
              <>
                {/* Header */}
                <Box sx={styles.header}>
                  <Typography variant="h4" gutterBottom sx={styles.title}>
                    {previewData.personal_info.first_name} {previewData.personal_info.last_name}
                  </Typography>
                  <Typography variant="subtitle1" sx={styles.subtitle}>
                    {previewData.personal_info.title}
                  </Typography>
                  <Typography variant="body2" sx={styles.subtitle}>
                    {previewData.personal_info.email} • {previewData.personal_info.phone}
                  </Typography>
                  {previewData.personal_info.location && (
                    <Typography variant="body2" sx={styles.subtitle}>
                      {previewData.personal_info.location}
                    </Typography>
                  )}
                </Box>

                {/* Experience */}
                {previewData.experience && previewData.experience.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
                      {t('Deneyim')}
                    </Typography>
                    {previewData.experience.map((exp: any, index: number) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {exp.title} - {exp.company}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {exp.start_date} - {exp.end_date || t('Devam Ediyor')}
                        </Typography>
                        <Typography variant="body2">
                          {exp.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Education */}
                {previewData.education && previewData.education.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
                      {t('Eğitim')}
                    </Typography>
                    {previewData.education.map((edu: any, index: number) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {edu.school} - {edu.degree}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {edu.start_date} - {edu.end_date || t('Devam Ediyor')}
                        </Typography>
                        {edu.description && (
                          <Typography variant="body2">
                            {edu.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Skills */}
                {previewData.skills && previewData.skills.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
                      {t('Yetenekler')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {previewData.skills.map((skill: any, index: number) => (
                        <Typography key={index} variant="body2" sx={{ 
                          bgcolor: selectedTemplate === 'pdf-minimal' ? '#f5f5f5' : 'action.hover',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1
                        }}>
                          {skill.name}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Languages */}
                {previewData.languages && previewData.languages.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={styles.sectionTitle}>
                      {t('Yabancı Diller')}
                    </Typography>
                    {previewData.languages.map((lang: any, index: number) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="subtitle2">
                          {lang.name} - {lang.level}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setPreviewOpen(false);
              handleGenerateCV();
            }}
            startIcon={<DownloadIcon />}
            sx={{ mt: 2 }}
          >
            {t('PDF CV Oluştur')}
          </Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('CV Şablonu Seçin')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 120,
            }
          }}
        >
          <Tab 
            icon={<WebIcon />} 
            label={t('Web Versiyonu')}
            sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
          />
          <Tab 
            icon={<DownloadIcon />} 
            label={t('PDF Versiyonu')}
            sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
          />
        </Tabs>
      </Box>

      {activeTab === 1 && (
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="tr">Türkçe</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="zh">中文</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: '100%',
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 4,
        },
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          pb: 2, 
          minWidth: 'min-content',
          flexWrap: 'nowrap'
        }}>
          {activeTab === 0 ? (
            <>
              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-modern' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-modern' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'web-modern' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('web-modern')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(modernWebTemplateSvg)}
                  alt="Modern Web Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.web.modern.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.web.modern.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-minimal' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-minimal' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'web-minimal' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('web-minimal')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(classicWebTemplateSvg)}
                  alt="Minimal Web Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.web.minimal.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.web.minimal.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-colorful' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-colorful' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'web-colorful' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('web-colorful')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(colorfulWebTemplateSvg)}
                  alt="Colorful Web Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.web.colorful.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.web.colorful.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-professional' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-professional' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'web-professional' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('web-professional')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(professionalWebTemplateSvg)}
                  alt="Professional Web Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.web.professional.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.web.professional.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-creative' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-creative' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'web-creative' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('web-creative')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(creativeWebTemplateSvg)}
                  alt="Creative Web Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.web.creative.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.web.creative.description')}
                  </Typography>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-modern' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-modern' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-modern' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-modern')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(modernPdfTemplateSvg)}
                  alt="Modern PDF Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.pdf.modern.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.pdf.modern.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-classic' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-classic' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-classic' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-classic')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(classicPdfTemplateSvg)}
                  alt="Classic PDF Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.pdf.classic.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.pdf.classic.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-minimal' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-minimal' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-minimal' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-minimal')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(minimalPdfTemplateSvg)}
                  alt="Minimal PDF Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.pdf.minimal.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.pdf.minimal.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-creative' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-creative' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-creative' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-creative')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(creativePdfTemplateSvg)}
                  alt="Creative PDF Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.pdf.creative.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.pdf.creative.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-professional' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-professional' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-professional' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-professional')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(professionalPdfTemplateSvg)}
                  alt="Professional PDF Template"
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.templates.pdf.professional.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.templates.pdf.professional.description')}
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Box>
          {onPrev && (
            <Button 
              onClick={onPrev} 
              variant="contained"
              disabled={loading}
            >
              {t('Geri')}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handlePreview}
            variant="outlined"
            disabled={!selectedTemplate || loading}
          >
            {previewLoading ? <CircularProgress size={24} /> : t('Önizleme')}
          </Button>
          <Button
            onClick={handleGenerateCV}
            variant="contained"
            color="primary"
            disabled={!selectedTemplate || loading}
            startIcon={activeTab === 0 ? <WebIcon /> : <DownloadIcon />}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeTab === 0 ? (
              t('Web CV Oluştur')
            ) : (
              t('PDF CV Oluştur')
            )}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('Şablon Önizleme')}
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderTemplatePreview()
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={urlModalOpen} onClose={() => setUrlModalOpen(false)}>
        <DialogTitle>{t('CV\'niz Hazır!')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {t('CV\'niz başarıyla oluşturuldu. Aşağıdaki adresten erişebilirsiniz:')}
            </Typography>
            <TextField
              fullWidth
              value={generatedUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopyUrl}>
                    <CopyIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUrlModalOpen(false);
          }}>{t('Kapat')}</Button>
          <Button
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<WebIcon />}
          >
            {t('CV\'yi Aç')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message={t('URL panoya kopyalandı!')}
      />
    </Box>
  );
};

export default TemplatePreviewForm; 