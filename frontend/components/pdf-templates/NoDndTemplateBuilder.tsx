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
  CircularProgress 
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
  Edit
} from '@mui/icons-material';

// Component interface
interface TemplateBuilderProps {
  data: PDFTemplateProps['data'];
  language?: string;
  translations?: Record<string, string>;
  onSaveTemplate?: (templateData: CustomTemplateData) => void;
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
  globalSettings: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    backgroundColor: string;
    showPhoto: boolean;
    photoStyle: 'circle' | 'square' | 'rounded';
    photoSize: number;
    layout: 'single' | 'double';
  };
  sections: TemplateSection[];
}

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
    id: `template-${Date.now()}`,
    name: 'New Custom Template',
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
      photoSize: 80,
      layout: 'single'
    },
    sections: [
      {
        id: 'header',
        type: 'header',
        title: translations.header || 'Header',
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
        title: translations.summary || 'Summary',
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
        title: translations.experience || 'Experience',
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
        title: translations.education || 'Education',
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
        title: translations.skills || 'Skills',
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
        title: translations.languages || 'Languages',
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
        title: translations.certificates || 'Certificates',
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

  // Save template
  const saveTemplate = async () => {
    if (!templateName) {
      alert(t('cv.template.nameRequired'));
      return;
    }
    
    setIsSaving(true);
    
    try {
      const templateToSave = {
        ...templateData,
        name: templateName
      };
      
      // Call the save function from props
      if (onSaveTemplate) {
        await onSaveTemplate(templateToSave);
      }
      
      // Success notification could go here
    } catch (error) {
      console.error('Error saving template:', error);
      // Error notification could go here
    } finally {
      setIsSaving(false);
    }
  };

  // Open section editing panel
  const openSectionEditor = (sectionId: string) => {
    setEditingSectionId(sectionId);
    // Switch to the appropriate tab based on section type
    const section = templateData.sections.find(s => s.id === sectionId);
    if (section) {
      if (['skills', 'languages'].includes(section.type)) {
        setActiveTab(2); // Typography tab for rating styles
      } else if (section.id === 'header') {
        setActiveTab(1); // Colors tab for header styling
      } else {
        setActiveTab(0); // Layout tab as default
      }
    }
  };

  // Close section editing panel
  const closeSectionEditor = () => {
    setEditingSectionId(null);
  };

  // Get the section being edited
  const getEditingSection = () => {
    return templateData.sections.find(section => section.id === editingSectionId);
  };

  // Render section specific editing panel
  const renderSectionEditor = () => {
    const section = getEditingSection();
    if (!section) return null;

    return (
      <Paper sx={{ p: 2, mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('cv.template.editSection')}: {section.title}</Typography>
          <Button size="small" onClick={closeSectionEditor}>{t('common.close')}</Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Section specific settings */}
        <Grid container spacing={2}>
          {/* Common settings for all sections */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={t('cv.template.backgroundColor')}
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
              label={t('cv.template.textColor')}
              type="color"
              value={section.settings.textColor}
              onChange={(e) => updateSectionSettings(section.id, { textColor: e.target.value })}
              margin="normal"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>{t('cv.template.fontSize')}</Typography>
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
                <InputLabel>{t('cv.template.ratingStyle')}</InputLabel>
                <Select
                  value={section.settings.ratingStyle || 'dots'}
                  onChange={(e) => updateSectionSettings(section.id, { ratingStyle: e.target.value as 'dots' | 'stars' | 'bars' | 'numbers' })}
                  label={t('cv.template.ratingStyle')}
                >
                  <MenuItem value="dots">{t('cv.template.dots')}</MenuItem>
                  <MenuItem value="stars">{t('cv.template.stars')}</MenuItem>
                  <MenuItem value="bars">{t('cv.template.bars')}</MenuItem>
                  <MenuItem value="numbers">{t('cv.template.numbers')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {(section.type === 'experience' || section.type === 'education') && (
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>{t('cv.template.displayStyle')}</InputLabel>
                <Select
                  value={section.settings.displayStyle || 'timeline'}
                  onChange={(e) => updateSectionSettings(section.id, { displayStyle: e.target.value as 'list' | 'grid' | 'timeline' })}
                  label={t('cv.template.displayStyle')}
                >
                  <MenuItem value="list">{t('cv.template.list')}</MenuItem>
                  <MenuItem value="timeline">{t('cv.template.timeline')}</MenuItem>
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
    const sortedSections = [...templateData.sections]
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
    
    // Get summary text with safe fallback
    let summaryText = 'Bu alana profesyonel özetiniz gelecek. Kendinizi kısaca tanıtın.';
    
    // We use optional chaining and type assertion to safely access data
    // @ts-ignore - We're handling this carefully with fallbacks
    const summary = data?.summary || data?.professional_summary || data?.i18n?.summary;
    if (summary) {
      summaryText = String(summary);
    }
    
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
        }}
      >
        {/* Header section with photo if enabled */}
        <div style={{ 
          display: 'flex', 
          flexDirection: templateData.globalSettings.layout === 'double' ? 'row' : 'column',
          marginBottom: '10px',
          backgroundColor: sortedSections.find(s => s.id === 'header')?.settings.backgroundColor || '#2196f3',
          padding: '15px',
          borderRadius: '3px',
        }}>
          {templateData.globalSettings.showPhoto && (
            <div style={{ 
              width: `${templateData.globalSettings.photoSize}px`,
              height: `${templateData.globalSettings.photoSize}px`,
              backgroundColor: '#e0e0e0',
              borderRadius: templateData.globalSettings.photoStyle === 'circle' ? '50%' : 
                            templateData.globalSettings.photoStyle === 'rounded' ? '10px' : '0',
              backgroundImage: data.personal_info?.photo ? `url(${data.personal_info.photo})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: templateData.globalSettings.layout === 'double' ? '20px' : '0',
              marginBottom: templateData.globalSettings.layout === 'single' ? '10px' : '0',
              flexShrink: 0,
            }}>
              {!data.personal_info?.photo && <Typography sx={{ color: '#9e9e9e', textAlign: 'center', fontSize: '10px' }}>Fotoğraf</Typography>}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <Typography variant="h5" sx={{ 
              fontFamily: 'inherit', 
              color: sortedSections.find(s => s.id === 'header')?.settings.textColor || '#fff',
              mb: 1
            }}>
              {data.personal_info?.full_name || 'Ad Soyad'}
            </Typography>
            <Typography variant="body1" sx={{ 
              fontFamily: 'inherit', 
              color: sortedSections.find(s => s.id === 'header')?.settings.textColor || '#fff',
              opacity: 0.9
            }}>
              {data.personal_info?.title || 'Meslek / Pozisyon'}
            </Typography>
          </div>
        </div>
        
        {/* Main content - split into columns if double column layout */}
        <div style={{ 
          display: templateData.globalSettings.layout === 'double' ? 'flex' : 'block',
          gap: '20px'
        }}>
          {/* Left column or full width column */}
          <div style={{ flex: templateData.globalSettings.layout === 'double' ? '0.35' : '1' }}>
            {sortedSections
              .filter(section => ['summary', 'skills', 'languages'].includes(section.type))
              .map(section => (
                <div
                  key={section.id}
                  style={{
                    backgroundColor: section.settings.backgroundColor,
                    color: section.settings.textColor,
                    padding: '8px',
                    margin: '5px 0',
                    fontSize: `${section.settings.fontSize}pt`,
                    fontFamily: section.settings.fontFamily,
                    borderRadius: '3px',
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', color: templateData.globalSettings.primaryColor }}>
                    {section.title}
                  </h3>
                  <div style={{ minHeight: '30px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
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
                            backgroundColor: '#e0e0e0', 
                            padding: '4px 8px',
                            borderRadius: '3px',
                            fontSize: 'inherit'
                          }}>
                            {section.type === 'skills' ? `Beceri ${i+1}` : `Dil ${i+1}`} 
                            {section.settings.ratingStyle === 'dots' && ' ●●●○○'}
                            {section.settings.ratingStyle === 'stars' && ' ★★★☆☆'}
                            {section.settings.ratingStyle === 'bars' && ' ▮▮▮▯▯'}
                            {section.settings.ratingStyle === 'numbers' && ' 3/5'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {/* Right column (only shown in double column layout) */}
          {templateData.globalSettings.layout === 'double' && (
            <div style={{ flex: '0.65' }}>
              {sortedSections
                .filter(section => ['experience', 'education', 'certificates'].includes(section.type))
                .map(section => (
                  <div
                    key={section.id}
                    style={{
                      backgroundColor: section.settings.backgroundColor,
                      color: section.settings.textColor,
                      padding: '8px',
                      margin: '5px 0',
                      fontSize: `${section.settings.fontSize}pt`,
                      fontFamily: section.settings.fontFamily,
                      borderRadius: '3px',
                    }}
                  >
                    <h3 style={{ margin: '0 0 5px 0', color: templateData.globalSettings.primaryColor }}>
                      {section.title}
                    </h3>
                    <div style={{ minHeight: '50px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
                      {['experience', 'education'].includes(section.type) && section.settings.displayStyle === 'timeline' && (
                        <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Array(2).fill(0).map((_, i) => (
                            <div key={i} style={{ 
                              display: 'flex',
                              borderLeft: `2px solid ${templateData.globalSettings.primaryColor}`,
                              paddingLeft: '10px'
                            }}>
                              <div style={{ fontSize: 'inherit' }}>
                                <div style={{ fontWeight: 'bold' }}>{section.type === 'experience' ? 'Şirket Adı' : 'Okul Adı'} {i+1}</div>
                                <div>2020 - 2023</div>
                                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{section.type === 'experience' ? 'Pozisyon Adı' : 'Derece'}</div>
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
                                <div style={{ fontWeight: 'bold' }}>{section.type === 'experience' ? 'Şirket Adı' : 'Okul Adı'} {i+1}</div>
                                <div>2020 - 2023</div>
                                <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{section.type === 'experience' ? 'Pozisyon Adı' : 'Derece'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.type === 'certificates' && (
                        <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {Array(2).fill(0).map((_, i) => (
                            <div key={i} style={{ fontSize: 'inherit' }}>
                              <div style={{ fontWeight: 'bold' }}>Sertifika {i+1}</div>
                              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>2022 • Veren Kurum</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          {/* Show experience/education/certificates in single column layout */}
          {templateData.globalSettings.layout === 'single' && 
            sortedSections
              .filter(section => ['experience', 'education', 'certificates'].includes(section.type))
              .map(section => (
                <div
                  key={section.id}
                  style={{
                    backgroundColor: section.settings.backgroundColor,
                    color: section.settings.textColor,
                    padding: '8px',
                    margin: '5px 0',
                    fontSize: `${section.settings.fontSize}pt`,
                    fontFamily: section.settings.fontFamily,
                    borderRadius: '3px',
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', color: templateData.globalSettings.primaryColor }}>
                    {section.title}
                  </h3>
                  <div style={{ minHeight: '50px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
                    {/* Same content as above for each section type */}
                    {['experience', 'education'].includes(section.type) && section.settings.displayStyle === 'timeline' && (
                      <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Array(2).fill(0).map((_, i) => (
                          <div key={i} style={{ 
                            display: 'flex',
                            borderLeft: `2px solid ${templateData.globalSettings.primaryColor}`,
                            paddingLeft: '10px'
                          }}>
                            <div style={{ fontSize: 'inherit' }}>
                              <div style={{ fontWeight: 'bold' }}>{section.type === 'experience' ? 'Şirket Adı' : 'Okul Adı'} {i+1}</div>
                              <div>2020 - 2023</div>
                              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{section.type === 'experience' ? 'Pozisyon Adı' : 'Derece'}</div>
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
                              <div style={{ fontWeight: 'bold' }}>{section.type === 'experience' ? 'Şirket Adı' : 'Okul Adı'} {i+1}</div>
                              <div>2020 - 2023</div>
                              <div style={{ fontSize: '0.9em', opacity: 0.8 }}>{section.type === 'experience' ? 'Pozisyon Adı' : 'Derece'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === 'certificates' && (
                      <div style={{ padding: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {Array(2).fill(0).map((_, i) => (
                          <div key={i} style={{ fontSize: 'inherit' }}>
                            <div style={{ fontWeight: 'bold' }}>Sertifika {i+1}</div>
                            <div style={{ fontSize: '0.9em', opacity: 0.8 }}>2022 • Veren Kurum</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
          }
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
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{t('cv.template.customBuilder')}</Typography>
          <TextField
            label={t('cv.template.templateName')}
            variant="outlined"
            size="small"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={saveTemplate}
            disabled={isSaving || !templateName}
          >
            {t('cv.template.saveTemplate')}
          </Button>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ViewCompact />} label={t('cv.template.layout')} />
          <Tab icon={<ColorLens />} label={t('cv.template.colors')} />
          <Tab icon={<TextFormat />} label={t('cv.template.typography')} />
        </Tabs>
        
        {/* Show section editor if a section is being edited */}
        {editingSectionId && renderSectionEditor()}
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {/* Tab content for different settings */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="h6" gutterBottom>{t('cv.template.layoutSettings')}</Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('cv.template.layout')}</InputLabel>
                <Select
                  value={templateData.globalSettings.layout}
                  onChange={(e) => updateGlobalSettings({ layout: e.target.value as 'single' | 'double' })}
                  label={t('cv.template.layout')}
                >
                  <MenuItem value="single">{t('cv.template.singleColumn')}</MenuItem>
                  <MenuItem value="double">{t('cv.template.doubleColumn')}</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('cv.template.showPhoto')}</InputLabel>
                <Select
                  value={templateData.globalSettings.showPhoto}
                  onChange={(e) => updateGlobalSettings({ showPhoto: e.target.value === 'true' })}
                  label={t('cv.template.showPhoto')}
                >
                  <MenuItem value="true">{t('common.yes')}</MenuItem>
                  <MenuItem value="false">{t('common.no')}</MenuItem>
                </Select>
              </FormControl>
              
              {templateData.globalSettings.showPhoto && (
                <>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>{t('cv.template.photoStyle')}</InputLabel>
                    <Select
                      value={templateData.globalSettings.photoStyle}
                      onChange={(e) => updateGlobalSettings({ photoStyle: e.target.value as 'circle' | 'square' | 'rounded' })}
                      label={t('cv.template.photoStyle')}
                    >
                      <MenuItem value="circle">{t('cv.template.circle')}</MenuItem>
                      <MenuItem value="square">{t('cv.template.square')}</MenuItem>
                      <MenuItem value="rounded">{t('cv.template.rounded')}</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>{t('cv.template.photoSize')}</Typography>
                    <Slider
                      value={templateData.globalSettings.photoSize}
                      onChange={(_, value) => updateGlobalSettings({ photoSize: value as number })}
                      min={40}
                      max={160}
                      step={10}
                      valueLabelDisplay="auto"
                      marks
                    />
                  </Box>
                </>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>{t('cv.template.sections')}</Typography>
              
              {/* Manual section reordering without drag and drop */}
              <Box>
                {templateData.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <Paper
                      key={section.id}
                      sx={{ 
                        p: 2, 
                        mb: 1, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: section.visible ? 'background.paper' : 'action.disabledBackground',
                        opacity: section.visible ? 1 : 0.7,
                        // Highlight if this section is being edited
                        border: editingSectionId === section.id ? '2px solid' : 'none',
                        borderColor: 'primary.main',
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            opacity: section.visible ? 1 : 0.5,
                            textDecoration: section.visible ? 'none' : 'line-through' 
                          }}
                        >
                          {section.title}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Up/Down buttons for reordering */}
                        <Tooltip title={t('cv.template.moveUp')}>
                          <IconButton 
                            size="small" 
                            onClick={() => moveSectionUp(section.id)}
                            disabled={index === 0}
                            sx={{ opacity: index === 0 ? 0.5 : 1 }}
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={t('cv.template.moveDown')}>
                          <IconButton 
                            size="small" 
                            onClick={() => moveSectionDown(section.id)}
                            disabled={index === templateData.sections.length - 1}
                            sx={{ opacity: index === templateData.sections.length - 1 ? 0.5 : 1 }}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Visibility toggle */}
                        <Tooltip title={section.visible ? t('cv.template.hide') : t('cv.template.show')}>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleSectionVisibility(section.id)}
                            sx={{ opacity: section.visible ? 1 : 0.5 }}
                          >
                            {section.visible ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </Tooltip>
                        
                        {/* Edit button */}
                        <Tooltip title={t('cv.template.edit')}>
                          <IconButton 
                            size="small"
                            onClick={() => openSectionEditor(section.id)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  ))}
              </Box>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>{t('cv.template.colorSettings')}</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.template.primaryColor')}
                    type="color"
                    value={templateData.globalSettings.primaryColor}
                    onChange={(e) => updateGlobalSettings({ primaryColor: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('cv.template.secondaryColor')}
                    type="color"
                    value={templateData.globalSettings.secondaryColor}
                    onChange={(e) => updateGlobalSettings({ secondaryColor: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('cv.template.backgroundColor')}
                    type="color"
                    value={templateData.globalSettings.backgroundColor}
                    onChange={(e) => updateGlobalSettings({ backgroundColor: e.target.value })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>{t('cv.template.sectionColors')}</Typography>
              
              {templateData.sections.map(section => (
                <Paper key={section.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>{section.title}</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('cv.template.backgroundColor')}
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
                        label={t('cv.template.textColor')}
                        type="color"
                        value={section.settings.textColor}
                        onChange={(e) => updateSectionSettings(section.id, { textColor: e.target.value })}
                        margin="normal"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>{t('cv.template.typographySettings')}</Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('cv.template.fontFamily')}</InputLabel>
                <Select
                  value={templateData.globalSettings.fontFamily}
                  onChange={(e) => updateGlobalSettings({ fontFamily: e.target.value as string })}
                  label={t('cv.template.fontFamily')}
                >
                  <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                  <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
                  <MenuItem value="'Courier New', monospace">Courier New</MenuItem>
                  <MenuItem value="'Roboto', sans-serif">Roboto</MenuItem>
                  <MenuItem value="'Open Sans', sans-serif">Open Sans</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>{t('cv.template.fontSize')}</Typography>
                <Slider
                  value={templateData.globalSettings.fontSize}
                  onChange={(_, value) => updateGlobalSettings({ fontSize: value as number })}
                  min={8}
                  max={14}
                  step={0.5}
                  valueLabelDisplay="auto"
                  marks
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Section level typography settings */}
              <Typography variant="h6" gutterBottom>{t('cv.template.sectionTypography')}</Typography>
              
              {templateData.sections.map(section => (
                <Paper key={section.id} sx={{ p: 2, mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>{section.title}</Typography>
                  
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>{t('cv.template.fontFamily')}</InputLabel>
                    <Select
                      value={section.settings.fontFamily}
                      onChange={(e) => updateSectionSettings(section.id, { fontFamily: e.target.value as string })}
                      label={t('cv.template.fontFamily')}
                    >
                      <MenuItem value="inherit">{t('cv.template.useGlobal')}</MenuItem>
                      <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                      <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
                      <MenuItem value="'Courier New', monospace">Courier New</MenuItem>
                      <MenuItem value="'Roboto', sans-serif">Roboto</MenuItem>
                      <MenuItem value="'Open Sans', sans-serif">Open Sans</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>{t('cv.template.fontSize')}</Typography>
                    <Slider
                      value={section.settings.fontSize}
                      onChange={(_, value) => updateSectionSettings(section.id, { fontSize: value as number })}
                      min={8}
                      max={16}
                      step={0.5}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  
                  {(section.type === 'skills' || section.type === 'languages') && (
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>{t('cv.template.ratingStyle')}</InputLabel>
                      <Select
                        value={section.settings.ratingStyle}
                        onChange={(e) => updateSectionSettings(section.id, { ratingStyle: e.target.value as 'dots' | 'stars' | 'bars' | 'numbers' })}
                        label={t('cv.template.ratingStyle')}
                      >
                        <MenuItem value="dots">{t('cv.template.dots')}</MenuItem>
                        <MenuItem value="stars">{t('cv.template.stars')}</MenuItem>
                        <MenuItem value="bars">{t('cv.template.bars')}</MenuItem>
                        <MenuItem value="numbers">{t('cv.template.numbers')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  {(section.type === 'experience' || section.type === 'education') && (
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>{t('cv.template.displayStyle')}</InputLabel>
                      <Select
                        value={section.settings.displayStyle}
                        onChange={(e) => updateSectionSettings(section.id, { displayStyle: e.target.value as 'list' | 'grid' | 'timeline' })}
                        label={t('cv.template.displayStyle')}
                      >
                        <MenuItem value="list">{t('cv.template.list')}</MenuItem>
                        <MenuItem value="timeline">{t('cv.template.timeline')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Paper>
              ))}
            </TabPanel>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                {t('cv.template.preview')}
              </Typography>
              <Paper
                elevation={3}
                sx={{ 
                  p: 2, 
                  height: '600px', 
                  overflow: 'auto',
                  bgcolor: '#f9f9f9',
                  border: '1px solid #ddd'
                }}
              >
                <div ref={previewRef}>
                  {renderPreview()}
                </div>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default NoDndTemplateBuilder; 