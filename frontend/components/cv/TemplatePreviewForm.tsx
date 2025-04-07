import React, { useState, useEffect, Suspense, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from "next-auth/react";
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
import { Download as DownloadIcon, Language as WebIcon, ContentCopy as CopyIcon, Close as CloseIcon, PictureAsPdf as PictureAsPdfIcon, ArrowBack as ArrowBackIcon, Preview as PreviewIcon } from '@mui/icons-material';
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
import { pdfService } from '../../services/pdfService';
// Dynamic imports for client-side only components
import CustomTemplateRenderer from '../pdf-templates/CustomTemplateRenderer';
import { GlobalSettings, CustomTemplateData as NoDndCustomTemplateData } from '../pdf-templates/NoDndTemplateBuilder';
import { CustomTemplateData as TemplateBuilderCustomTemplateData } from '../pdf-templates/TemplateBuilder';
import NoDndTemplateBuilder from '../../components/pdf-templates/NoDndTemplateBuilder';

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

interface ExtendedCustomTemplateData extends Omit<TemplateBuilderCustomTemplateData, 'globalSettings'> {
  globalSettings: NoDndCustomTemplateData['globalSettings'];
}

interface CVData {
  id?: string;
  title?: string;
  personal_info?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    nationality?: string;
    linkedin?: string;
    website?: string;
    summary?: string;
    photo?: string;
  };
  experience?: Array<{
    id?: string;
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    location?: string;
    description: string;
  }>;
  education?: Array<{
    id?: string;
    school: string;
    degree: string;
    field: string;
    start_date: string;
    end_date?: string;
    description?: string;
    location?: string;
  }>;
  skills?: Array<{
    id?: string;
    name: string;
    level: number;
  }>;
  languages?: Array<{
    id?: string;
    name: string;
    level: number;
  }>;
  certificates?: Array<{
    id?: string;
    name: string;
    issuer: string;
    date: string;
    description?: string;
    documentUrl?: string;
    document_type?: string;
  }>;
  i18n?: Record<string, string>;
}

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
  const [customTemplates, setCustomTemplates] = useState<NoDndCustomTemplateData[]>([]);
  const [selectedCustomTemplate, setSelectedCustomTemplate] = useState<NoDndCustomTemplateData | null>(null);
  const [previewTabIndex, setPreviewTabIndex] = useState(0);
  const [templateBuilderLoaded, setTemplateBuilderLoaded] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isWebTemplate, setIsWebTemplate] = useState(false);
  
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
        setLoadingTemplates(true);
        // user?.id parametresini artık geçmiyoruz - API'nin mevcut kullanıcıyı belirleyeceğine güveniyoruz
        const templates = await templateService.getCustomTemplates();
        // console.log('Fetched custom templates:', templates);
        setCustomTemplates(templates as any); // any tipine cast ediyoruz
      } catch (error) {
        console.error('Error fetching custom templates:', error);
        toast.error(t('common.errors.loadFailed', 'Özel şablonlar yüklenemedi.'));
      } finally {
        setLoadingTemplates(false);
      }
      return undefined; // Açıkça undefined döndür
    };
    
    // open kontrolünü kaldırdık - bu component mount olduğunda her zaman şablonları yükleyin
    fetchCustomTemplates();
  }, [t]); // sadece t'ye bağlı, open'a değil

  // Şablon kaydedildikten sonra şablonları yeniden yükle
  const refreshCustomTemplates = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/templates/templates/for_current_user/');
      if (response.status === 200) {
        setCustomTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  // Şablon seçildiğinde şablon özelliklerini editöre yükle
  const loadTemplateToEditor = (template: any) => {
    // console.log('Loading template to editor:', template);
    // console.log('Template layout:', template.globalSettings?.layout);
    
    // Şablonu seçerken layout değerinin korunduğundan emin ol
    setSelectedCustomTemplate({
      ...template,
      globalSettings: {
        ...template.globalSettings,
        // Layout değerini koruduğundan emin ol
        layout: template.globalSettings?.layout || 'single',
      }
    });
  };

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
    // Check if there's a template and cv data
    if (!previewData) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            {t('cv.preview.selectTemplate')}
          </Typography>
        </Box>
      );
    }

    // Load corresponding template component
    const renderTemplate = () => {
      try {
        // Web templates
        if (selectedTemplate === 'web-modern') {
          return (
            <Box sx={{ 
              maxWidth: '100%', 
              overflow: 'auto',
              // Web şablonlar genellikle büyük olduğundan taşma durumunda scroll olacak
              '& *': { 
                maxWidth: '100%',
                boxSizing: 'border-box'
              },
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
            }}>
              <ModernTemplate 
                cv={previewData} 
              />
            </Box>
          );
        } else if (selectedTemplate === 'web-minimal') {
          return (
            <Box sx={{ 
              maxWidth: '100%', 
              overflow: 'auto',
              '& *': { 
                maxWidth: '100%',
                boxSizing: 'border-box'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              }
            }}>
              <MinimalTemplate 
                cv={previewData} 
              />
            </Box>
          );
        } else if (selectedTemplate === 'web-colorful') {
          return (
            <Box sx={{ 
              maxWidth: '100%', 
              overflow: 'auto',
              '& *': { 
                maxWidth: '100%',
                boxSizing: 'border-box'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              }
            }}>
              <ColorfulTemplate 
                cv={previewData} 
              />
            </Box>
          );
        } else if (selectedTemplate === 'web-professional') {
          return (
            <Box sx={{ 
              maxWidth: '100%', 
              overflow: 'auto',
              '& *': { 
                maxWidth: '100%',
                boxSizing: 'border-box'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              }
            }}>
              <ProfessionalTemplate 
                cv={previewData} 
              />
            </Box>
          );
        } else if (selectedTemplate === 'web-creative') {
          return (
            <Box sx={{ 
              maxWidth: '100%', 
              overflow: 'auto',
              '& *': { 
                maxWidth: '100%',
                boxSizing: 'border-box'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              }
            }}>
              <CreativeTemplate 
                cv={previewData} 
              />
            </Box>
          );
        }
        // PDF templates using PdfGenerator component
        else if (selectedTemplate?.startsWith('pdf-')) {
          // Prepare data for PDF generation
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
              end_date: exp.end_date === null ? undefined : exp.end_date,
              description: exp.description || ''
            })),
            education: previewData.education?.map(edu => ({
              ...edu,
              id: edu.id ? String(edu.id) : undefined,
              end_date: edu.end_date === null ? undefined : edu.end_date,
              field: edu.degree || '', // Use degree as field since they represent the same thing in our case
              start_date: edu.start_date || '',
              description: edu.description || '',
              location: edu.location || ''
            })),
            skills: previewData.skills?.map(skill => ({
              ...skill,
              id: skill.id ? String(skill.id) : undefined,
              level: typeof skill.level === 'string' ? parseInt(skill.level, 10) || 3 : (skill.level || 3)
            })),
            languages: previewData.languages?.map(lang => ({
              ...lang,
              id: lang.id ? String(lang.id) : undefined,
              level: typeof lang.level === 'string' ? parseInt(lang.level, 10) || 3 : (lang.level || 3)
            })),
            certificates: previewData.certificates?.map(cert => ({
              ...cert,
              id: cert.id ? String(cert.id) : undefined,
              date: cert.date || new Date().toISOString().split('T')[0]
            })),
            // Use translations specific to the selected language
            i18n: translations[previewSelectedLanguage] || translations.en
          };
          
          return (
            <Box sx={{ 
              maxWidth: '100%', 
              overflow: 'auto',
              // PDF şablonları için özel stiller
              '& .MuiBox-root': { 
                maxWidth: '100%'
              },
              '& iframe': {
                maxWidth: '100%',
                height: 'auto',
                minHeight: '500px'
              }
            }}>
              <PdfGenerator
                data={mappedData}
                language={previewSelectedLanguage}
                translations={translations[previewSelectedLanguage] || translations.en}
              />
            </Box>
          );
        }
        return <div>Template not found</div>;
      } catch (error) {
        console.error('Error rendering template:', error);
        return <div>Error loading template: {(error as Error).message}</div>;
      }
    };

    return (
      <Box sx={{ 
        width: '100%', 
        mt: 2,
        overflow: 'auto',
        '& iframe': { // PDF iframe için
          maxWidth: '100%',
          height: 'auto',
          minHeight: '500px'
        },
        '& img': { // Şablonların içindeki görseller için
          maxWidth: '100%',
          height: 'auto'
        },
        '& table': { // Tabloların responsive olması için
          tableLayout: 'fixed',
          width: '100%',
          maxWidth: '100%'
        },
        '& td, & th': {
          wordBreak: 'break-word'
        },
        // Web şablonları için container stillerini özelleştir
        '& [class*="web-template"]': {
          maxWidth: '100%',
          overflowX: 'hidden'
        }
      }}>
        {renderTemplate()}
      </Box>
    );
  };

  // Frontend'de PDF oluşturma fonksiyonu
  const generatePdfInFrontend = async (data: any) => {
    try {
      // Tarayıcı ortamında olduğumuzu kontrol et
      if (typeof window === 'undefined') {
        return { success: false, error: 'This function can only be run in the browser' };
      }

      // console.log('Generating PDF with data:', data);
      
      // Özel şablon veya standart şablon kontrolü
      const isCustomTemplate = previewTabIndex === 1 && selectedCustomTemplate;
      
      // PDF işlemine başlandığını bildir
      toast.success(t('cv.preview.pdfGenerating', 'PDF oluşturuluyor...'));
      
      if (isCustomTemplate && selectedCustomTemplate) {
        // console.log('Using custom template for PDF generation:', selectedCustomTemplate.name);
        
        // Özel şablonların render edildiği elementi bul
        const element = document.querySelector('.custom-template') as HTMLElement;
        if (!element) {
          toast.error(t('cv.preview.pdfError', 'PDF oluşturma hatası: Element bulunamadı'));
          return { success: false, error: 'Element not found' };
        }
        
        try {
          // PDF'i oluştur
          const success = await pdfService.generatePdf({
            element: element,
            filename: `${selectedCustomTemplate.name || 'cv'}.pdf`,
            margin: [20, 20, 20, 20],
            orientation: 'portrait',
            scale: 2,
            singlePage: false
          });
          
          if (success) {
            toast.success(t('cv.preview.downloadSuccess', 'PDF başarıyla indirildi'));
            return { success: true };
          } else {
            toast.error(t('cv.preview.pdfError', 'PDF oluşturulurken bir hata oluştu'));
            return { success: false, error: 'PDF generation failed' };
          }
        } catch (error) {
          console.error('PDF generation error:', error);
          toast.error(t('cv.preview.pdfError', 'PDF oluşturma hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata')));
          return { success: false, error };
        }
      } 
      // Standart şablon ise template ID'sini ekle
      else if (selectedTemplate) {
        const formattedTemplateId = mapTemplateIdToUrlFormat(selectedTemplate);
        // console.log('Using standard template for PDF generation:', formattedTemplateId);
        
        // Event oluştur ve özel bir olay tetikle (standart şablonlar için)
        const event = new CustomEvent('generate-pdf', {
          detail: {
            data: {
              ...data,
              personal_info: {
                ...data.personal_info,
                photo: data.personal_info?.photo || undefined
              },
              i18n: translations[previewSelectedLanguage] || translations.en
            },
            language: previewSelectedLanguage,
            translations: translations[previewSelectedLanguage] || translations.en,
            templateId: formattedTemplateId
          }
        });
        
        // PDF oluşturma eventini tetikle
        // console.log('Dispatching generate-pdf event');
        document.dispatchEvent(event);
        
        return { success: true };
      }
      else {
        toast.error(t('cv.preview.selectTemplate', 'Lütfen bir şablon seçin'));
        return { success: false, error: 'No template selected' };
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(t('cv.preview.pdfError', 'PDF oluşturma hatası'));
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
      languages: "语言",
      certificates: "证书",
      present: "至今",
      skill_level: '满分5分',
      // Section visibility translations
      sectionVisibility: "版块可见性",
      header: "页眉",
      layout: "布局",
      layoutSettings: "布局设置",
      showPhoto: "显示照片",
      photoStyle: "照片样式",
      photoSize: "照片大小",
      colors: "颜色",
      typography: "版式",
      primaryColor: "主色",
      secondaryColor: "辅助色",
      backgroundColor: "背景色",
      textColor: "文字颜色",
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
      atsExplanation: "优化您的简历以更好地适应申请追踪系统(ATS)",
      // Website templates
      'cv.template.templates.modernWeb.name': "现代网页模板",
      'cv.template.templates.modernWeb.description': "简洁专业的设计，现代布局",
      'cv.template.templates.minimalWeb.name': "极简网页模板",
      'cv.template.templates.minimalWeb.description': "简单优雅的设计，注重内容",
      'cv.template.templates.colorfulWeb.name': "多彩网页模板",
      'cv.template.templates.colorfulWeb.description': "色彩丰富的设计，引人注目",
      'cv.template.templates.professionalWeb.name': "专业网页模板",
      'cv.template.templates.professionalWeb.description': "适合企业风格的结构化布局",
      'cv.template.templates.creativeWeb.name': "创意网页模板",
      'cv.template.templates.creativeWeb.description': "适合创意专业人士的独特设计",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "现代PDF模板",
      'cv.template.templates.modernPdf.description': "干净的排版，现代风格",
      'cv.template.templates.classicPdf.name': "经典PDF模板",
      'cv.template.templates.classicPdf.description': "传统简历布局，经典风格",
      'cv.template.templates.minimalPdf.name': "极简PDF模板",
      'cv.template.templates.minimalPdf.description': "简洁的设计",
      'cv.template.templates.creativePdf.name': "创意PDF模板",
      'cv.template.templates.creativePdf.description': "个性设计，让您脱颖而出",
      'cv.template.templates.professionalPdf.name': "专业PDF模板",
      'cv.template.templates.professionalPdf.description': "专业商务布局"
    },
    es: {
      summary: "Resumen Profesional",
      experience: "Experiencia Laboral",
      education: "Educación",
      skills: "Habilidades",
      languages: "Idiomas",
      certificates: "Certificados",
      present: "Presente",
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
      textColor: "Color de Texto",
      fontSize: "Tamaño de Fuente",
      fontFamily: "Tipo de Fuente",
      // Layout options
      singleColumn: "Columna Única",
      doubleColumn: "Doble Columna",
      // Photo styles
      circle: "Círculo",
      square: "Cuadrado",
      rounded: "Redondeado",
      // ATS related
      atsOptimization: "Optimización ATS",
      enableAtsOptimization: "Habilitar Optimización ATS",
      atsExplanation: "Optimiza tu CV para mejor lectura por sistemas ATS",
      // Web template translations
      'cv.template.templates.modernWeb.name': "Plantilla Web Moderna",
      'cv.template.templates.modernWeb.description': "Diseño limpio y profesional con layout moderno",
      'cv.template.templates.minimalWeb.name': "Plantilla Web Minimalista",
      'cv.template.templates.minimalWeb.description': "Diseño simple y elegante enfocado en el contenido",
      'cv.template.templates.colorfulWeb.name': "Plantilla Web Colorida",
      'cv.template.templates.colorfulWeb.description': "Diseño vibrante y llamativo con acentos de color",
      'cv.template.templates.professionalWeb.name': "Plantilla Web Profesional",
      'cv.template.templates.professionalWeb.description': "Estilo corporativo con layout estructurado",
      'cv.template.templates.creativeWeb.name': "Plantilla Web Creativa",
      'cv.template.templates.creativeWeb.description': "Diseño único para profesionales creativos",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "Plantilla PDF Moderna",
      'cv.template.templates.modernPdf.description': "Diseño contemporáneo con tipografía limpia",
      'cv.template.templates.classicPdf.name': "Plantilla PDF Clásica",
      'cv.template.templates.classicPdf.description': "Layout tradicional de currículum con atractivo atemporal",
      'cv.template.templates.minimalPdf.name': "Plantilla PDF Minimalista",
      'cv.template.templates.minimalPdf.description': "Diseño limpio y minimalista",
      'cv.template.templates.creativePdf.name': "Plantilla PDF Creativa",
      'cv.template.templates.creativePdf.description': "Diseño audaz para destacar",
      'cv.template.templates.professionalPdf.name': "Plantilla PDF Profesional",
      'cv.template.templates.professionalPdf.description': "Layout enfocado a negocios con elementos modernos"
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
      photoStyle: "फोटो स्टाइल",
      photoSize: "फोटो साइज़",
      colors: "रंग",
      typography: "टाइपोग्राफी",
      primaryColor: "प्राथमिक रंग",
      secondaryColor: "द्वितीयक रंग",
      backgroundColor: "पृष्ठभूमि का रंग",
      textColor: "टेक्स्ट का रंग",
      fontSize: "फ़ॉन्ट साइज़",
      fontFamily: "फ़ॉन्ट परिवार",
      // Layout options
      singleColumn: "एकल कॉलम",
      doubleColumn: "डबल कॉलम",
      // Photo styles
      circle: "गोल",
      square: "वर्ग",
      rounded: "गोलाकार",
      // ATS related
      atsOptimization: "एटीएस अनुकूलन",
      enableAtsOptimization: "एटीएस अनुकूलन सक्षम करें",
      atsExplanation: "अपने सीवी को एटीएस (एप्लिकेंट ट्रैकिंग सिस्टम) द्वारा बेहतर स्कैनिंग के लिए अनुकूलित करता है",
      // Web template translations
      'cv.template.templates.modernWeb.name': "आधुनिक वेब टेम्पलेट",
      'cv.template.templates.modernWeb.description': "आधुनिक लेआउट के साथ साफ और पेशेवर डिज़ाइन",
      'cv.template.templates.minimalWeb.name': "मिनिमल वेब टेम्पलेट",
      'cv.template.templates.minimalWeb.description': "सामग्री पर केंद्रित सरल और सुरुचिपूर्ण डिज़ाइन",
      'cv.template.templates.colorfulWeb.name': "रंगीन वेब टेम्पलेट",
      'cv.template.templates.colorfulWeb.description': "रंगीन एक्सेंट के साथ जीवंत और आकर्षक डिज़ाइन",
      'cv.template.templates.professionalWeb.name': "प्रोफेशनल वेब टेम्पलेट",
      'cv.template.templates.professionalWeb.description': "संरचित लेआउट के साथ कॉर्पोरेट स्टाइल",
      'cv.template.templates.creativeWeb.name': "क्रिएटिव वेब टेम्पलेट",
      'cv.template.templates.creativeWeb.description': "रचनात्मक पेशेवरों के लिए अनोखा डिज़ाइन",
      // PDF template translations
      'cv.template.templates.modernPdf.name': "आधुनिक पीडीएफ टेम्पलेट",
      'cv.template.templates.modernPdf.description': "साफ टाइपोग्राफी के साथ समकालीन डिज़ाइन",
      'cv.template.templates.classicPdf.name': "क्लासिक पीडीएफ टेम्पलेट",
      'cv.template.templates.classicPdf.description': "समयरहित आकर्षण वाला पारंपरिक रेज्यूमे लेआउट",
      'cv.template.templates.minimalPdf.name': "मिनिमल पीडीएफ टेम्पलेट",
      'cv.template.templates.minimalPdf.description': "साफ और मिनिमलिस्ट डिज़ाइन",
      'cv.template.templates.creativePdf.name': "क्रिएटिव पीडीएफ टेम्पलेट",
      'cv.template.templates.creativePdf.description': "अलग दिखने के लिए बोल्ड डिज़ाइन",
      'cv.template.templates.professionalPdf.name': "प्रोफेशनल पीडीएफ टेम्पलेट",
      'cv.template.templates.professionalPdf.description': "आधुनिक तत्वों के साथ व्यापार-केंद्रित लेआउट"
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
      // console.log('Saving template data:', templateData);
      
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
            layout: ['single', 'double', 'right-sidebar', 'left-sidebar'].includes(layout) 
              ? layout as 'single' | 'double' | 'right-sidebar' | 'left-sidebar' 
              : 'single',
            showPhoto: globalSettings.showPhoto || false,
            photoStyle: globalSettings.photoStyle || 'circle',
            photoSize: globalSettings.photoSize || 100
          }
        } as TemplateBuilderCustomTemplateData;
      } else {
        // Zaten TemplateBuilder formatında ise doğrudan kullan
        adaptedTemplateData = templateData as TemplateBuilderCustomTemplateData;
      }
      
      // Tüm özelliklerin dahil edildiğinden emin ol
      const finalTemplateData = {
        ...adaptedTemplateData,
        globalSettings: {
          ...(adaptedTemplateData.globalSettings || {}),
          // Eksik özellikleri varsayılan değerlerle ekle
          layout: adaptedTemplateData.globalSettings?.layout || 'single',
          showPhoto: adaptedTemplateData.globalSettings?.showPhoto ?? true,
          photoStyle: adaptedTemplateData.globalSettings?.photoStyle || 'circle',
          photoSize: adaptedTemplateData.globalSettings?.photoSize || 100
        }
      };
      
      // console.log('Final template data to save:', finalTemplateData);
      
      if (!user?.id) {
        toast.error(t('common.errors.loginRequired', 'Şablon kaydetmek için giriş yapmalısınız.'));
        return null;
      }
      
      // User ID parametresi kaldırıldı
      const saved = await templateService.saveCustomTemplate(finalTemplateData);
      
      // Şablonları güncelle
      setCustomTemplates(prev => {
        const exists = prev.some(t => t.id === saved.id);
        if (exists) {
          return prev.map(t => t.id === saved.id ? saved : t) as any;
        }
        return [...prev, saved] as any;
      });
      
      setSelectedCustomTemplate(saved as any);
      // Şablonları yeniden yükle
      await refreshCustomTemplates();
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
      // console.log(`Deleting template with ID (TemplatePreviewForm): "${templateId}"`, typeof templateId);
      
      // Template ID kontrolü - daha kapsamlı
      if (!templateId) {
        toast.error(t('cv.template.error.invalidTemplate', 'Geçersiz şablon ID\'si'));
        return;
      }
      
      // template ID'nin zaten doğru formatta olduğundan emin ol - bu tam olarak db'deki ID
      // console.log(`Using template ID directly from database: "${templateId}" (before deletion call)`);
      // console.log('All custom templates before deletion:', customTemplates.map(t => ({ id: t.id, name: t.name })));
      
      // Bulduğumuz template'ı konsolda gösterelim
      // const foundTemplate = customTemplates.find(t => t.id === templateId);
      // console.log('Found template for deletion:', foundTemplate);
      
      // Silme işlemi başlatıldı bildirimi - componentte göstermeyelim, serviste gösteriliyor
      // toast.loading(t('cv.template.deleting', 'Şablon siliniyor...'));
      
      // Silme işlemini gerçekleştir - ID'yi olduğu gibi geçiriyoruz, formatta bir değişiklik yapmadan
      const success = await templateService.deleteCustomTemplate(templateId);
      
      if (success) {
        // console.log(`Template with ID: "${templateId}" successfully deleted, updating UI`);
        
        // Şablonları güncelle - silinen şablonu listeden kaldır
        setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
        
        // Eğer seçili şablon siliniyorsa, seçimi temizle
        if (selectedCustomTemplate?.id === templateId) {
          setSelectedCustomTemplate(null);
        }
        
        // UI için başarılı silme bildirimi - komponette göstermeyelim, serviste gösteriliyor
        // toast.success(t('cv.template.deleteSuccess', 'Şablon başarıyla silindi'));
      } else {
        // Silme başarısız oldu ama hata oluşmadı (false döndü)
        // toast.error(t('cv.template.error.deleteFailed', 'Şablon silinemedi'));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      // Hata mesajını al
      const errorMessage = error instanceof Error ? error.message : t('cv.template.error.deleteFailed', 'Şablon silinirken bir hata oluştu');
      // Template service'te toast gösterildiği için burada tekrar göstermeye gerek yok
      // Ancak şimdilik errorMessage'ı loglamak ile yetinelim
      console.error('Template deletion error details:', errorMessage);
      // toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Aktif önizleme sekmesini değiştiren fonksiyon
  const handlePreviewTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Özel şablonlar sekmesine geçilince API isteği yap
    if (newValue === 1) {
      // console.log('Switching to custom templates tab, refreshing templates...');
      refreshCustomTemplates();
    }
    
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

  const transformCVData = (data: CV): CVData => ({
    id: String(data.id),
    title: data.title || '',
    personal_info: data.personal_info ? {
      ...data.personal_info,
      photo: data.personal_info.photo || undefined
    } : {},
    experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
      ...exp,
      id: exp.id ? String(exp.id) : undefined,
      end_date: exp.end_date === null ? undefined : exp.end_date,
      description: exp.description || ''
    })) : [],
    education: Array.isArray(data.education) ? data.education.map(edu => ({
      id: edu.id ? String(edu.id) : undefined,
      school: edu.school || '',
      degree: edu.degree || '',
      field: edu.degree || '', // Use degree as field since they represent the same thing in our case
      start_date: edu.start_date || '',
      end_date: edu.end_date === null ? undefined : edu.end_date || '',
      description: edu.description || '',
      location: edu.location || ''
    })) : [],
    skills: Array.isArray(data.skills) ? data.skills.map(skill => ({
      ...skill,
      id: skill.id ? String(skill.id) : undefined,
      level: typeof skill.level === 'string' ? parseInt(skill.level, 10) || 3 : (skill.level || 3)
    })) : [],
    languages: Array.isArray(data.languages) ? data.languages.map(lang => ({
      ...lang,
      id: lang.id ? String(lang.id) : undefined,
      level: typeof lang.level === 'string' ? parseInt(lang.level, 10) || 3 : (lang.level || 3)
    })) : [],
    certificates: Array.isArray(data.certificates) ? data.certificates.map(cert => ({
      ...cert,
      id: cert.id ? String(cert.id) : undefined,
      date: cert.date || new Date().toISOString().split('T')[0]
    })) : [],
    i18n: translations[previewSelectedLanguage] || translations.en
  });

  // Şablon önizleme diyaloğunda dialog içeriğini render eder
  const renderPreviewDialog = () => {
    // Web template seçili ise sadece standart şablonları göster
    const isWebTemplate = selectedTemplate?.startsWith('web-');

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh', // Ekran yüksekliğinin %90'ını kullan
            overflow: 'hidden' // Ana container taşmayı engelle
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' }, // Mobilde alt alta, tablette yan yana
          gap: { xs: 1, sm: 0 }, // Mobilde elemanlar arası boşluk
          pb: { xs: 1, sm: 2 } // Mobilde padding azalt
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            width: { xs: '100%', sm: 'auto' }, // Mobilde tam genişlik
            justifyContent: { xs: 'space-between', sm: 'flex-start' } // Mobilde aralarında boşluk
          }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('cv.preview.title')}
            </Typography>
            {/* Add language selection for PDF templates */}
            {!isWebTemplate && (
              <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 }, ml: { xs: 0, sm: 2 } }}>
                <Select
                  value={previewSelectedLanguage}
                  onChange={(e) => {
                    const newLang = e.target.value as string;
                    setPreviewSelectedLanguage(newLang);
                    fetchPreviewDataForLanguage(newLang);
                  }}
                  displayEmpty
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
                >
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="hi">हिन्दी</MenuItem>
                  <MenuItem value="ar">العربية</MenuItem>
                </Select>
              </FormControl>
            )}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <IconButton edge="end" onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <IconButton edge="end" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        {!isWebTemplate && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 3 } }}>
            <Tabs 
              value={previewTabIndex} 
              onChange={handlePreviewTabChange} 
              aria-label="preview tabs"
              variant="scrollable" // Mobil için scrollable tabs
              scrollButtons="auto" // Scroll butonlarını göster
              allowScrollButtonsMobile // Mobilde scroll butonlarına izin ver
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: 'auto', sm: 120 },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <Tab label={t('cv.preview.standardTemplates')} />
              <Tab label={t('cv.preview.customTemplates')} />
              <Tab label={t('cv.preview.customBuilderTab')} />
            </Tabs>
          </Box>
        )}
        
        <DialogContent sx={{ 
          p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
          overflow: 'auto', // İçerik taşarsa scroll göster
          height: 'calc(90vh - 120px)' // Ekran yüksekliğinden başlık ve sekmeleri çıkar
        }}>
          {(!isWebTemplate && previewTabIndex === 0) && (
            <Box sx={{ 
              width: '100%',
              overflow: 'auto',
              '& > div': { // PdfGenerator içindeki Box
                maxWidth: '100%',
                '& iframe': { // PDF iframe
                  maxWidth: '100%',
                  height: 'auto',
                  minHeight: '500px'
                }
              }
            }}>
              {renderPreviewContent()}
            </Box>
          )}

          {isWebTemplate && (
            <Box sx={{ 
              width: '100%',
              overflow: 'auto',
              '& > div': { // Web template container
                maxWidth: '100%',
              }
            }}>
              {renderPreviewContent()}
            </Box>
          )}
          
          {(!isWebTemplate && previewTabIndex === 1) && (
            <Box>
              {loadingTemplates ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="h6" color="text.secondary" sx={{ ml: 2, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    {t('cv.preview.loadingTemplates', 'Şablonlar yükleniyor...')}
                  </Typography>
                </Box>
              ) : customTemplates.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: 2,
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {t('cv.preview.savedTemplates')}
                    </Typography>
                    {/* PDF indirme butonu kaldırıldı */}
                  </Box>
                  <Grid container spacing={{ xs: 1, sm: 2 }}>
                    {customTemplates.map((template) => (
                      <Grid item xs={6} sm={4} md={3} key={template.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            border: selectedCustomTemplate?.id === template.id ? 2 : 1,
                            borderColor: selectedCustomTemplate?.id === template.id ? 'primary.main' : 'divider',
                            borderRadius: 2,
                            height: '100%',
                            bgcolor: selectedCustomTemplate?.id === template.id ? 'action.selected' : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 3,
                            },
                          }}
                          onClick={() => {
                            const freshTemplate = customTemplates.find(t => t.id === template.id);
                            setSelectedCustomTemplate(freshTemplate || template);
                            loadTemplateToEditor(freshTemplate || template);
                          }}
                        >
                          <CardContent sx={{ py: { xs: 1, sm: 2 } }}>
                            <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                              {template.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {new Date(template.updatedAt).toLocaleDateString()}
                            </Typography>
                          </CardContent>
                          <CardActions sx={{ px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 }, justifyContent: 'space-between' }}>
                            <Button 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {t('common.delete', 'Sil')}
                            </Button>
                            {selectedCustomTemplate?.id === template.id && previewData && (
                              <Button 
                                size="small" 
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  
                                  // Yükleme toast'u göster
                                  toast.dismiss(); // Önceki mesajları kaldır
                                  const toastId = toast.loading('PDF oluşturuluyor...', { duration: 60000 }); // 60 saniye 
                                  
                                  try {
                                    // console.log('PDF indirme işlemi başlatılıyor...');
                                    
                                    // Elementin bekleme süresini artır
                                    setTimeout(async () => {
                                      try {
                                        // CustomTemplateRenderer elementini bul
                                        const customTemplateElement = document.querySelector('.custom-template');
                                        
                                        if (!customTemplateElement) {
                                          console.error('Yazdırılacak element bulunamadı');
                                          toast.dismiss(toastId);
                                          toast.error('Şablon elementi bulunamadı.');
                                          return;
                                        }
                                        
                                        // console.log('Şablon elementi bulundu:', customTemplateElement);
                                        
                                        // PDF dosya adı oluştur
                                        const fileName = `${template.name || 'CV'}-${new Date().toISOString().substring(0, 10)}.pdf`;
                                        
                                        // PDF oluştur - tek sayfa olarak
                                        const success = await pdfService.generatePdf({
                                          element: customTemplateElement as HTMLElement,
                                          filename: fileName,
                                          margin: [3, 3, 3, 3],  // Kenar boşluklarını azalt
                                          orientation: 'portrait',
                                          scale: 3, // Daha yüksek çözünürlük için scale değeri artırıldı
                                          singlePage: true // Her zaman tek sayfa olarak oluştur
                                        });
                                        
                                        // Toast mesajını güncelle
                                        toast.dismiss(toastId);
                                        
                                        if (success) {
                                          // console.log('PDF başarıyla oluşturuldu');
                                          toast.success('PDF başarıyla indirildi');
                                        } else {
                                          console.error('PDF oluşturulamadı');
                                          toast.error('PDF oluşturulurken bir hata oluştu');
                                        }
                                      } catch (innerError) {
                                        console.error('PDF oluşturma iç hatası:', innerError);
                                        toast.dismiss(toastId);
                                        toast.error(`PDF oluşturma hatası: ${innerError instanceof Error ? innerError.message : 'Bilinmeyen hata'}`);
                                      }
                                    }, 1000); // Elementin tam olarak render edilmesi için 1 saniye bekle
                                  } catch (error) {
                                    console.error('PDF oluşturma hatası:', error);
                                    toast.dismiss(toastId);
                                    toast.error(`PDF oluşturma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
                                  }
                                }}
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {t('common.download', 'İndir')}
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                    {t('cv.preview.noCustomTemplates')}
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => setPreviewTabIndex(2)}
                    size="small"
                  >
                    {t('cv.preview.createCustomTemplate')}
                  </Button>
                </Box>
              )}
              
              {selectedCustomTemplate && previewData && (
                <Box 
                  sx={{ 
                    mt: 4,
                    overflow: 'auto',
                    width: '100%'
                  }}
                  className="custom-template"
                >
                  <CustomTemplateRenderer
                    data={transformCVData(previewData)}
                    language={previewSelectedLanguage}
                    translations={translations[previewSelectedLanguage] || translations.en}
                    templateData={{
                      ...selectedCustomTemplate,
                      type: 'pdf' as 'web' | 'pdf', // Type değerini union type olarak belirt
                      globalSettings: {
                        ...selectedCustomTemplate.globalSettings,
                        // Layout bilgisini doğrudan kullan
                        layout: selectedCustomTemplate.globalSettings.layout || 'sidebar-left',
                        textColor: selectedCustomTemplate.globalSettings.textColor || selectedCustomTemplate.globalSettings.primaryColor || '#000000',
                        isAtsOptimized: false
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
          
          {(!isWebTemplate && previewTabIndex === 2) && (
            <Box>
              {templateBuilderLoaded ? (
                <ClientOnlyTemplateBuilder>
                  <NoDndTemplateBuilder
                    onSaveTemplate={handleNoDndSaveTemplate}
                    savedTemplates={customTemplates.map(template => ({
                      ...template,
                      globalSettings: {
                        ...template.globalSettings,
                        textColor: template.globalSettings.primaryColor || '#000000',
                        isAtsOptimized: false
                      }
                    }))}
                  />
                </ClientOnlyTemplateBuilder>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                  <CircularProgress size={40} />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // NoSSR template builder kullanımı
  const handleNoDndSaveTemplate = async (templateData: NoDndCustomTemplateData): Promise<any> => {
    try {
      // console.log('Saving NoDnd template data:', templateData);
      
      // Make sure templateData is properly structured
      const finalTemplateData = {
        ...templateData,
        name: templateData.name || `Özel Şablon ${new Date().toLocaleDateString()}`,
        // Ensure necessary fields are present
        globalSettings: {
          ...(templateData.globalSettings || {}),
          // Layout değerini koruduğundan emin ol, varsayılan olarak sidebar-left
          layout: templateData.globalSettings?.layout || 'sidebar-left',
          showPhoto: templateData.globalSettings?.showPhoto ?? true,
          photoStyle: templateData.globalSettings?.photoStyle || 'circle',
          photoSize: templateData.globalSettings?.photoSize || 100,
          // Sidebar rengi eklendi
          sidebarColor: templateData.globalSettings?.layout === 'sidebar-left' || 
                        templateData.globalSettings?.layout === 'sidebar-right' 
                        ? (templateData.globalSettings?.sidebarColor || '#f5f5f5')
                        : undefined
        }
      };
      
      // console.log('Sending finalized template data to API:', finalTemplateData);
      
      // API'ye doğrudan gönder
      const savedTemplate = await templateService.saveCustomTemplate(finalTemplateData);
      
      if (savedTemplate) {
        // console.log('Template saved successfully:', savedTemplate);
        // Şablonları yenile
        await refreshCustomTemplates();
        
        // Şablon kaydedildiğinde otomatik olarak özel şablonlar sekmesine geç
        setPreviewTabIndex(1);
        
        // Yeni şablonu seç - Tip uyumsuzluğunu gidermek için as any kullan
        setSelectedCustomTemplate(savedTemplate as any);
        
        toast.success(t('cv.template.savedSuccess', 'Şablon başarıyla kaydedildi!'));
        return savedTemplate;
      } else {
        toast.error(t('cv.template.saveFailed', 'Şablon kaydedilemedi.'));
        return false;
      }
    } catch (error) {
      console.error('Error saving template:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.errorOccurred', 'Bir hata oluştu');
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    // Dialog açıldığında ve özel şablonlar sekmesi seçiliyse şablonları yükle
    if (open && previewTabIndex === 1) {
      // console.log('Dialog opened with custom templates tab, loading templates...');
      refreshCustomTemplates();
    }
  }, [open, previewTabIndex]);

  // Custom template önizlemesini render et
  const renderCustomTemplatePreview = () => {
    // Seçili bir şablon yoksa uyarı göster
    if (!selectedCustomTemplate) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {t('cv.preview.selectTemplate', 'Lütfen bir şablon seçin')}
          </Typography>
        </Box>
      );
    }

    // console.log('Rendering custom template with layout:', selectedCustomTemplate.globalSettings.layout);
    
    // Şablonu PDF formatında oluşturmak için type'ı değiştiriyoruz
    const templateWithPdfType = {
      ...selectedCustomTemplate,
      type: 'pdf' as const, // Type değerini 'pdf' literal olarak belirtiyoruz
      globalSettings: {
        ...selectedCustomTemplate.globalSettings,
        // Layout değerini muhafaza et ve doğru şekilde aktar
        layout: selectedCustomTemplate.globalSettings.layout || 'sidebar-left',
        // Gereken diğer alanları da ayarla
        textColor: selectedCustomTemplate.globalSettings.textColor || selectedCustomTemplate.globalSettings.primaryColor || '#000000',
        sidebarColor: selectedCustomTemplate.globalSettings.sidebarColor || '#f5f5f5',
        isAtsOptimized: false
      }
    };
    
    return (
      <Box 
        className="custom-template"
        sx={{ 
          width: '210mm', // A4 genişliği - 210mm
          height: '297mm', // A4 yüksekliği - 297mm
          margin: '0 auto',
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: 3,
          overflow: 'hidden',
          '@media print': {
            boxShadow: 'none',
            margin: 0
          },
          '& > div': { 
            width: '100%',
            height: '100%',
            boxSizing: 'border-box'
          }
        }}
      >
        {previewData && (
          <CustomTemplateRenderer
            data={transformCVData(previewData)}
            language={previewSelectedLanguage}
            translations={translations[previewSelectedLanguage] || translations.en}
            templateData={templateWithPdfType}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('cv.template.selectTitle')}
      </Typography>

      {/* Improving tab layout for Web/PDF version tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 'auto',
            }
          }}
        >
          <Tab 
            icon={<WebIcon />} 
            label={t('cv.template.webVersion')}
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: { xs: 0.5, sm: 1 }, 
              alignItems: 'center',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          />
          <Tab 
            icon={<DownloadIcon />} 
            label={t('cv.template.pdfVersion')}
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: { xs: 0.5, sm: 1 }, 
              alignItems: 'center',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          />
        </Tabs>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {activeTab === 0 ? (
          <>
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-modern' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-modern' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent sx={{ pb: { xs: 1, sm: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.modernWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.modernWeb.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-minimal' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-minimal' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent sx={{ pb: { xs: 1, sm: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.minimalWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.minimalWeb.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-colorful' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-colorful' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent sx={{ pb: { xs: 1, sm: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.colorfulWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.colorfulWeb.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-professional' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-professional' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent sx={{ pb: { xs: 1, sm: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.professionalWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.professionalWeb.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'web-creative' ? 2 : 1,
                  borderColor: selectedTemplate === 'web-creative' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent sx={{ pb: { xs: 1, sm: 2 } }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.creativeWeb.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.creativeWeb.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-template1' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-template1' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.modernPdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.modernPdf.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedTemplate === 'pdf-template2' ? 2 : 1,
                  borderColor: selectedTemplate === 'pdf-template2' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  height: '100%',
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
                  sx={{ objectFit: 'contain', p: 1 }}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {t('cv.template.templates.professionalPdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {t('cv.template.templates.professionalPdf.description')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Box>
          {onPrev && (
            <Button 
              onClick={onPrev} 
              variant="contained"
              disabled={loading}
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {t('common.previous')}
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handlePreview}
            variant="outlined"
            disabled={!selectedTemplate || loading}
            size="small"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {previewLoading ? <CircularProgress size={20} /> : t('cv.template.preview')}
          </Button>
          {activeTab === 0 && (
            <Button
              onClick={handleGenerateCV}
              variant="contained"
              color="primary"
              disabled={!selectedTemplate || loading}
              startIcon={<WebIcon />}
              size="small"
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                t('cv.template.generateWeb')
              )}
            </Button>
          )}
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