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
// Only import the types we need from dnd
import type { DropResult } from '@hello-pangea/dnd';
// Import DirectPatchedDragDrop instead for the most reliable solution
import DirectPatchedDragDrop from './DirectPatchedDragDrop';
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
import { monkeyPatchDnd, ensureReactUseId } from './monkeyPatchDnd';

// Apply our monkeypatches as early as possible
if (typeof window !== 'undefined') {
  ensureReactUseId();
  monkeyPatchDnd();
}

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
 * TemplateBuilder component allows users to create and customize PDF templates
 * with drag-and-drop functionality, color pickers, and layout options.
 */
const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
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

  // Handle section reordering via drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    if (source.index === destination.index) return;
    
    // Create a copy of the sections array
    const newSections = [...templateData.sections];
    
    // Remove the dragged item
    const [removed] = newSections.splice(source.index, 1);
    
    // Insert it at the destination
    newSections.splice(destination.index, 0, removed);
    
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

  // Render template preview based on current settings
  // This is a simplified version, the real implementation would be more complex
  const renderPreview = () => {
    const sortedSections = [...templateData.sections]
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);
    
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
        {sortedSections.map(section => (
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
            <div style={{ height: '30px', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
              {/* Placeholder for section content - would be real data in actual implementation */}
            </div>
          </div>
        ))}
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
              
              <DirectPatchedDragDrop
                onDragEnd={handleDragEnd}
                droppableId="sections"
                items={templateData.sections
                  .sort((a, b) => a.order - b.order)
                  .map(section => ({
                    id: section.id,
                    content: (
                      <Paper
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: section.visible ? 'background.paper' : 'action.disabledBackground',
                          opacity: section.visible ? 1 : 0.7,
                          cursor: 'grab'
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
                        <Box>
                          <Tooltip title={section.visible ? t('cv.template.hide') : t('cv.template.show')}>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleSectionVisibility(section.id)}
                              sx={{ opacity: section.visible ? 1 : 0.5 }}
                            >
                              {section.visible ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('cv.template.edit')}>
                            <IconButton 
                              size="small"
                              onClick={() => updateSectionSettings(section.id, {})}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    )
                  }))}
              />
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

export default TemplateBuilder;
