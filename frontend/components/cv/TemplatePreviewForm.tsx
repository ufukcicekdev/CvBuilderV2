import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Snackbar,
  FormControl,
  Select,
  MenuItem,
  Modal,
  InputLabel,
  ListSubheader,
  CardActions
} from '@mui/material';
import { Download as DownloadIcon, Language as WebIcon, ContentCopy as CopyIcon, Close as CloseIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-hot-toast';
import ModernTemplate from '@/templates/web/ModernTemplate';
import MinimalTemplate from '@/templates/web/MinimalTemplate';
import ColorfulTemplate from '@/templates/web/ColorfulTemplate';
import ProfessionalTemplate from '@/templates/web/ProfessionalTemplate';
import CreativeTemplate from '@/templates/web/CreativeTemplate';
import { CV } from '@/types/cv';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactDOM from 'react-dom/client';
import { templateInfo, getTemplateById } from '../pdf-templates/index';
import PdfGenerator from '../pdf-templates/PdfGenerator';
import { templateService } from '../../services/templateService';
// Dynamic imports for client-side only components
import CustomTemplateRenderer from '../pdf-templates/CustomTemplateRenderer';
import { CustomTemplateData } from '../pdf-templates/TemplateBuilder';
import { useSession } from 'next-auth/react';

// Create a client-only wrapper component for TemplateBuilder
const ClientOnlyTemplateBuilder = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    // Extra safety check to patch React.useId
    if (typeof window !== 'undefined') {
      import('html2pdf.js');
    }
    
    // Set a small delay before mounting to ensure hydration is complete
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!hasMounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return <>{children}</>;
};

// Dynamically import our specialized NoSSRTemplateBuilder that doesn't use drag-and-drop
const NoSSRTemplateBuilder = dynamic(
  () => import('../../components/pdf-templates/NoSSRTemplateBuilder'),
  { 
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
  }
);

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
  const { data: session } = useSession();
  const user = session?.user;
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [previewData, setPreviewData] = useState<CV | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('tr');
  const [previewSelectedLanguage, setPreviewSelectedLanguage] = useState<string>('tr');
  const [selectedTab, setSelectedTab] = useState(0);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateData[]>([]);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<CustomTemplateData | null>(null);
  const [previewTabIndex, setPreviewTabIndex] = useState(0);
  const [templateBuilderLoaded, setTemplateBuilderLoaded] = useState(false);
  
  // html2pdf'yi sadece client-side'da yükle - state kullanmayalım, doğrudan çağıralım
  useEffect(() => {
    // HTML2PDF modulünü yüklediğimizden emin olalım, ancak bunu state'e kaydetmeyelim
    if (typeof window !== 'undefined') {
      import('html2pdf.js');
    }
  }, []);

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
        toast.error(t('cv.preview.loadError'));
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchCVData();
  }, [cvId, t]);

  useEffect(() => {
    const fetchCustomTemplates = async () => {
      try {
        const templates = await templateService.getCustomTemplates(user?.id);
        setCustomTemplates(templates);
      } catch (error) {
        console.error('Error fetching custom templates:', error);
      }
    };
    
    if (open) {
      fetchCustomTemplates();
    }
  }, [open, user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handlePreview = async () => {
    if (!selectedTemplate) {
      toast.error(t('cv.preview.selectTemplate'));
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
      setOpen(true);
    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast.error(t('cv.preview.loadError'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopySuccess(true);
    } catch (error) {
      toast.error(t('cv.preview.copyError'));
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
      'pdf-template1': 'template1',
      'pdf-template2': 'template2'
    };

    if (templateId.startsWith('web-')) {
      return webTemplateMap[templateId] || templateId;
    } else {
      return pdfTemplateMap[templateId] || 'template1'; // Varsayılan olarak template1'i döndür
    }
  };

  const handlePreviewLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPreviewSelectedLanguage(event.target.value as string);
    // Dili değiştirdiğimizde önizlemeyi güncelle
    if (open && previewData) {
      // Önizleme verilerini dil değişimine göre güncelle
      fetchPreviewDataForLanguage(event.target.value as string);
    }
  };

  const fetchPreviewDataForLanguage = async (lang: string) => {
    try {
      setPreviewLoading(true);
      const response = await axiosInstance.get(`/api/cvs/${cvId}/`, {
        headers: {
          'Accept-Language': lang
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
    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast.error(t('cv.preview.loadError'));
    } finally {
      setPreviewLoading(false);
    }
  };

  // Template önizleme ekranında PDF şablonunu göster
  const renderPreviewContent = () => {
    if (previewLoading) {
      return <CircularProgress />;
    }

    if (!previewData || !selectedTemplate) {
      return <Typography>{t('cv.preview.noData')}</Typography>;
    }

    // Verileri hazırla
    const mappedData = {
      id: previewData.id ? String(previewData.id) : undefined,
      title: previewData.title,
      personal_info: {
        ...previewData.personal_info,
        photo: previewData.personal_info?.photo || undefined
      },
      experience: previewData.experience?.map(exp => ({
        ...exp,
        id: exp.id ? String(exp.id) : undefined,
        end_date: exp.end_date === null ? undefined : exp.end_date
      })),
      education: previewData.education?.map(edu => ({
        ...edu,
        id: edu.id ? String(edu.id) : undefined,
        end_date: edu.end_date === null ? undefined : edu.end_date
      })),
      skills: previewData.skills?.map(skill => ({
        ...skill,
        id: skill.id ? String(skill.id) : undefined,
        level: typeof skill.level === 'string' ? parseInt(skill.level, 10) || 3 : skill.level
      })),
      languages: previewData.languages?.map(lang => ({
        ...lang,
        id: lang.id ? String(lang.id) : undefined,
        level: typeof lang.level === 'string' ? parseInt(lang.level, 10) || 3 : lang.level
      })),
      certificates: previewData.certificates?.map(cert => ({
        ...cert,
        id: cert.id ? String(cert.id) : undefined
      })),
      // Çeviri verilerini doğrudan tanımlayalım
      i18n: {
        summary: translations[previewSelectedLanguage]?.summary || translations.tr?.summary || 'Summary',
        experience: translations[previewSelectedLanguage]?.experience || translations.tr?.experience || 'Experience',
        education: translations[previewSelectedLanguage]?.education || translations.tr?.education || 'Education',
        skills: translations[previewSelectedLanguage]?.skills || translations.tr?.skills || 'Skills',
        languages: translations[previewSelectedLanguage]?.languages || translations.tr?.languages || 'Languages',
        certificates: translations[previewSelectedLanguage]?.certificates || translations.tr?.certificates || 'Certificates',
        present: translations[previewSelectedLanguage]?.present || translations.tr?.present || 'Present'
      }
    };

    // Web şablonları için içerik
    if (selectedTemplate?.startsWith('web-')) {
      const templates = {
        'web-modern': ModernTemplate,
        'web-minimal': MinimalTemplate,
        'web-colorful': ColorfulTemplate,
        'web-professional': ProfessionalTemplate,
        'web-creative': CreativeTemplate,
      };

      const TemplateComponent = templates[selectedTemplate as keyof typeof templates];
      if (TemplateComponent) {
        return (
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <TemplateComponent cv={previewData} />
          </Box>
        );
      }
    } else {
      // PDF şablonları için içerik
      return (
        <PdfGenerator 
          data={mappedData}
          language={previewSelectedLanguage}
          translations={translations[previewSelectedLanguage] || translations.tr}
        />
      );
    }

    return <Typography>{t('cv.preview.templateNotFound')}</Typography>;
  };

  // Frontend'de PDF oluşturma fonksiyonu
  const generatePdfInFrontend = async (data: any) => {
    try {
      if (!selectedTemplate) {
        throw new Error('No template selected');
      }

      // Tarayıcı ortamında olduğumuzu kontrol et
      if (typeof window === 'undefined') {
        return { success: false, error: 'This function can only be run in the browser' };
      }

      // Seçilen template ID'sini uygun formata dönüştür
      const formattedTemplateId = mapTemplateIdToUrlFormat(selectedTemplate);
      console.log('Selected template format:', formattedTemplateId);

      // Profil resmi ekleyerek veriyi oluşturalım
      const enhancedData = {
        ...data,
        personal_info: {
          ...data.personal_info,
          // Profil resmi 'photo' alanında
          photo: data.personal_info?.photo || undefined
        },
        // Çeviri verilerini doğrudan ekle
        i18n: {
          summary: translations[previewSelectedLanguage]?.summary || translations.tr?.summary || 'Summary',
          experience: translations[previewSelectedLanguage]?.experience || translations.tr?.experience || 'Experience',
          education: translations[previewSelectedLanguage]?.education || translations.tr?.education || 'Education',
          skills: translations[previewSelectedLanguage]?.skills || translations.tr?.skills || 'Skills',
          languages: translations[previewSelectedLanguage]?.languages || translations.tr?.languages || 'Languages',
          certificates: translations[previewSelectedLanguage]?.certificates || translations.tr?.certificates || 'Certificates',
          present: translations[previewSelectedLanguage]?.present || translations.tr?.present || 'Present'
        }
      };

      // Event oluştur ve özel bir olay tetikle
      const event = new CustomEvent('generate-pdf', {
        detail: {
          templateId: formattedTemplateId,
          data: enhancedData,
          language: previewSelectedLanguage,
          translations: translations[previewSelectedLanguage] || translations.tr
        }
      });
      document.dispatchEvent(event);
      
      // Bilgilendirme mesajı göster
      toast.success(t('cv.preview.pdfGenerating'));

      return { success: true };
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('cv.preview.pdfError'));
      return { success: false, error };
    }
  };

  // PDF oluşturma fonksiyonu (frontend versiyonuyla değiştir)
  const handleGenerateCV = async () => {
    if (!selectedTemplate) {
      toast.error(t('cv.preview.selectTemplate'));
      return;
    }

    try {
      setLoading(true);
      
      const isWebTemplate = selectedTemplate.startsWith('web-');
      const templateFormat = mapTemplateIdToUrlFormat(selectedTemplate);
      
      if (isWebTemplate) {
        // Web template için backend API'yi kullan (değişiklik yok)
        const response = await axiosInstance.post(`/api/cvs/${cvId}/generate-web/`, {
          template_id: templateFormat,
          language: selectedLanguage
        });
        
        const webUrl = response.data.web_url;
        const baseUrl = window.location.origin;
        const fullUrl = webUrl.startsWith('/') ? `${baseUrl}${webUrl}` : `${baseUrl}/${webUrl}`;
        
        setGeneratedUrl(fullUrl);
        setUrlModalOpen(true);
      } else {
        // PDF için frontend'de oluştur
        // Önce CV verilerini API'den al
        const cvResponse = await axiosInstance.get(`/api/cvs/${cvId}/?language=${selectedLanguage}`);
        const cvData = cvResponse.data;
        
        // Frontend'de PDF oluştur
        const result = await generatePdfInFrontend(cvData);
        
        if (result && result.success) {
          // Başarılı mesajı göster
          toast.success(t('cv.preview.downloadSuccess'));
        }
      }

    } catch (error) {
      console.error('Error generating CV:', error);
      toast.error(t('cv.preview.generateError'));
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
      setLoading(true);
      await handleGenerateCV();
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error(t('cv.preview.completeError'));
    } finally {
      setLoading(false);
    }
  };

  // Çeviri nesnesi - PDF içinde kullanılmak üzere
  const translations: Record<string, Record<string, string>> = {
    en: {
      summary: "Professional Summary",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      languages: "Languages",
      certificates: "Certificates",
      present: "Present",
      skill_level: 'out of 5',
      // Web template translations
      'cv.template.templates.modernWeb.name': t('cv.template.templates.modernWeb.name'),
      'cv.template.templates.modernWeb.description': t('cv.template.templates.modernWeb.description'),
      'cv.template.templates.minimalWeb.name': t('cv.template.templates.minimalWeb.name'),
      'cv.template.templates.minimalWeb.description': t('cv.template.templates.minimalWeb.description'),
      'cv.template.templates.colorfulWeb.name': t('cv.template.templates.colorfulWeb.name'),
      'cv.template.templates.colorfulWeb.description': t('cv.template.templates.colorfulWeb.description'),
      'cv.template.templates.professionalWeb.name': t('cv.template.templates.professionalWeb.name'),
      'cv.template.templates.professionalWeb.description': t('cv.template.templates.professionalWeb.description'),
      'cv.template.templates.creativeWeb.name': t('cv.template.templates.creativeWeb.name'),
      'cv.template.templates.creativeWeb.description': t('cv.template.templates.creativeWeb.description'),
      // PDF template translations
      'cv.template.templates.modernPdf.name': t('cv.template.templates.modernPdf.name'),
      'cv.template.templates.modernPdf.description': t('cv.template.templates.modernPdf.description'),
      'cv.template.templates.classicPdf.name': t('cv.template.templates.classicPdf.name'),
      'cv.template.templates.classicPdf.description': t('cv.template.templates.classicPdf.description'),
      'cv.template.templates.minimalPdf.name': t('cv.template.templates.minimalPdf.name'),
      'cv.template.templates.minimalPdf.description': t('cv.template.templates.minimalPdf.description'),
      'cv.template.templates.creativePdf.name': t('cv.template.templates.creativePdf.name'),
      'cv.template.templates.creativePdf.description': t('cv.template.templates.creativePdf.description'),
      'cv.template.templates.professionalPdf.name': t('cv.template.templates.professionalPdf.name'),
      'cv.template.templates.professionalPdf.description': t('cv.template.templates.professionalPdf.description')
    },
    tr: {
      summary: "Profesyonel Özet",
      experience: "İş Deneyimi",
      education: "Eğitim Bilgileri",
      skills: "Beceriler",
      languages: "Diller",
      certificates: "Sertifikalar",
      present: "Halen",
      skill_level: '/ 5',
      // Web template translations
      'cv.template.templates.modernWeb.name': t('cv.template.templates.modernWeb.name'),
      'cv.template.templates.modernWeb.description': t('cv.template.templates.modernWeb.description'),
      'cv.template.templates.minimalWeb.name': t('cv.template.templates.minimalWeb.name'),
      'cv.template.templates.minimalWeb.description': t('cv.template.templates.minimalWeb.description'),
      'cv.template.templates.colorfulWeb.name': t('cv.template.templates.colorfulWeb.name'),
      'cv.template.templates.colorfulWeb.description': t('cv.template.templates.colorfulWeb.description'),
      'cv.template.templates.professionalWeb.name': t('cv.template.templates.professionalWeb.name'),
      'cv.template.templates.professionalWeb.description': t('cv.template.templates.professionalWeb.description'),
      'cv.template.templates.creativeWeb.name': t('cv.template.templates.creativeWeb.name'),
      'cv.template.templates.creativeWeb.description': t('cv.template.templates.creativeWeb.description'),
      // PDF template translations
      'cv.template.templates.modernPdf.name': t('cv.template.templates.modernPdf.name'),
      'cv.template.templates.modernPdf.description': t('cv.template.templates.modernPdf.description'),
      'cv.template.templates.classicPdf.name': t('cv.template.templates.classicPdf.name'),
      'cv.template.templates.classicPdf.description': t('cv.template.templates.classicPdf.description'),
      'cv.template.templates.minimalPdf.name': t('cv.template.templates.minimalPdf.name'),
      'cv.template.templates.minimalPdf.description': t('cv.template.templates.minimalPdf.description'),
      'cv.template.templates.creativePdf.name': t('cv.template.templates.creativePdf.name'),
      'cv.template.templates.creativePdf.description': t('cv.template.templates.creativePdf.description'),
      'cv.template.templates.professionalPdf.name': t('cv.template.templates.professionalPdf.name'),
      'cv.template.templates.professionalPdf.description': t('cv.template.templates.professionalPdf.description')
    }
  };

  // SVG içeriklerini güncelleyelim - Template1 için
  const template1Svg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
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

  // Template2 için SVG
  const template2Svg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="#fff"/>
    <rect x="0" y="0" width="400" height="60" fill="#1976D2"/>
    <rect x="20" y="15" width="180" height="15" rx="2" fill="#fff"/>
    <rect x="20" y="35" width="120" height="10" rx="2" fill="#e0e0e0"/>
    <rect x="300" y="20" width="80" height="10" rx="2" fill="#fff"/>
    <rect x="300" y="35" width="80" height="10" rx="2" fill="#fff"/>
    <rect x="20" y="80" width="170" height="15" rx="2" fill="#1976D2"/>
    <rect x="20" y="105" width="360" height="10" rx="2" fill="#666"/>
    <rect x="20" y="125" width="360" height="10" rx="2" fill="#666"/>
    <rect x="20" y="160" width="170" height="15" rx="2" fill="#1976D2"/>
    <rect x="20" y="185" width="360" height="10" rx="2" fill="#666"/>
    <rect x="20" y="205" width="360" height="10" rx="2" fill="#666"/>
    <rect x="20" y="240" width="170" height="15" rx="2" fill="#1976D2"/>
    <rect x="20" y="265" width="170" height="10" rx="2" fill="#666"/>
    <rect x="210" y="265" width="170" height="10" rx="2" fill="#666"/>
  </svg>`;

  // Özel şablonu kaydet
  const handleSaveTemplate = async (templateData: CustomTemplateData) => {
    try {
      const saved = await templateService.saveCustomTemplate(templateData, user?.id);
      
      // Şablonları güncelle
      setCustomTemplates(prev => {
        const exists = prev.some(t => t.id === saved.id);
        if (exists) {
          return prev.map(t => t.id === saved.id ? saved : t);
        }
        return [...prev, saved];
      });
      
      setSelectedCustomTemplate(saved);
      toast.success(t('cv.template.savedSuccess'));
      return saved;
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(t('cv.template.savedError'));
      throw error;
    }
  };
  
  // Özel şablonu sil
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templateService.deleteCustomTemplate(templateId, user?.id);
      
      // Şablonları güncelle
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
      
      if (selectedCustomTemplate?.id === templateId) {
        setSelectedCustomTemplate(null);
      }
      
      toast.success(t('cv.template.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(t('cv.template.deleteError'));
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Aktif önizleme sekmesini değiştiren fonksiyon
  const handlePreviewTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // If switching to template builder tab, first show a loading state
    if (newValue === 2 && !templateBuilderLoaded) {
      setTemplateBuilderLoaded(false);
      // Delay loading the template builder by 1 second
      setTimeout(() => {
        setTemplateBuilderLoaded(true);
      }, 1000);
    }
    setPreviewTabIndex(newValue);
  };

  // Şablon önizleme diyaloğunda dialog içeriğini render eder
  const renderPreviewDialog = () => {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {t('cv.preview.title')}
            {/* Dil seçimi */}
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="preview-language-label">{t('common.language')}</InputLabel>
              <Select
                labelId="preview-language-label"
                value={previewSelectedLanguage}
                onChange={(e) => handlePreviewLanguageChange(e as any)}
                label={t('common.language')}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="tr">Türkçe</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <IconButton edge="end" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={previewTabIndex} onChange={handlePreviewTabChange} aria-label="preview tabs">
            <Tab label={t('cv.preview.standardTemplates')} />
            <Tab label={t('cv.preview.customTemplates')} />
            <Tab label={t('cv.preview.customBuilderTab')} />
          </Tabs>
        </Box>
        
        <DialogContent>
          {previewTabIndex === 0 && (
            <Box>
              {renderPreviewContent()}
            </Box>
          )}
          
          {previewTabIndex === 1 && (
            <Box>
              {customTemplates.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('cv.preview.savedTemplates')}
                  </Typography>
                  <Grid container spacing={2}>
                    {customTemplates.map((template) => (
                      <Grid item xs={12} sm={6} md={4} key={template.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: selectedCustomTemplate?.id === template.id ? 2 : 1,
                            borderColor: selectedCustomTemplate?.id === template.id ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            bgcolor: selectedCustomTemplate?.id === template.id ? 'action.selected' : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 3,
                            },
                          }}
                          onClick={() => {
                            setSelectedCustomTemplate(template);
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6">{template.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(template.updatedAt).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              {t('common.delete')}
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    {t('cv.preview.noCustomTemplates')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setPreviewTabIndex(2)}
                  >
                    {t('cv.preview.createCustomTemplate')}
                  </Button>
                </Box>
              )}
              
              {selectedCustomTemplate && previewData && (
                <Box sx={{ mt: 4 }}>
                  <CustomTemplateRenderer
                    data={{
                      id: previewData.id ? String(previewData.id) : undefined,
                      title: previewData.title,
                      personal_info: {
                        ...previewData.personal_info,
                        photo: previewData.personal_info?.photo || undefined
                      },
                      experience: previewData.experience?.map(exp => ({
                        ...exp,
                        id: exp.id ? String(exp.id) : undefined,
                        end_date: exp.end_date === null ? undefined : exp.end_date
                      })),
                      education: previewData.education?.map(edu => ({
                        ...edu,
                        id: edu.id ? String(edu.id) : undefined,
                        end_date: edu.end_date === null ? undefined : edu.end_date
                      })),
                      skills: previewData.skills?.map(skill => ({
                        ...skill,
                        id: skill.id ? String(skill.id) : undefined,
                        level: typeof skill.level === 'string' ? parseInt(skill.level, 10) || 3 : skill.level
                      })),
                      languages: previewData.languages?.map(lang => ({
                        ...lang,
                        id: lang.id ? String(lang.id) : undefined,
                        level: typeof lang.level === 'string' ? parseInt(lang.level, 10) || 3 : lang.level
                      })),
                      certificates: previewData.certificates?.map(cert => ({
                        ...cert,
                        id: cert.id ? String(cert.id) : undefined
                      })),
                      i18n: {
                        summary: translations[previewSelectedLanguage]?.summary || translations.tr?.summary || 'Summary',
                        experience: translations[previewSelectedLanguage]?.experience || translations.tr?.experience || 'Experience',
                        education: translations[previewSelectedLanguage]?.education || translations.tr?.education || 'Education',
                        skills: translations[previewSelectedLanguage]?.skills || translations.tr?.skills || 'Skills',
                        languages: translations[previewSelectedLanguage]?.languages || translations.tr?.languages || 'Languages',
                        certificates: translations[previewSelectedLanguage]?.certificates || translations.tr?.certificates || 'Certificates',
                        present: translations[previewSelectedLanguage]?.present || translations.tr?.present || 'Present'
                      }
                    }}
                    language={previewSelectedLanguage}
                    translations={translations[previewSelectedLanguage] || translations.tr || {}}
                    templateData={selectedCustomTemplate}
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<DownloadIcon />}
                      onClick={() => generatePdfInFrontend(previewData)}
                    >
                      {t('cv.preview.downloadPdf')}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          {previewTabIndex === 2 && previewData && (
            <div className="template-builder-container">
              {!templateBuilderLoaded ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Loading template builder...
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      This may take a moment to load
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <ClientOnlyTemplateBuilder>
                  <NoSSRTemplateBuilder
                    data={{
                      id: previewData.id ? String(previewData.id) : undefined,
                      title: previewData.title,
                      personal_info: {
                        ...previewData.personal_info,
                        photo: previewData.personal_info?.photo || undefined
                      },
                      experience: previewData.experience?.map(exp => ({
                        ...exp,
                        id: exp.id ? String(exp.id) : undefined,
                        end_date: exp.end_date === null ? undefined : exp.end_date
                      })),
                      education: previewData.education?.map(edu => ({
                        ...edu,
                        id: edu.id ? String(edu.id) : undefined,
                        end_date: edu.end_date === null ? undefined : edu.end_date
                      })),
                      skills: previewData.skills?.map(skill => ({
                        ...skill,
                        id: skill.id ? String(skill.id) : undefined,
                        level: typeof skill.level === 'string' ? parseInt(skill.level, 10) || 3 : skill.level
                      })),
                      languages: previewData.languages?.map(lang => ({
                        ...lang,
                        id: lang.id ? String(lang.id) : undefined,
                        level: typeof lang.level === 'string' ? parseInt(lang.level, 10) || 3 : lang.level
                      })),
                      certificates: previewData.certificates?.map(cert => ({
                        ...cert,
                        id: cert.id ? String(cert.id) : undefined
                      })),
                      i18n: {
                        summary: translations[previewSelectedLanguage]?.summary || translations.tr?.summary || 'Summary',
                        experience: translations[previewSelectedLanguage]?.experience || translations.tr?.experience || 'Experience',
                        education: translations[previewSelectedLanguage]?.education || translations.tr?.education || 'Education',
                        skills: translations[previewSelectedLanguage]?.skills || translations.tr?.skills || 'Skills',
                        languages: translations[previewSelectedLanguage]?.languages || translations.tr?.languages || 'Languages',
                        certificates: translations[previewSelectedLanguage]?.certificates || translations.tr?.certificates || 'Certificates',
                        present: translations[previewSelectedLanguage]?.present || translations.tr?.present || 'Present'
                      }
                    }}
                    language={previewSelectedLanguage}
                    translations={translations[previewSelectedLanguage] || translations.tr || {}}
                    onSaveTemplate={handleSaveTemplate}
                    savedTemplates={customTemplates}
                  />
                </ClientOnlyTemplateBuilder>
              )}
            </div>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('cv.template.selectTitle')}
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
            label={t('cv.template.webVersion')}
            sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
          />
          <Tab 
            icon={<DownloadIcon />} 
            label={t('cv.template.pdfVersion')}
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
                  alt={t('cv.template.templates.modernWeb.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.modernWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.modernWeb.description')}
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
                  alt={t('cv.template.templates.minimalWeb.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.minimalWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.minimalWeb.description')}
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
                  alt={t('cv.template.templates.colorfulWeb.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.colorfulWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.colorfulWeb.description')}
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
                  alt={t('cv.template.templates.professionalWeb.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.professionalWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.professionalWeb.description')}
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
                  alt={t('cv.template.templates.creativeWeb.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.creativeWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.creativeWeb.description')}
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
                  border: selectedTemplate === 'pdf-template1' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-template1' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-template1' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-template1')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(professionalPdfTemplateSvg)}
                  alt={t('cv.template.templates.modernPdf.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.modernPdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.modernPdf.description')}
                  </Typography>
                </CardContent>
              </Card>

              <Card 
                sx={{ 
                  width: 240,
                  minWidth: 240,
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-template2' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-template2' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedTemplate === 'pdf-template2' ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect('pdf-template2')}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={svgToDataUrl(elegantPdfTemplateSvg)}
                  alt={t('cv.template.templates.professionalPdf.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.professionalPdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.professionalPdf.description')}
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
              {t('common.previous')}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handlePreview}
            variant="outlined"
            disabled={!selectedTemplate || loading}
          >
            {previewLoading ? <CircularProgress size={24} /> : t('cv.template.preview')}
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
              t('cv.template.generateWeb')
            ) : (
              t('cv.template.generatePDF')
            )}
          </Button>
        </Box>
      </Box>

      {renderPreviewDialog()}

      <Dialog open={urlModalOpen} onClose={() => setUrlModalOpen(false)}>
        <DialogTitle>{t('cv.preview.ready')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {t('cv.preview.createSuccess')}
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
          }}>{t('cv.preview.close')}</Button>
          <Button
            href={generatedUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<WebIcon />}
          >
            {t('cv.preview.openCv')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        message={t('cv.preview.urlCopied')}
      />
    </Box>
  );
};

export default TemplatePreviewForm; 