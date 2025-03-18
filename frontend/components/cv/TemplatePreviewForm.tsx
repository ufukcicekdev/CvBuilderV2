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
// İmport kısmına eklenecek
import { CustomTemplateData as NoDndCustomTemplateData } from '../pdf-templates/NoDndTemplateBuilder';
import { CustomTemplateData as TemplateBuilderCustomTemplateData } from '../pdf-templates/TemplateBuilder';

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
      // Section visibility translations
      sectionVisibility: "Section Visibility",
      header: "Header",
      layout: "Layout",
      layoutSettings: "Layout Settings",
      showPhoto: "Show Photo",
      photoStyle: "Photo Style",
      photoSize: "Photo Size",
      colors: "Colors",
      typography: "Typography",
      primaryColor: "Primary Color",
      secondaryColor: "Secondary Color",
      backgroundColor: "Background Color",
      textColor: "Text Color",
      fontSize: "Font Size",
      fontFamily: "Font Family",
      // Layout options
      singleColumn: "Single Column",
      doubleColumn: "Double Column",
      // Photo styles
      circle: "Circle",
      square: "Square",
      rounded: "Rounded",
      // ATS related
      atsOptimization: "ATS Optimization",
      enableAtsOptimization: "Enable ATS Optimization",
      atsExplanation: "Optimizes your CV for better scanning by ATS (Applicant Tracking Systems)",
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
      // Section visibility translations
      sectionVisibility: "Bölüm Görünürlüğü",
      header: "Başlık",
      layout: "Düzen",
      layoutSettings: "Düzen Ayarları",
      showPhoto: "Fotoğraf Göster",
      photoStyle: "Fotoğraf Stili",
      photoSize: "Fotoğraf Boyutu",
      colors: "Renkler",
      typography: "Tipografi",
      primaryColor: "Ana Renk",
      secondaryColor: "İkincil Renk",
      backgroundColor: "Arka Plan Rengi",
      textColor: "Yazı Rengi",
      fontSize: "Yazı Boyutu",
      fontFamily: "Yazı Tipi",
      // Layout options
      singleColumn: "Tek Sütun",
      doubleColumn: "Çift Sütun",
      // Photo styles
      circle: "Yuvarlak",
      square: "Kare",
      rounded: "Yuvarlatılmış",
      // ATS related
      atsOptimization: "ATS Optimizasyonu",
      enableAtsOptimization: "ATS Optimizasyonunu Etkinleştir",
      atsExplanation: "CV'nizi ATS (Başvuru Takip Sistemleri) tarafından daha iyi taranması için optimize eder",
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
    ar: {
      summary: "ملخص مهني",
      experience: "الخبرة العملية",
      education: "التعليم",
      skills: "المهارات",
      languages: "اللغات",
      certificates: "الشهادات",
      present: "حتى الآن",
      skill_level: 'من 5',
      // Section visibility translations
      sectionVisibility: "رؤية الأقسام",
      header: "العنوان",
      layout: "التخطيط",
      layoutSettings: "إعدادات التخطيط",
      showPhoto: "إظهار الصورة",
      photoStyle: "نمط الصورة",
      photoSize: "حجم الصورة",
      colors: "الألوان",
      typography: "الطباعة",
      primaryColor: "اللون الرئيسي",
      secondaryColor: "اللون الثانوي",
      backgroundColor: "لون الخلفية",
      fontSize: "حجم الخط",
      fontFamily: "نوع الخط",
      // Layout options
      singleColumn: "عمود واحد",
      doubleColumn: "عمودان",
      // Photo styles
      circle: "دائرة",
      square: "مربع",
      rounded: "مستدير",
      // ATS related
      atsOptimization: "تحسين ATS",
      enableAtsOptimization: "تفعيل تحسين ATS",
      atsExplanation: "يحسن سيرتك الذاتية للمسح الأفضل بواسطة ATS (أنظمة تتبع المتقدمين)",
      // Web template translations
      'cv.template.templates.modernWeb.name': "قالب ويب حديث",
      'cv.template.templates.modernWeb.description': "قالب بتصميم عصري وأنيق مع تخطيط نظيف",
      'cv.template.templates.minimalWeb.name': "قالب ويب بسيط",
      'cv.template.templates.minimalWeb.description': "تصميم بسيط وأنيق يركز على المحتوى",
      'cv.template.templates.colorfulWeb.name': "قالب ويب ملون",
      'cv.template.templates.colorfulWeb.description': "قالب ملون يبرز مهاراتك وخبراتك",
      'cv.template.templates.professionalWeb.name': "قالب ويب احترافي",
      'cv.template.templates.professionalWeb.description': "قالب احترافي مناسب للمجالات التقليدية",
      'cv.template.templates.creativeWeb.name': "قالب ويب إبداعي",
      'cv.template.templates.creativeWeb.description': "قالب مبتكر للمهن الإبداعية والتصميم",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "قالب PDF حديث",
      'cv.template.templates.modernPdf.description': "تصميم أنيق وعصري لسيرتك الذاتية",
      'cv.template.templates.classicPdf.name': "قالب PDF كلاسيكي",
      'cv.template.templates.classicPdf.description': "قالب تقليدي مناسب لجميع المجالات",
      'cv.template.templates.minimalPdf.name': "قالب PDF بسيط",
      'cv.template.templates.minimalPdf.description': "تصميم بسيط وواضح للسيرة الذاتية",
      'cv.template.templates.creativePdf.name': "قالب PDF إبداعي",
      'cv.template.templates.creativePdf.description': "قالب مبتكر يظهر شخصيتك وإبداعك",
      'cv.template.templates.professionalPdf.name': "قالب PDF احترافي",
      'cv.template.templates.professionalPdf.description': "قالب رسمي واحترافي للمهنيين"
    },
    zh: {
      summary: "专业摘要",
      experience: "工作经验",
      education: "教育背景",
      skills: "技能",
      languages: "语言能力",
      certificates: "证书",
      present: "至今",
      skill_level: '/ 5分',
      // Section visibility translations
      sectionVisibility: "板块可见性",
      header: "页眉",
      layout: "布局",
      layoutSettings: "布局设置",
      showPhoto: "显示照片",
      photoStyle: "照片样式",
      photoSize: "照片大小",
      colors: "颜色",
      typography: "排版",
      primaryColor: "主色",
      secondaryColor: "次色",
      backgroundColor: "背景色",
      fontSize: "字体大小",
      fontFamily: "字体",
      // Layout options
      singleColumn: "单栏",
      doubleColumn: "双栏",
      // Photo styles
      circle: "圆形",
      square: "方形",
      rounded: "圆角",
      // ATS related
      atsOptimization: "ATS优化",
      enableAtsOptimization: "启用ATS优化",
      atsExplanation: "优化您的简历以便于ATS（申请人跟踪系统）更好地扫描",
      // Web template translations
      'cv.template.templates.modernWeb.name': "现代网页模板",
      'cv.template.templates.modernWeb.description': "清新现代的设计布局",
      'cv.template.templates.minimalWeb.name': "简约网页模板",
      'cv.template.templates.minimalWeb.description': "专注于内容的简约设计",
      'cv.template.templates.colorfulWeb.name': "多彩网页模板",
      'cv.template.templates.colorfulWeb.description': "生动多彩的设计突显您的技能",
      'cv.template.templates.professionalWeb.name': "专业网页模板",
      'cv.template.templates.professionalWeb.description': "适合传统行业的专业设计",
      'cv.template.templates.creativeWeb.name': "创意网页模板",
      'cv.template.templates.creativeWeb.description': "适合创意职业的独特设计",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "现代PDF简历",
      'cv.template.templates.modernPdf.description': "时尚现代的PDF简历设计",
      'cv.template.templates.classicPdf.name': "经典PDF简历",
      'cv.template.templates.classicPdf.description': "适合各行业的传统简历格式",
      'cv.template.templates.minimalPdf.name': "简约PDF简历",
      'cv.template.templates.minimalPdf.description': "简洁清晰的简历布局",
      'cv.template.templates.creativePdf.name': "创意PDF简历",
      'cv.template.templates.creativePdf.description': "展示个性与创造力的模板",
      'cv.template.templates.professionalPdf.name': "专业PDF简历",
      'cv.template.templates.professionalPdf.description': "正式专业的简历设计"
    },
    hi: {
      summary: "पेशेवर सारांश",
      experience: "कार्य अनुभव",
      education: "शिक्षा",
      skills: "कौशल",
      languages: "भाषाएँ",
      certificates: "प्रमाणपत्र",
      present: "वर्तमान",
      skill_level: '5 में से',
      // Section visibility translations
      sectionVisibility: "अनुभाग दृश्यता",
      header: "शीर्षक",
      layout: "लेआउट",
      layoutSettings: "लेआउट सेटिंग्स",
      showPhoto: "फोटो दिखाएं",
      photoStyle: "फोटो शैली",
      photoSize: "फोटो आकार",
      colors: "रंग",
      typography: "टाइपोग्राफी",
      primaryColor: "प्राथमिक रंग",
      secondaryColor: "द्वितीयक रंग",
      backgroundColor: "पृष्ठभूमि रंग",
      fontSize: "फॉन्ट आकार",
      fontFamily: "फॉन्ट परिवार",
      // Layout options
      singleColumn: "एकल कॉलम",
      doubleColumn: "दोहरा कॉलम",
      // Photo styles
      circle: "गोल",
      square: "वर्ग",
      rounded: "गोलाकार",
      // ATS related
      atsOptimization: "ATS अनुकूलन",
      enableAtsOptimization: "ATS अनुकूलन सक्षम करें",
      atsExplanation: "आपके CV को ATS (आवेदक ट्रैकिंग सिस्टम) द्वारा बेहतर स्कैनिंग के लिए अनुकूलित करता है",
      // Web template translations
      'cv.template.templates.modernWeb.name': "आधुनिक वेब टेम्प्लेट",
      'cv.template.templates.modernWeb.description': "साफ और आधुनिक डिजाइन के साथ",
      'cv.template.templates.minimalWeb.name': "मिनिमल वेब टेम्प्लेट",
      'cv.template.templates.minimalWeb.description': "सामग्री पर केंद्रित सरल डिज़ाइन",
      'cv.template.templates.colorfulWeb.name': "रंगीन वेब टेम्प्लेट",
      'cv.template.templates.colorfulWeb.description': "आपके कौशल को उजागर करने वाला रंगीन डिज़ाइन",
      'cv.template.templates.professionalWeb.name': "पेशेवर वेब टेम्प्लेट",
      'cv.template.templates.professionalWeb.description': "पारंपरिक क्षेत्रों के लिए उपयुक्त व्यावसायिक डिज़ाइन",
      'cv.template.templates.creativeWeb.name': "क्रिएटिव वेब टेम्प्लेट",
      'cv.template.templates.creativeWeb.description': "रचनात्मक पेशेवरों के लिए अनोखा डिज़ाइन",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "आधुनिक PDF बायोडाटा",
      'cv.template.templates.modernPdf.description': "स्टाइलिश और आधुनिक रिज्यूमे डिज़ाइन",
      'cv.template.templates.classicPdf.name': "क्लासिक PDF बायोडाटा",
      'cv.template.templates.classicPdf.description': "सभी क्षेत्रों के लिए पारंपरिक प्रारूप",
      'cv.template.templates.minimalPdf.name': "मिनिमल PDF बायोडाटा",
      'cv.template.templates.minimalPdf.description': "सरल और स्पष्ट बायोडाटा लेआउट",
      'cv.template.templates.creativePdf.name': "क्रिएटिव PDF बायोडाटा",
      'cv.template.templates.creativePdf.description': "आपकी व्यक्तित्व और रचनात्मकता दिखाने वाला टेम्प्लेट",
      'cv.template.templates.professionalPdf.name': "पेशेवर PDF बायोडाटा",
      'cv.template.templates.professionalPdf.description': "औपचारिक और व्यावसायिक बायोडाटा डिज़ाइन"
    },
    es: {
      summary: "Resumen Profesional",
      experience: "Experiencia Laboral",
      education: "Educación",
      skills: "Habilidades",
      languages: "Idiomas",
      certificates: "Certificados",
      present: "Actualidad",
      skill_level: 'de 5',
      // Section visibility translations
      sectionVisibility: "Visibilidad de Secciones",
      header: "Encabezado",
      layout: "Diseño",
      layoutSettings: "Ajustes de Diseño",
      showPhoto: "Mostrar Foto",
      photoStyle: "Estilo de Foto",
      photoSize: "Tamaño de Foto",
      colors: "Colores",
      typography: "Tipografía",
      primaryColor: "Color Primario",
      secondaryColor: "Color Secundario",
      backgroundColor: "Color de Fondo",
      fontSize: "Tamaño de Fuente",
      fontFamily: "Tipo de Fuente",
      // Layout options
      singleColumn: "Una Columna",
      doubleColumn: "Dos Columnas",
      // Photo styles
      circle: "Círculo",
      square: "Cuadrado",
      rounded: "Redondeado",
      // ATS related
      atsOptimization: "Optimización ATS",
      enableAtsOptimization: "Habilitar Optimización ATS",
      atsExplanation: "Optimiza tu CV para mejor escaneo por ATS (Sistemas de Seguimiento de Candidatos)",
      // Web template translations
      'cv.template.templates.modernWeb.name': "Plantilla Web Moderna",
      'cv.template.templates.modernWeb.description': "Diseño moderno y elegante con un layout limpio",
      'cv.template.templates.minimalWeb.name': "Plantilla Web Minimalista",
      'cv.template.templates.minimalWeb.description': "Diseño simple y elegante enfocado en el contenido",
      'cv.template.templates.colorfulWeb.name': "Plantilla Web Colorida",
      'cv.template.templates.colorfulWeb.description': "Diseño colorido que destaca tus habilidades",
      'cv.template.templates.professionalWeb.name': "Plantilla Web Profesional",
      'cv.template.templates.professionalWeb.description': "Diseño formal para profesiones tradicionales",
      'cv.template.templates.creativeWeb.name': "Plantilla Web Creativa",
      'cv.template.templates.creativeWeb.description': "Diseño único para profesiones creativas",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "CV PDF Moderno",
      'cv.template.templates.modernPdf.description': "Diseño de currículum elegante y contemporáneo",
      'cv.template.templates.classicPdf.name': "CV PDF Clásico",
      'cv.template.templates.classicPdf.description': "Formato tradicional adecuado para todas las industrias",
      'cv.template.templates.minimalPdf.name': "CV PDF Minimalista",
      'cv.template.templates.minimalPdf.description': "Diseño de currículum simple y claro",
      'cv.template.templates.creativePdf.name': "CV PDF Creativo",
      'cv.template.templates.creativePdf.description': "Plantilla que muestra tu personalidad y creatividad",
      'cv.template.templates.professionalPdf.name': "CV PDF Profesional",
      'cv.template.templates.professionalPdf.description': "Diseño de currículum formal y profesional"
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
  const handleSaveTemplate = async (templateData: TemplateBuilderCustomTemplateData | NoDndCustomTemplateData) => {
    try {
      // İşlemi gerçekleştirmeden önce tür kontrolü yapalım ve gerekli dönüşümleri uygulayalım
      let adaptedTemplateData: TemplateBuilderCustomTemplateData;
      
      // Eğer NoDndTemplateBuilder'dan gelen veri ise, uyumlu hale getirelim
      if ('globalSettings' in templateData && 'isAtsOptimized' in templateData.globalSettings) {
        const { globalSettings, ...rest } = templateData as NoDndCustomTemplateData;
        const { isAtsOptimized, layout, ...otherSettings } = globalSettings;
        
        // TemplateBuilder formatına dönüştürelim
        adaptedTemplateData = {
          ...rest,
          globalSettings: {
            ...otherSettings,
            layout: ['single', 'double'].includes(layout) ? layout as 'single' | 'double' : 'single'
          }
        } as TemplateBuilderCustomTemplateData;
      } else {
        // Zaten TemplateBuilder formatında ise doğrudan kullan
        adaptedTemplateData = templateData as TemplateBuilderCustomTemplateData;
      }
      
      const saved = await templateService.saveCustomTemplate(adaptedTemplateData, user?.id);
      
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
      toast.error(t('common.errorOccurred'));
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
            {/* Dil seçimi kaldırıldı */}
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
                    savedTemplates={[]}
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

  // NoSSR template builder kullanımı
  const handleNoDndSaveTemplate = (templateData: NoDndCustomTemplateData) => {
    // void dönüş tipi ile Promise'ı görmezden gelelim
    void handleSaveTemplate(templateData);
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