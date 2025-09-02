'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Tooltip,
  Slider,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import { PDFTemplateProps } from './types';
import { 
  ColorLens, 
  TextFormat, 
  ViewCompact,
  Save, 
  Delete,
  Add,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  VisibilityOff,
  Edit,
  Palette,
  Close,
  PhotoCamera
} from '@mui/icons-material';
import AtsOptimizationPanel from './AtsOptimizationPanel';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { SelectChangeEvent } from '@mui/material';

// Component interface
interface TemplateBuilderProps {
  data?: any;
  language?: string;
  translations?: Record<string, string>;
  onSaveTemplate?: (templateData: CustomTemplateData) => Promise<any>;
  savedTemplates?: CustomTemplateData[];
}

// Represent a section in the template
export interface TemplateSection {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderColor?: string;
    displayStyle?: 'list' | 'grid' | 'timeline';
    ratingStyle?: 'dots' | 'stars' | 'bars' | 'numbers';
  };
}

// Full template data structure
export interface CustomTemplateData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  type?: 'web' | 'pdf'; // Şablon tipi: web (editör görünümü) veya pdf (indirilen)
  globalSettings: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    backgroundColor: string;
    showPhoto: boolean;
    photoStyle: 'circle' | 'square' | 'rounded';
    photoSize: number;
    layout: 'single' | 'double' | 'sidebar-left' | 'sidebar-right' | 'three-column' | 'header-highlight';
    isAtsOptimized: boolean;
    textColor: string;
    sidebarColor?: string;
  };
  sections: TemplateSection[];
}

export type GlobalSettings = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  backgroundColor: string;
  showPhoto: boolean;
  photoStyle: 'circle' | 'square' | 'rounded';
  photoSize: number;
  layout: 'single' | 'double' | 'sidebar-left' | 'sidebar-right' | 'three-column' | 'header-highlight';
  isAtsOptimized: boolean;
  textColor: string;
};

/**
 * NoDndTemplateBuilder component allows users to create and customize PDF templates
 * without using any drag-and-drop libraries to avoid the React.useId error.
 */
const NoDndTemplateBuilder: React.FC<TemplateBuilderProps> = ({
  data,
  language = 'en',
  translations = {},
  onSaveTemplate,
  savedTemplates = []
}) => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(0);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  // Add state for editing section
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  // Template state
  const [templateData, setTemplateData] = useState<CustomTemplateData>({
    id: uuidv4(),
    name: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    globalSettings: {
      primaryColor: '#2196f3',
      secondaryColor: '#f50057',
      fontFamily: 'Arial, sans-serif',
      fontSize: 10,
      backgroundColor: '#ffffff',
      showPhoto: true,
      photoStyle: 'circle',
      photoSize: 100,
      layout: 'sidebar-left',
      isAtsOptimized: false,
      textColor: '#333333',
      sidebarColor: '#f5f5f5'
    },
    sections: [
      {
        id: 'header',
        type: 'header',
        title: translations.header || t('common.header', 'Header'),
        visible: true,
        order: 0,
        settings: {
          backgroundColor: '#2196f3',
          textColor: '#ffffff',
          fontSize: 12,
          fontFamily: 'Arial, sans-serif'
        }
      },
      {
        id: 'summary',
        type: 'summary',
        title: translations.summary || t('common.professionalSummary', 'Professional Summary'),
        visible: true,
        order: 1,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 10,
          fontFamily: 'Arial, sans-serif'
        }
      },
      {
        id: 'experience',
        type: 'experience',
        title: translations.experience || t('common.workExperience', 'Work Experience'),
        visible: true,
        order: 2,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          displayStyle: 'timeline'
        }
      },
      {
        id: 'education',
        type: 'education',
        title: translations.education || t('common.education', 'Education'),
        visible: true,
        order: 3,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          displayStyle: 'timeline'
        }
      },
      {
        id: 'skills',
        type: 'skills',
        title: translations.skills || t('common.skills', 'Skills'),
        visible: true,
        order: 4,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          displayStyle: 'grid',
          ratingStyle: 'dots'
        }
      },
      {
        id: 'languages',
        type: 'languages',
        title: translations.languages || t('common.languages', 'Languages'),
        visible: true,
        order: 5,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          ratingStyle: 'dots'
        }
      },
      {
        id: 'certificates',
        type: 'certificates',
        title: translations.certificates || t('common.certificates', 'Certificates'),
        visible: true,
        order: 6,
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontSize: 10,
          fontFamily: 'Arial, sans-serif',
          displayStyle: 'list'
        }
      }
    ]
  });

  // Move a section up in the order
  const moveSectionUp = (sectionId: string) => {
    const sectionIndex = templateData.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex <= 0) return; // Already at the top
    
    const newSections = [...templateData.sections];
    // Swap with the section above
    [newSections[sectionIndex - 1], newSections[sectionIndex]] = 
      [newSections[sectionIndex], newSections[sectionIndex - 1]];
    
    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    // Update template data
    setTemplateData({
      ...templateData,
      sections: updatedSections,
      updatedAt: new Date().toISOString()
    });
  };

  // Move a section down in the order
  const moveSectionDown = (sectionId: string) => {
    const sectionIndex = templateData.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1 || sectionIndex >= templateData.sections.length - 1) return; // Already at the bottom
    
    const newSections = [...templateData.sections];
    // Swap with the section below
    [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
      [newSections[sectionIndex + 1], newSections[sectionIndex]];
    
    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    // Update template data
    setTemplateData({
      ...templateData,
      sections: updatedSections,
      updatedAt: new Date().toISOString()
    });
  };

  // Update a section's settings
  const updateSectionSettings = (sectionId: string, settings: Partial<TemplateSection['settings']>) => {
    setTemplateData({
      ...templateData,
      sections: templateData.sections.map(section => 
        section.id === sectionId
          ? { ...section, settings: { ...section.settings, ...settings } }
          : section
      ),
      updatedAt: new Date().toISOString()
    });
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    setTemplateData({
      ...templateData,
      sections: templateData.sections.map(section => 
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      ),
      updatedAt: new Date().toISOString()
    });
  };

  // Update global settings
  const updateGlobalSettings = (settings: Partial<CustomTemplateData['globalSettings']>) => {
    setTemplateData({
      ...templateData,
      globalSettings: { ...templateData.globalSettings, ...settings },
      updatedAt: new Date().toISOString()
    });
  };

  // Toggle ATS optimization mode
  const handleToggleAts = (isOptimized: boolean) => {
    updateGlobalSettings({ isAtsOptimized: isOptimized });
  };

  // Layout değişikliğini yönet
  const handleLayoutChange = (event: SelectChangeEvent<string>) => {
    const newLayout = event.target.value as GlobalSettings['layout'];
    //console.log('Layout değiştiriliyor:', newLayout);
    
    // Layout değişikliğiyle ilgili otomatik ayarlamaları yapalım
    let updatedSections = [...templateData.sections];
    let sidebarColor = templateData.globalSettings.sidebarColor;
    
    // Header bölümü varsa, layout'a göre stilini güncelle
    if (updatedSections.find(s => s.id === 'header')) {
      updatedSections = updatedSections.map(section => {
        if (section.id === 'header') {
          return {
            ...section,
            settings: {
              ...section.settings,
              // Header rengi için layout'a göre ayarla
              backgroundColor: 
                newLayout === 'header-highlight' || 
                newLayout === 'sidebar-left' || 
                newLayout === 'sidebar-right' 
                  ? templateData.globalSettings.primaryColor 
                  : section.settings.backgroundColor || '#ffffff',
              textColor: 
                newLayout === 'header-highlight' || 
                newLayout === 'sidebar-left' || 
                newLayout === 'sidebar-right' 
                  ? '#ffffff' 
                  : section.settings.textColor || templateData.globalSettings.textColor
            }
          };
        }
        return section;
      });
    }
    
    // Sidebar rengi için varsayılan değer
    if (newLayout === 'sidebar-left' || newLayout === 'sidebar-right') {
      sidebarColor = templateData.globalSettings.sidebarColor || '#f5f5f5';
    }
    
    // Tüm template'i güncelle
    setTemplateData({
      ...templateData,
      globalSettings: {
        ...templateData.globalSettings,
        layout: newLayout,
        sidebarColor: sidebarColor
      },
      sections: updatedSections
    });
  };

  // Save template
  const saveTemplate = async () => {
    if (!templateName || templateName.trim() === '') {
      toast.error(t('cv.template.nameRequired', 'Şablon adı girmelisiniz.'));
      return;
    }

    // Kaydedilecek template datasını hazırla
    const templateToSave: CustomTemplateData = {
      ...templateData,
      name: templateName.trim(),
      id: templateData.id || uuidv4(),
      type: 'web', // Şablon tipi - CustomTemplateRenderer için gerekli
      createdAt: templateData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      globalSettings: {
        ...templateData.globalSettings,
        // Layout değerini güvenli şekilde al, varsayılan değer 'single'
        layout: templateData.globalSettings.layout || 'single',
        // Sidebar varsa, sidebar rengini de ayarlayalım
        sidebarColor: 
          templateData.globalSettings.layout === 'sidebar-left' || 
          templateData.globalSettings.layout === 'sidebar-right' 
            ? (templateData.globalSettings.sidebarColor || '#f5f5f5') 
            : undefined
      },
      sections: templateData.sections.map(section => ({
        ...section,
        settings: {
          ...section.settings,
          // Header ayarları, layout tipine göre farklı olabilir
          ...(section.id === 'header' && templateData.globalSettings.layout === 'header-highlight' && {
            backgroundColor: templateData.globalSettings.primaryColor || '#2196f3',
            textColor: '#ffffff'
          })
        }
      }))
    };

    setIsSaving(true);
    try {
      // Şablonu kaydet
      if (onSaveTemplate) {
        await onSaveTemplate(templateToSave);
        toast.success(t('cv.template.saveSuccess', 'Şablon başarıyla kaydedildi.'));
        setTemplateName(''); // Formu sıfırla
      }
    } catch (error) {
      console.error('Şablon kaydedilirken hata oluştu:', error);
      toast.error(t('cv.template.saveError', 'Şablon kaydedilirken bir hata oluştu.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Open section editing panel
  const openSectionEditor = (sectionId: string) => {
    setEditingSectionId(sectionId);
    // Now we don't change tabs, we stay on the current tab
    // So the editing panel opens regardless of which tab the user is on
  };

  // Close section editing panel
  const closeSectionEditor = () => {
    setEditingSectionId(null);
  };

  // Get the section being edited
  const getEditingSection = () => {
    return templateData.sections.find(section => section.id === editingSectionId);
  };

  // Check if we're currently editing the header
  const isEditingHeader = editingSectionId === 'header';

  // Render section specific editing panel
  const renderSectionEditor = () => {
    const section = getEditingSection();
    if (!section) return null;

    const isHeaderSection = section.id === 'header';

    return (
      <Paper sx={{ 
        p: 2, 
        mb: 2, 
        border: '2px solid', 
        borderColor: 'primary.main',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* Arrow Indicator */}
        <Box sx={{ 
          position: 'absolute',
          top: -15,
          left: 30,
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderBottom: '15px solid #2196f3',
        }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {t('cv.template.editSection', 'Bölüm Düzenle')}: {section.title}
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={closeSectionEditor}
            startIcon={<Close fontSize="small" />}
          >
            {t('common.close', 'Kapat')}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Section specific settings */}
        <Grid container spacing={2}>
          {/* Header section warning */}
          {isHeaderSection && (
            <Grid item xs={12}>
              <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                {t('cv.template.headerEditWarning', 'Header düzenlemeleri önizlemede uygun görünmeyebilir. Değişiklikler kaydedildikten sonra doğru şekilde görüntülenecektir.')}
              </Typography>
              
              {/* Header preview */}
              <Box sx={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                p: 2, 
                mb: 2, 
                backgroundColor: section.settings.backgroundColor,
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {templateData.globalSettings.showPhoto && (
                    <Box sx={{ 
                      width: `${templateData.globalSettings.photoSize}px`,
                      height: `${templateData.globalSettings.photoSize}px`,
                      backgroundColor: '#e0e0e0',
                      borderRadius: templateData.globalSettings.photoStyle === 'circle' ? '50%' : 
                                     templateData.globalSettings.photoStyle === 'rounded' ? '10px' : '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography sx={{ color: '#9e9e9e', fontSize: '12px' }}>{t('cv.template.photo', 'Fotoğraf')}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography sx={{ 
                      color: section.settings.textColor,
                      fontSize: `${section.settings.fontSize || 10}pt`,
                      fontWeight: 'bold'
                    }}>
                      {t('cv.template.fullName', 'Ad Soyad')}
                    </Typography>
                    <Typography sx={{ 
                      color: section.settings.textColor,
                      fontSize: `${(section.settings.fontSize || 10) * 0.9}pt`,
                      opacity: 0.8
                    }}>
                      {t('cv.template.profession', 'Pozisyon / Meslek')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
          
          {/* Common settings for all sections */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('cv.template.backgroundColor', 'Arka Plan Rengi')}
              type="color"
              value={section.settings.backgroundColor}
              onChange={(e) => updateSectionSettings(section.id, { backgroundColor: e.target.value })}
              margin="normal"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('cv.template.textColor', 'Yazı Rengi')}
              type="color"
              value={section.settings.textColor}
              onChange={(e) => updateSectionSettings(section.id, { textColor: e.target.value })}
              margin="normal"
              size="small"
            />
          </Grid>
          
          {/* Font selection option for all sections */}
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>{t('cv.template.fontFamily', 'Yazı Tipi')}</InputLabel>
              <Select
                value={section.settings.fontFamily || templateData.globalSettings.fontFamily}
                onChange={(e) => updateSectionSettings(section.id, { fontFamily: e.target.value })}
                label={t('cv.template.fontFamily', 'Yazı Tipi')}
              >
                <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
                <MenuItem value="'Courier New', monospace">Courier New</MenuItem>
                <MenuItem value="Georgia, serif">Georgia</MenuItem>
                <MenuItem value="'Trebuchet MS', sans-serif">Trebuchet MS</MenuItem>
                <MenuItem value="Verdana, sans-serif">Verdana</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>{t('cv.template.fontSize', 'Yazı Boyutu')}</Typography>
            <Slider
              value={section.settings.fontSize}
              onChange={(_, value) => updateSectionSettings(section.id, { fontSize: value as number })}
              min={8}
              max={14}
              step={0.5}
              valueLabelDisplay="auto"
              marks
            />
          </Grid>

          {/* Section type specific settings */}
          {(section.type === 'skills' || section.type === 'languages') && (
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>{t('cv.template.ratingStyle', 'Değerlendirme Stili')}</InputLabel>
                <Select
                  value={section.settings.ratingStyle || 'dots'}
                  onChange={(e) => updateSectionSettings(section.id, { ratingStyle: e.target.value as 'dots' | 'stars' | 'bars' | 'numbers' })}
                  label={t('cv.template.ratingStyle', 'Değerlendirme Stili')}
                >
                  <MenuItem value="dots">{t('cv.template.dots', 'Noktalar')}</MenuItem>
                  <MenuItem value="stars">{t('cv.template.stars', 'Yıldızlar')}</MenuItem>
                  <MenuItem value="bars">{t('cv.template.bars', 'Çubuklar')}</MenuItem>
                  <MenuItem value="numbers">{t('cv.template.numbers', 'Sayılar')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {(section.type === 'experience' || section.type === 'education') && (
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>{t('cv.template.displayStyle', 'Görüntüleme Stili')}</InputLabel>
                <Select
                  value={section.settings.displayStyle || 'timeline'}
                  onChange={(e) => updateSectionSettings(section.id, { displayStyle: e.target.value as 'list' | 'grid' | 'timeline' })}
                  label={t('cv.template.displayStyle', 'Görüntüleme Stili')}
                >
                  <MenuItem value="list">{t('cv.template.list', 'Liste')}</MenuItem>
                  <MenuItem value="timeline">{t('cv.template.timeline', 'Zaman Çizelgesi')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  };

  // Render template preview based on current settings
  const renderPreview = () => {
    //console.log('Preview render ediliyor, layout:', templateData.globalSettings.layout);
    const sortedSections = [...templateData.sections]
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
    
    // Get summary text with safe fallback
    let summaryText = t('cv.template.summaryPlaceholder', 'Bu alana profesyonel özetiniz gelecek. Kendinizi kısaca tanıtın.');
    
    // We use optional chaining and type assertion to safely access data
    // @ts-ignore - We're handling this carefully with fallbacks
    const summary = data?.summary || data?.professional_summary || data?.i18n?.summary;
    if (summary) {
      summaryText = String(summary);
    }
    
    // Function to render a section for reuse in different layouts
    const renderSection = (section: TemplateSection) => {
      // Header bölümü için özel işlem
      if (section.id === 'header') {
        // Artık header düzenlenirken placeholder yerine gerçek içeriği gösteriyoruz
        return (
          <div
            key={section.id}
            style={{
              backgroundColor: section.settings.backgroundColor,
              color: section.settings.textColor,
              padding: isEditingHeader ? '15px' : '8px',
              margin: '5px 0',
              fontSize: `${section.settings.fontSize}pt`,
              fontFamily: section.settings.fontFamily,
              borderRadius: templateData.globalSettings.isAtsOptimized ? '0' : '3px',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 10,
              // Düzenleme sırasında belirgin olması için hafif bir kenarlık
              border: isEditingHeader ? '2px dashed #2196f3' : 'none',
              ...(templateData.globalSettings.isAtsOptimized && {
                border: 'none',
                boxShadow: 'none',
                padding: '10px 0',
                backgroundColor: '#ffffff'
              })
            }}
          >
            {isEditingHeader && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '2px 6px',
                backgroundColor: '#2196f3',
                color: 'white',
                fontSize: '10px',
                borderBottomLeftRadius: '4px',
                zIndex: 15
              }}>
                {t('cv.template.editing', 'Düzenleniyor')}
              </div>
            )}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 11
            }}>
              {templateData.globalSettings.showPhoto && (
                <div style={{ 
                  width: `${templateData.globalSettings.photoSize * 0.5}px`,
                  height: `${templateData.globalSettings.photoSize * 0.5}px`,
                  backgroundColor: '#e0e0e0',
                  borderRadius: templateData.globalSettings.photoStyle === 'circle' ? '50%' : 
                              templateData.globalSettings.photoStyle === 'rounded' ? '10px' : '0',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography sx={{ color: '#9e9e9e', textAlign: 'center', fontSize: '10px' }}>
                    {t('cv.template.photo', 'Fotoğraf')}
                  </Typography>
                </div>
              )}
              <div>
                <Typography variant="h6" sx={{ 
                  margin: 0, 
                  fontWeight: 'bold',
                  color: section.settings.textColor
                }}>
                  {t('cv.template.fullName', 'Tam Ad')}
                </Typography>
                <Typography variant="body2" sx={{ 
                  margin: 0,
                  color: section.settings.textColor,
                  opacity: 0.9
                }}>
                  {t('cv.template.profession', 'Meslek / Pozisyon')}
                </Typography>
              </div>
            </div>
          </div>
        );
      }

      // Diğer bölümler için normal render
      return (
        <div
          key={section.id}
          style={{
            backgroundColor: section.settings.backgroundColor,
            color: section.settings.textColor,
            padding: '8px',
            margin: '5px 0',
            fontSize: `${section.settings.fontSize}pt`,
            fontFamily: section.settings.fontFamily,
            borderRadius: templateData.globalSettings.isAtsOptimized ? '0' : '3px',
            ...(templateData.globalSettings.isAtsOptimized && {
              border: 'none',
              boxShadow: 'none',
              padding: '10px 0',
              backgroundColor: '#ffffff'
            })
          }}
        >
          <h3 style={{ 
            margin: '0 0 5px 0', 
            color: templateData.globalSettings.isAtsOptimized ? '#000000' : templateData.globalSettings.primaryColor,
            ...(templateData.globalSettings.isAtsOptimized && {
              fontWeight: 'bold',
              textTransform: 'uppercase',
              borderBottom: '1px solid #000000',
              paddingBottom: '4px'
            })
          }}>
            {section.title}
          </h3>
          <div style={{ 
            minHeight: '30px', 
            backgroundColor: templateData.globalSettings.isAtsOptimized ? '#ffffff' : '#f0f0f0', 
            borderRadius: templateData.globalSettings.isAtsOptimized ? '0' : '3px'
          }}>
            {section.type === 'summary' && (
              <p style={{ padding: '5px', margin: 0, fontSize: 'inherit' }}>
                {summaryText}
              </p>
            )}
            {(section.type === 'skills' || section.type === 'languages') && (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '5px', 
                padding: '5px' 
              }}>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{ 
                    backgroundColor: templateData.globalSettings.isAtsOptimized ? '#ffffff' : '#e0e0e0', 
                    padding: '4px 8px',
                    borderRadius: templateData.globalSettings.isAtsOptimized ? '0' : '3px',
                    fontSize: 'inherit',
                    ...(templateData.globalSettings.isAtsOptimized && {
                      border: 'none',
                      display: 'inline',
                      marginRight: '20px'
                    })
                  }}>
                    {section.type === 'skills' 
                      ? `${t('cv.template.skill', 'Beceri')} ${i+1}` 
                      : `${t('cv.template.language', 'Dil')} ${i+1}`} 
                    {!templateData.globalSettings.isAtsOptimized && (
                      <>
                        {section.settings.ratingStyle === 'dots' && ' ●●●○○'}
                        {section.settings.ratingStyle === 'stars' && ' ★★★☆☆'}
                        {section.settings.ratingStyle === 'bars' && ' ▮▮▮▯▯'}
                        {section.settings.ratingStyle === 'numbers' && ' 3/5'}
                      </>
                    )}
                    {templateData.globalSettings.isAtsOptimized && `: ${t('cv.template.advancedLevel', 'İleri Seviye')}`}
                  </div>
                ))}
              </div>
            )}
            {['experience', 'education'].includes(section.type) && section.settings.displayStyle === 'timeline' && (
              <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} style={{ 
                    display: 'flex',
                    borderLeft: `2px solid ${templateData.globalSettings.primaryColor}`,
                    paddingLeft: '10px'
                  }}>
                    <div style={{ fontSize: 'inherit' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {section.type === 'experience' 
                          ? `${t('cv.template.companyName', 'Şirket Adı')} ${i+1}` 
                          : `${t('cv.template.schoolName', 'Okul Adı')} ${i+1}`}
                      </div>
                      <div>2020 - 2023</div>
                      <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                        {section.type === 'experience' 
                          ? t('cv.template.positionName', 'Pozisyon Adı')
                          : t('cv.template.degree', 'Derece')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {['experience', 'education'].includes(section.type) && section.settings.displayStyle === 'list' && (
              <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} style={{ 
                    border: '1px solid #ddd',
                    padding: '5px',
                    borderRadius: '3px'
                  }}>
                    <div style={{ fontSize: 'inherit' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {section.type === 'experience' 
                          ? `${t('cv.template.companyName', 'Şirket Adı')} ${i+1}` 
                          : `${t('cv.template.schoolName', 'Okul Adı')} ${i+1}`}
                      </div>
                      <div>2020 - 2023</div>
                      <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                        {section.type === 'experience' 
                          ? t('cv.template.positionName', 'Pozisyon Adı')
                          : t('cv.template.degree', 'Derece')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {section.type === 'certificates' && (
              <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} style={{ fontSize: 'inherit' }}>
                    <div style={{ fontWeight: 'bold' }}>{t('cv.template.certificate', 'Sertifika')} {i+1}</div>
                    <div style={{ fontSize: '0.9em', opacity: 0.8 }}>2022 • {t('cv.template.issuer', 'Veren Kurum')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    };
    
    // Get sections by type
    const mainSections = sortedSections.filter(s => ['summary', 'experience', 'education'].includes(s.type));
    const sideSections = sortedSections.filter(s => ['skills', 'languages', 'certificates'].includes(s.type));
    const headerSection = sortedSections.find(s => s.id === 'header');
    
    return (
      <div
        style={{
          fontFamily: templateData.globalSettings.fontFamily,
          fontSize: `${templateData.globalSettings.fontSize}pt`,
          backgroundColor: templateData.globalSettings.backgroundColor,
          padding: '10px',
          color: '#333',
          maxWidth: '100%',
          margin: '0 auto',
          direction: language === 'ar' ? 'rtl' : 'ltr',
          textAlign: language === 'ar' ? 'right' : 'left',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header for all layouts */}
        {headerSection && headerSection.visible && (
          <div style={{ 
            display: 'flex', 
            flexDirection: templateData.globalSettings.layout === 'double' || 
                          templateData.globalSettings.layout === 'sidebar-left' || 
                          templateData.globalSettings.layout === 'sidebar-right' ? 'row' : 'column',
            marginBottom: '10px',
            backgroundColor: sortedSections.find(s => s.id === 'header')?.settings.backgroundColor || '#2196f3',
            padding: '15px',
            borderRadius: '3px',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 10,
            isolation: 'isolate',
            // Düzenleme sırasında belirgin olması için dashed kenarlık
            border: isEditingHeader ? '2px dashed #2196f3' : 'none',
            ...(templateData.globalSettings.layout === 'header-highlight' && {
              textAlign: 'center',
              borderBottom: `5px solid ${templateData.globalSettings.primaryColor}`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              color: '#ffffff',
              padding: '25px 15px'
            }),
          }}>
            {isEditingHeader && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '2px 6px',
                backgroundColor: '#2196f3',
                color: 'white',
                fontSize: '10px',
                borderBottomLeftRadius: '4px',
                zIndex: 15
              }}>
                {t('cv.template.editing', 'Düzenleniyor')}
              </div>
            )}
            <div style={{ 
              position: 'relative', 
              zIndex: 11,
              display: 'flex',
              flexDirection: templateData.globalSettings.layout === 'double' || 
                            templateData.globalSettings.layout === 'sidebar-left' || 
                            templateData.globalSettings.layout === 'sidebar-right' ? 'row' : 'column',
              width: '100%',
              alignItems: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start',
              justifyContent: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start'
            }}>
              {templateData.globalSettings.showPhoto && (
                <div style={{ 
                  width: `${templateData.globalSettings.photoSize}px`,
                  height: `${templateData.globalSettings.photoSize}px`,
                  backgroundColor: '#e0e0e0',
                  borderRadius: templateData.globalSettings.photoStyle === 'circle' ? '50%' : 
                                templateData.globalSettings.photoStyle === 'rounded' ? '10px' : '0',
                  backgroundImage: data && data.personal_info?.photo ? `url(${data.personal_info.photo})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: ['double', 'sidebar-left', 'sidebar-right'].includes(templateData.globalSettings.layout) ? '20px' : '0',
                  marginBottom: ['single', 'three-column', 'header-highlight'].includes(templateData.globalSettings.layout) ? '10px' : '0',
                  flexShrink: 0,
                  ...(templateData.globalSettings.layout === 'header-highlight' && {
                    margin: '0 auto 10px auto',
                    border: `3px solid ${templateData.globalSettings.secondaryColor || '#ffffff'}`
                  }),
                }}>
                  {(!data || !data.personal_info?.photo) && <Typography sx={{ color: '#9e9e9e', textAlign: 'center', fontSize: '10px' }}>{t('cv.template.photo', 'Fotoğraf')}</Typography>}
                </div>
              )}
              <div style={{ 
                flex: 1, 
                textAlign: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'left'
              }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'inherit', 
                  color: sortedSections.find(s => s.id === 'header')?.settings.textColor || '#fff',
                  mb: 1,
                  position: 'relative',
                  zIndex: 12,
                  fontWeight: templateData.globalSettings.layout === 'header-highlight' ? 'bold' : 'normal',
                  fontSize: templateData.globalSettings.layout === 'header-highlight' ? '1.5em' : 'inherit'
                }}>
                  {data && data.personal_info?.full_name || t('cv.template.fullName', 'Tam Ad')}
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontFamily: 'inherit', 
                  color: sortedSections.find(s => s.id === 'header')?.settings.textColor || '#fff',
                  opacity: 0.9,
                  position: 'relative',
                  zIndex: 12
                }}>
                  {data && data.personal_info?.title || t('cv.template.profession', 'Meslek / Pozisyon')}
                </Typography>
                {data && data.personal_info && (data.personal_info.email || data.personal_info.phone) && (
                  <div style={{
                    display: 'flex',
                    flexDirection: templateData.globalSettings.layout === 'header-highlight' ? 'column' : 'row',
                    gap: '8px',
                    marginTop: '8px',
                    justifyContent: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start',
                    alignItems: templateData.globalSettings.layout === 'header-highlight' ? 'center' : 'flex-start',
                    flexWrap: 'wrap'
                  }}>
                    {data && data.personal_info && data.personal_info.email && (
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'inherit', 
                        color: sortedSections.find(s => s.id === 'header')?.settings.textColor || '#fff',
                        opacity: 0.8,
                        fontSize: '0.9em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>📧</span> {data.personal_info.email}
                      </Typography>
                    )}
                    {data && data.personal_info && data.personal_info.phone && (
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'inherit', 
                        color: sortedSections.find(s => s.id === 'header')?.settings.textColor || '#fff',
                        opacity: 0.8,
                        fontSize: '0.9em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>📱</span> {data.personal_info.phone}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Render different layouts based on selected layout */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          {templateData.globalSettings.layout === 'single' && (
            <div>
              {sortedSections
                .filter(section => section.id !== 'header')
                .map(section => renderSection(section))}
            </div>
          )}
          
          {templateData.globalSettings.layout === 'double' && (
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Left column (narrower) */}
              <div style={{ flex: '0.35' }}>
                {sortedSections
                  .filter(section => ['summary', 'skills', 'languages'].includes(section.type))
                  .map(section => renderSection(section))}
              </div>
              
              {/* Right column (wider) */}
              <div style={{ flex: '0.65' }}>
                {sortedSections
                  .filter(section => ['experience', 'education', 'certificates'].includes(section.type))
                  .map(section => renderSection(section))}
              </div>
            </div>
          )}
          
          {templateData.globalSettings.layout === 'sidebar-left' && (
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Left sidebar */}
              <div style={{ width: '30%', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                {sideSections.map(section => renderSection(section))}
              </div>
              
              {/* Main content area */}
              <div style={{ flex: '1' }}>
                {mainSections.map(section => renderSection(section))}
              </div>
            </div>
          )}
          
          {templateData.globalSettings.layout === 'sidebar-right' && (
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Main content area */}
              <div style={{ flex: '1' }}>
                {mainSections.map(section => renderSection(section))}
              </div>
              
              {/* Right sidebar */}
              <div style={{ width: '30%', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                {sideSections.map(section => renderSection(section))}
              </div>
            </div>
          )}
          
          {templateData.globalSettings.layout === 'three-column' && (
            <div style={{ display: 'flex', gap: '15px' }}>
              {/* Column 1 - Skills */}
              <div style={{ flex: '1' }}>
                {sortedSections
                  .filter(section => ['skills'].includes(section.type))
                  .map(section => renderSection(section))}
              </div>
              
              {/* Column 2 - Summary & Experience */}
              <div style={{ flex: '1' }}>
                {sortedSections
                  .filter(section => ['summary', 'experience'].includes(section.type))
                  .map(section => renderSection(section))}
              </div>
              
              {/* Column 3 - Education, Languages, Certificates */}
              <div style={{ flex: '1' }}>
                {sortedSections
                  .filter(section => ['education', 'languages', 'certificates'].includes(section.type))
                  .map(section => renderSection(section))}
              </div>
            </div>
          )}
          
          {templateData.globalSettings.layout === 'header-highlight' && (
            <div>
              {/* Special header-highlight layout: Big header with emphasis, then content below */}
              <div style={{ borderTop: `3px solid ${templateData.globalSettings.primaryColor}` }}>
                {/* Summary section right after header */}
                {sortedSections
                  .filter(section => section.type === 'summary')
                  .map(section => (
                    <div
                      key={section.id}
                      style={{
                        backgroundColor: section.settings.backgroundColor,
                        color: section.settings.textColor,
                        padding: '15px',
                        margin: '0 0 20px 0',
                        fontSize: `${section.settings.fontSize}pt`,
                        fontFamily: section.settings.fontFamily,
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 'inherit' }}>{summaryText}</p>
                    </div>
                  ))}
                
                {/* Two column layout for the rest of content */}
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: '1' }}>
                    {sortedSections
                      .filter(section => ['experience', 'education'].includes(section.type))
                      .map(section => renderSection(section))}
                  </div>
                  <div style={{ flex: '1' }}>
                    {sortedSections
                      .filter(section => ['skills', 'languages', 'certificates'].includes(section.type))
                      .map(section => renderSection(section))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tab panel component
  const TabPanel = (props: { children: React.ReactNode; index: number; value: number }) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  // Tab accessibility props
  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  return (
    <div>
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom sx={{ mb: 2, color: 'text.secondary' }}>
          {t('cv.template.createExplanation', 'Özel CV şablonunuzu oluşturmak için aşağıdaki seçenekleri kullanın. Şablonunuza bir isim verdikten sonra düzen, renkler ve yazı tipi ayarlarını özelleştirebilirsiniz. İşiniz bittiğinde "Kaydet" düğmesine tıklayın.')}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label={t('cv.template.templateName', 'Şablon Adı')}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              margin="normal"
              size="small"
              required
              error={!templateName && isSaving}
              helperText={!templateName && isSaving ? t('cv.template.nameRequired', 'Şablon için bir isim girmelisiniz') : ''}
              placeholder={t('cv.template.namePlaceholder', 'Örn: Mavi Profesyonel Şablon')}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={6}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={saveTemplate}
              disabled={isSaving || !templateName}
              sx={{ mt: { xs: 0, sm: 2 } }}
            >
              {isSaving ? <CircularProgress size={24} /> : t('common.save', 'Kaydet')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main content - split into two columns */}
      <Grid container spacing={3}>
        {/* Left column - Settings */}
        <Grid item xs={12} md={6} lg={7}>
          <Paper sx={{ width: '100%', mb: { xs: 4, md: 0 } }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, newValue) => setActiveTab(newValue)} 
                aria-label="template settings tabs"
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ViewCompact sx={{ mr: 1 }} fontSize="small" />
                      {t('cv.template.layout', 'Düzen')}
                    </Box>
                  } 
                  {...a11yProps(0)}
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Palette sx={{ mr: 1 }} fontSize="small" />
                      {t('cv.template.colors', 'Renkler')}
                    </Box>
                  } 
                  {...a11yProps(1)}
                />
              </Tabs>
            </Box>

            {/* Section editor - displayed when a section is being edited */}
            {editingSectionId && renderSectionEditor()}

            {/* Layout tab */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>{t('cv.template.layoutSettings', 'Düzen Ayarları')}</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>{t('cv.template.layout', 'Düzen')}</Typography>
                  
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>{t('cv.template.layout', 'Düzen')}</InputLabel>
                    <Select
                      value={templateData.globalSettings.layout}
                      onChange={handleLayoutChange}
                      label={t('cv.template.layout', 'Düzen')}
                    >
                      <MenuItem value="single">{t('cv.template.singleColumn', 'Tek Sütun')}</MenuItem>
                      <MenuItem value="double">{t('cv.template.doubleColumn', 'Çift Sütun')}</MenuItem>
                      <MenuItem value="sidebar-left">{t('cv.template.sidebarLeft', 'Kenar Çubuğu - Sol')}</MenuItem>
                      <MenuItem value="sidebar-right">{t('cv.template.sidebarRight', 'Kenar Çubuğu - Sağ')}</MenuItem>
                      <MenuItem value="three-column">{t('cv.template.threeColumn', 'Üç Sütun')}</MenuItem>
                      <MenuItem value="header-highlight">{t('cv.template.headerHighlight', 'Başlık Vurgulu')}</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={templateData.globalSettings.showPhoto}
                        onChange={(e) => updateGlobalSettings({ showPhoto: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={t('cv.template.showPhoto', 'Fotoğraf Göster')}
                    sx={{ mt: 2, display: 'block' }}
                  />
                  
                  {templateData.globalSettings.showPhoto && (
                    <>
                      <FormControl fullWidth margin="normal" size="small">
                        <InputLabel>{t('cv.template.photoStyle', 'Fotoğraf Stili')}</InputLabel>
                        <Select
                          value={templateData.globalSettings.photoStyle}
                          onChange={(e) => updateGlobalSettings({ photoStyle: e.target.value as 'circle' | 'square' | 'rounded' })}
                          label={t('cv.template.photoStyle', 'Fotoğraf Stili')}
                        >
                          <MenuItem value="circle">{t('cv.template.circle', 'Yuvarlak')}</MenuItem>
                          <MenuItem value="square">{t('cv.template.square', 'Kare')}</MenuItem>
                          <MenuItem value="rounded">{t('cv.template.rounded', 'Yuvarlatılmış')}</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('cv.template.photoSize', 'Fotoğraf Boyutu')}</Typography>
                      <Slider
                        value={templateData.globalSettings.photoSize}
                        onChange={(_, value) => updateGlobalSettings({ photoSize: value as number })}
                        min={40}
                        max={150}
                        step={5}
                        valueLabelDisplay="auto"
                        marks
                      />
                    </>
                  )}
                  
                  {/* ATS Optimization Panel */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>{t('cv.template.atsOptimization', 'ATS Optimizasyonu')}</Typography>
                    <AtsOptimizationPanel
                      isAtsOptimized={templateData.globalSettings.isAtsOptimized}
                      onToggleAts={handleToggleAts}
                      sections={templateData.sections}
                      globalSettings={templateData.globalSettings}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>{t('cv.template.sectionVisibility', 'Bölüm Görünürlüğü')}</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {templateData.sections.map((section) => (
                      <Box
                        key={section.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                          pb: 1,
                          borderBottom: '1px solid #eee',
                          // Aktif düzenlenen bölüm için arka plan rengi
                          backgroundColor: editingSectionId === section.id ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                          borderRadius: '4px',
                          padding: '8px 4px',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => moveSectionUp(section.id)}
                            disabled={section.order === 0}
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => moveSectionDown(section.id)}
                            disabled={section.order === templateData.sections.length - 1}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                          <Box 
                            sx={{ 
                              ml: 1,
                              cursor: 'pointer',
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              '&:hover': { 
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                            onClick={() => openSectionEditor(section.id)}
                          >
                            <Typography 
                              sx={{ 
                                fontWeight: editingSectionId === section.id ? 'bold' : 'normal',
                                color: editingSectionId === section.id ? 'primary.main' : 'text.primary',
                              }}
                            >
                              {section.title}
                            </Typography>
                            {editingSectionId === section.id && (
                              <Typography variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                                ({t('cv.template.editing', 'Düzenleniyor')})
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => toggleSectionVisibility(section.id)}
                          >
                            {section.visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          </IconButton>
                          <IconButton
                            size="small"
                            color={editingSectionId === section.id ? "primary" : "default"}
                            onClick={() => openSectionEditor(section.id)}
                            sx={{ ml: 1 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Colors tab */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>{t('cv.template.colorSettings', 'Renk Ayarları')}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.template.primaryColor', 'Ana Renk')}
                    type="color"
                    value={templateData.globalSettings.primaryColor}
                    onChange={(e) => updateGlobalSettings({ primaryColor: e.target.value })}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.template.secondaryColor', 'İkincil Renk')}
                    type="color"
                    value={templateData.globalSettings.secondaryColor}
                    onChange={(e) => updateGlobalSettings({ secondaryColor: e.target.value })}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.template.backgroundColor', 'Arka Plan Rengi')}
                    type="color"
                    value={templateData.globalSettings.backgroundColor}
                    onChange={(e) => updateGlobalSettings({ backgroundColor: e.target.value })}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.template.textColor', 'Yazı Rengi')}
                    type="color"
                    value={templateData.globalSettings.textColor || '#333333'}
                    onChange={(e) => updateGlobalSettings({ textColor: e.target.value })}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>{t('cv.template.globalFontSize', 'Genel Yazı Boyutu')}</Typography>
                  <Slider
                    value={templateData.globalSettings.fontSize}
                    onChange={(_, value) => updateGlobalSettings({ fontSize: value as number })}
                    min={8}
                    max={12}
                    step={0.5}
                    valueLabelDisplay="auto"
                    marks
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>{t('cv.template.fontFamily', 'Yazı Tipi')}</InputLabel>
                    <Select
                      value={templateData.globalSettings.fontFamily}
                      onChange={(e) => updateGlobalSettings({ fontFamily: e.target.value as string })}
                      label={t('cv.template.fontFamily', 'Yazı Tipi')}
                    >
                      <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                      <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
                      <MenuItem value="'Courier New', monospace">Courier New</MenuItem>
                      <MenuItem value="Georgia, serif">Georgia</MenuItem>
                      <MenuItem value="'Trebuchet MS', sans-serif">Trebuchet MS</MenuItem>
                      <MenuItem value="Verdana, sans-serif">Verdana</MenuItem>
                      <MenuItem value="'Open Sans', sans-serif">Open Sans</MenuItem>
                      <MenuItem value="'Roboto', sans-serif">Roboto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {/* ATS Optimization Toggle */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={templateData.globalSettings.isAtsOptimized || false}
                        onChange={(e) => updateGlobalSettings({ isAtsOptimized: e.target.checked })}
                      />
                    }
                    label={t('cv.template.atsOptimize', "ATS Optimizasyonunu Etkinleştir")}
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('cv.template.atsOptimizeDescription', "ATS (Başvuru Takip Sistemi) tarafından daha iyi taranması için CV'nizi optimize eder")}
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Right column - Preview */}
        <Grid item xs={12} md={6} lg={5}>
          <Box sx={{ position: 'sticky', top: 16 }}>
            <Typography variant="h6" gutterBottom>{t('cv.template.preview', 'Önizleme')}</Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2,
                maxHeight: { md: 'calc(100vh - 150px)' },
                overflow: 'auto'
              }}
            >
              <div ref={previewRef}>
                {renderPreview()}
              </div>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default NoDndTemplateBuilder;