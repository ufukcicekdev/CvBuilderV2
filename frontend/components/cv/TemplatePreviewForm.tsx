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
import dynamic from 'next/dynamic';
import ReactDOM from 'react-dom/client';

// html2pdf component olarak değil, modül olarak kullanılacak
// const html2pdf = dynamic(() => import('html2pdf.js'), { ssr: false });

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
      setPreviewOpen(true);
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

  // PDF şablonu oluşturma fonksiyonu - frontend'de şablon içeriğini render etmek için kullanacağız
  const renderPdfTemplate = (templateId: string, data: any) => {
    // Seçilen şablon ID'ye göre şablonu oluştur
    const templateName = templateId.replace('pdf-', '');
    
    // Şablon içeriğinin oluşturulması
    switch(templateName) {
      case 'modern':
      default:
        return (
          <div id="pdf-container" style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #2196f3', paddingBottom: '20px' }}>
              <h1>{data.personal_info?.name || ''}</h1>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                {data.personal_info?.email && <div>{data.personal_info.email} {data.personal_info?.phone && `| ${data.personal_info.phone}`}</div>}
                {data.personal_info?.address && <div>{data.personal_info.address}</div>}
              </div>
            </div>
            
            {data.personal_info?.summary && (
              <div style={{ margin: '20px 0' }}>
                <h2 style={{ color: '#2196f3', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>
                  {translations[selectedLanguage]?.summary || 'Summary'}
                </h2>
                <p>{data.personal_info.summary}</p>
              </div>
            )}
            
            {data.experience && data.experience.length > 0 && (
              <div style={{ margin: '20px 0' }}>
                <h2 style={{ color: '#2196f3', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>
                  {translations[selectedLanguage]?.experience || 'Work Experience'}
                </h2>
                {data.experience.map((exp: any, index: number) => (
                  <div key={index} style={{ marginBottom: '15px' }}>
                    {exp.position && <h3 style={{ margin: '5px 0' }}>{exp.position}</h3>}
                    <div>
                      {exp.company && exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </div>
                    <div>
                      {exp.start_date && exp.start_date} - {exp.end_date || t('common.present')}
                    </div>
                    {exp.description && <p>{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
            
            {data.education && data.education.length > 0 && (
              <div style={{ margin: '20px 0' }}>
                <h2 style={{ color: '#2196f3', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>
                  {translations[selectedLanguage]?.education || 'Education'}
                </h2>
                {data.education.map((edu: any, index: number) => (
                  <div key={index} style={{ marginBottom: '15px' }}>
                    {edu.degree && <h3 style={{ margin: '5px 0' }}>{edu.degree}</h3>}
                    <div>
                      {edu.school && edu.school}
                      {edu.location && ` • ${edu.location}`}
                    </div>
                    <div>
                      {edu.start_date && edu.start_date} - {edu.end_date || t('common.present')}
                    </div>
                    {edu.description && <p>{edu.description}</p>}
                  </div>
                ))}
              </div>
            )}
            
            {data.skills && data.skills.length > 0 && (
              <div style={{ margin: '20px 0' }}>
                <h2 style={{ color: '#2196f3', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>
                  {translations[selectedLanguage]?.skills || 'Skills'}
                </h2>
                {data.skills.map((skill: any, index: number) => (
                  <div key={index}>
                    <span>
                      {skill.name && skill.name} {skill.level && `(${skill.level}/5 ${translations[selectedLanguage]?.skill_level || ''})`}
                    </span>
                    <div style={{ width: '100px', height: '10px', background: '#eee', display: 'inline-block', marginLeft: '10px' }}>
                      <div style={{ height: '100%', background: '#2196f3', width: `${(skill.level || 3) * 20}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {data.languages && data.languages.length > 0 && (
              <div style={{ margin: '20px 0' }}>
                <h2 style={{ color: '#2196f3', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>
                  {translations[selectedLanguage]?.languages || 'Languages'}
                </h2>
                {data.languages.map((lang: any, index: number) => (
                  <div key={index}>
                    <span>
                      {lang.name && lang.name} {lang.level && `(${lang.level}/5 ${translations[selectedLanguage]?.skill_level || ''})`}
                    </span>
                    <div style={{ width: '100px', height: '10px', background: '#eee', display: 'inline-block', marginLeft: '10px' }}>
                      <div style={{ height: '100%', background: '#2196f3', width: `${(lang.level || 3) * 20}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {data.certificates && data.certificates.length > 0 && (
              <div style={{ margin: '20px 0' }}>
                <h2 style={{ color: '#2196f3', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '15px' }}>
                  {translations[selectedLanguage]?.certificates || 'Certificates'}
                </h2>
                {data.certificates.map((cert: any, index: number) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    {cert.name && <h4 style={{ margin: '5px 0' }}>{cert.name}</h4>}
                    <div>
                      {cert.issuer && cert.issuer}
                      {cert.date && ` - ${cert.date}`}
                    </div>
                    {cert.description && <p>{cert.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  // Frontend'de PDF oluşturma fonksiyonu
  const generatePdfInFrontend = async (data: any) => {
    try {
      if (!selectedTemplate) {
        throw new Error('No template selected');
      }

      // Önce HTML2PDF modulünü doğrudan yükleyelim
      const html2pdf = (await import('html2pdf.js')).default;

      // PDF şablonunu render etmek için geçici bir div oluştur
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      // Seçilen template'e göre stil ve yapıyı belirle
      const templateStyles = {
        'pdf-modern': {
          fontFamily: 'Arial, sans-serif',
          headerColor: '#2196f3',
          headerStyle: 'border-bottom: 2px solid #2196f3',
          sectionTitleColor: '#2196f3'
        },
        'pdf-classic': {
          fontFamily: 'Times New Roman, serif',
          headerColor: '#333333',
          headerStyle: 'background: #333; color: white; padding: 20px',
          sectionTitleColor: '#333333'
        },
        'pdf-minimal': {
          fontFamily: 'Helvetica, Arial, sans-serif',
          headerColor: '#555555',
          headerStyle: 'border-left: 4px solid #555',
          sectionTitleColor: '#555555'
        },
        'pdf-creative': {
          fontFamily: 'Roboto, Arial, sans-serif',
          headerColor: '#6200EA',
          headerStyle: 'background: #6200EA; color: white',
          sectionTitleColor: '#6200EA'
        },
        'pdf-professional': {
          fontFamily: 'Segoe UI, Arial, sans-serif',
          headerColor: '#1976D2',
          headerStyle: 'background: #1976D2; color: white',
          sectionTitleColor: '#1976D2'
        }
      };

      const style = templateStyles[selectedTemplate as keyof typeof templateStyles] || templateStyles['pdf-modern'];

      // Template HTML'ini oluştur
      tempContainer.innerHTML = `
        <div id="pdf-container" style="font-family: ${style.fontFamily}; padding: 20px; max-width: 800px; margin: 0 auto;">
          <div style="${style.headerStyle}; padding: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0 0 10px 0;">${data.personal_info?.name || ''}</h1>
            <div style="font-size: 14px;">
              ${data.personal_info?.title ? `<div>${data.personal_info.title}</div>` : ''}
              ${data.personal_info?.email ? `<div>${data.personal_info.email}${data.personal_info?.phone ? ` | ${data.personal_info.phone}` : ''}</div>` : ''}
              ${data.personal_info?.address ? `<div>${data.personal_info.address}</div>` : ''}
            </div>
          </div>

          ${data.personal_info?.summary ? `
            <div style="margin: 20px 0;">
              <h2 style="color: ${style.sectionTitleColor}; border-bottom: 1px solid ${style.headerColor}; padding-bottom: 5px; margin-bottom: 15px;">
                ${translations[selectedLanguage]?.summary || 'Summary'}
              </h2>
              <p>${data.personal_info.summary}</p>
            </div>
          ` : ''}

          ${data.experience && data.experience.length > 0 ? `
            <div style="margin: 20px 0;">
              <h2 style="color: ${style.sectionTitleColor}; border-bottom: 1px solid ${style.headerColor}; padding-bottom: 5px; margin-bottom: 15px;">
                ${translations[selectedLanguage]?.experience || 'Work Experience'}
              </h2>
              ${data.experience.map((exp: any) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 5px 0;">${exp.position || ''}</h3>
                  <div>${exp.company || ''}${exp.location ? ` • ${exp.location}` : ''}</div>
                  <div>${exp.start_date || ''} - ${exp.end_date || t('common.present')}</div>
                  ${exp.description ? `<p>${exp.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${data.education && data.education.length > 0 ? `
            <div style="margin: 20px 0;">
              <h2 style="color: ${style.sectionTitleColor}; border-bottom: 1px solid ${style.headerColor}; padding-bottom: 5px; margin-bottom: 15px;">
                ${translations[selectedLanguage]?.education || 'Education'}
              </h2>
              ${data.education.map((edu: any) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 5px 0;">${edu.degree || ''}</h3>
                  <div>${edu.school || ''}${edu.location ? ` • ${edu.location}` : ''}</div>
                  <div>${edu.start_date || ''} - ${edu.end_date || t('common.present')}</div>
                  ${edu.description ? `<p>${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${data.skills && data.skills.length > 0 ? `
            <div style="margin: 20px 0;">
              <h2 style="color: ${style.sectionTitleColor}; border-bottom: 1px solid ${style.headerColor}; padding-bottom: 5px; margin-bottom: 15px;">
                ${translations[selectedLanguage]?.skills || 'Skills'}
              </h2>
              ${data.skills.map((skill: any) => `
                <div style="margin-bottom: 10px;">
                  <span>${skill.name || ''}${skill.level ? ` (${skill.level}/5 ${translations[selectedLanguage]?.skill_level || ''})` : ''}</span>
                  <div style="width: 100px; height: 10px; background: #eee; display: inline-block; margin-left: 10px;">
                    <div style="height: 100%; background: ${style.headerColor}; width: ${(skill.level || 3) * 20}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${data.languages && data.languages.length > 0 ? `
            <div style="margin: 20px 0;">
              <h2 style="color: ${style.sectionTitleColor}; border-bottom: 1px solid ${style.headerColor}; padding-bottom: 5px; margin-bottom: 15px;">
                ${translations[selectedLanguage]?.languages || 'Languages'}
              </h2>
              ${data.languages.map((lang: any) => `
                <div style="margin-bottom: 10px;">
                  <span>${lang.name || ''}${lang.level ? ` (${lang.level}/5 ${translations[selectedLanguage]?.skill_level || ''})` : ''}</span>
                  <div style="width: 100px; height: 10px; background: #eee; display: inline-block; margin-left: 10px;">
                    <div style="height: 100%; background: ${style.headerColor}; width: ${(lang.level || 3) * 20}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${data.certificates && data.certificates.length > 0 ? `
            <div style="margin: 20px 0;">
              <h2 style="color: ${style.sectionTitleColor}; border-bottom: 1px solid ${style.headerColor}; padding-bottom: 5px; margin-bottom: 15px;">
                ${translations[selectedLanguage]?.certificates || 'Certificates'}
              </h2>
              ${data.certificates.map((cert: any) => `
                <div style="margin-bottom: 10px;">
                  <h4 style="margin: 5px 0;">${cert.name || ''}</h4>
                  <div>
                    ${cert.issuer || ''}
                    ${cert.date ? ` - ${cert.date}` : ''}
                  </div>
                  ${cert.description ? `<p>${cert.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;

      // PDF seçenekleri
      const options = {
        margin: [15, 15, 15, 15], // top, left, bottom, right margins
        filename: `${data.title || 'cv'}_${selectedLanguage}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 4,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: 1200,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true,
          hotfixes: ["px_scaling"]
        }
      };

      // html2pdf ile PDF oluştur
      const container = tempContainer.querySelector('#pdf-container') as HTMLElement;
      if (!container) {
        throw new Error('PDF container not found');
      }

      // Container'ın boyutunu ayarla
      tempContainer.style.width = '1200px';
      container.style.width = '1200px';
      container.style.padding = '40px';
      container.style.boxSizing = 'border-box';
      container.style.minHeight = '1123px'; // A4 height in pixels at 96 DPI

      return new Promise<{success: boolean, error?: any}>((resolve, reject) => {
        html2pdf()
          .set(options)
          .from(container)
          .outputPdf('blob')
          .then((blob: Blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.personal_info?.full_name || 'CV'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t('cv.preview.downloadSuccess'));
            // Geçici div'i temizle
            document.body.removeChild(tempContainer);
            resolve({ success: true });
          })
          .catch((error: any) => {
            console.error('PDF generation error inside promise:', error);
            document.body.removeChild(tempContainer);
            reject(error);
          });
      });

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
          
          // PDF için adımı tamamla - bu kısmı kaldırıyoruz
          // onStepComplete({
          //   template_id: selectedTemplate,
          //   output_type: 'pdf',
          //   output_url: null
          // });
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
                        {t('common.skills')}
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
                        {t('common.workExperience')}
                      </Typography>
                      {previewData.experience.map((exp: any, index: number) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {exp.title} - {exp.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {exp.start_date} - {exp.end_date || t('common.present')}
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
                        {t('common.education')}
                      </Typography>
                      {previewData.education.map((edu: any, index: number) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {edu.school} - {edu.degree}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {edu.start_date} - {edu.end_date || t('common.present')}
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
                      {t('common.workExperience')}
                    </Typography>
                    {previewData.experience.map((exp: any, index: number) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {exp.title} - {exp.company}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {exp.start_date} - {exp.end_date || t('common.present')}
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
                      {t('common.education')}
                    </Typography>
                    {previewData.education.map((edu: any, index: number) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {edu.school} - {edu.degree}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {edu.start_date} - {edu.end_date || t('common.present')}
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
                      {t('common.skills')}
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
                      {t('common.languages')}
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
            {t('cv.template.pdfButton')}
          </Button>
        </Box>
      );
    }

    return null;
  };

  // Çeviri nesnesi - PDF içinde kullanılmak üzere
  const translations: Record<string, Record<string, string>> = {
    en: {
      summary: t('common.professionalSummary'),
      experience: t('common.workExperience'),
      education: t('common.education'),
      skills: t('common.skills'),
      languages: t('common.languages'),
      certificates: t('common.certificates'),
      present: t('common.present'),
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
      summary: t('common.professionalSummary'),
      experience: t('common.workExperience'),
      education: t('common.education'),
      skills: t('common.skills'),
      languages: t('common.languages'),
      certificates: t('common.certificates'),
      present: t('common.present'),
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
    }
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
                  alt={t('cv.template.templates.classicPdf.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.classicPdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.classicPdf.description')}
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
                  alt={t('cv.template.templates.minimalPdf.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.minimalPdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.minimalPdf.description')}
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
                  alt={t('cv.template.templates.creativePdf.name')}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('cv.template.templates.creativePdf.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('cv.template.templates.creativePdf.description')}
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

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('cv.preview.templatePreview')}
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