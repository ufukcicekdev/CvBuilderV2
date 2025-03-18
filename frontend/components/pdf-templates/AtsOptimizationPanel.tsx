'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
  AlertTitle,
  Grid
} from '@mui/material';
import {
  Check,
  Close,
  Info,
  Lightbulb,
  Assignment
} from '@mui/icons-material';

// ATS optimizasyon önerilerini içeren yardımcı fonksiyon
const getAtsSuggestions = (
  sections: any[],
  keywords: string[],
  isAtsOptimized: boolean,
  t: any
): { passed: string[]; warnings: string[] } => {
  const passed: string[] = [];
  const warnings: string[] = [];

  // Temel ATS uyumluluğu kontrolleri
  if (!isAtsOptimized) {
    warnings.push(t('ATS optimization is not enabled.', 'ATS optimizasyonu etkin değil.'));
  } else {
    passed.push(t('ATS optimization is enabled.', 'ATS optimizasyonu etkin.'));
  }

  // Font kontrolleri
  const safeAtsfonts = ['Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Garamond', 'Georgia'];
  
  // CV bölüm kontrolleri
  const hasSummary = sections.some(s => s.type === 'summary' && s.visible);
  const hasSkills = sections.some(s => s.type === 'skills' && s.visible);
  const hasExperience = sections.some(s => s.type === 'experience' && s.visible);
  const hasEducation = sections.some(s => s.type === 'education' && s.visible);

  if (hasSummary) {
    passed.push(t('Professional summary section is included.', 'Profesyonel özet bölümü eklenmiş.'));
  } else {
    warnings.push(t('Consider adding a professional summary section.', 'Profesyonel özet bölümü eklemeyi düşünün.'));
  }

  if (hasSkills) {
    passed.push(t('Skills section is included.', 'Beceriler bölümü eklenmiş.'));
  } else {
    warnings.push(t('Skills section is highly recommended for ATS scanning.', 'ATS taraması için beceriler bölümü şiddetle tavsiye edilir.'));
  }

  if (hasExperience) {
    passed.push(t('Work experience section is included.', 'İş deneyimi bölümü eklenmiş.'));
  } else {
    warnings.push(t('Work experience section is essential for ATS compatibility.', 'İş deneyimi bölümü ATS uyumluluğu için gereklidir.'));
  }

  if (hasEducation) {
    passed.push(t('Education section is included.', 'Eğitim bölümü eklenmiş.'));
  } else {
    warnings.push(t('Education section is important for ATS compatibility.', 'Eğitim bölümü ATS uyumluluğu için önemlidir.'));
  }

  // Anahtar kelime kontrolleri
  if (keywords.length > 0) {
    passed.push(t('Job-specific keywords are included.', 'İşe özel anahtar kelimeler eklenmiş.'));
  } else if (isAtsOptimized) {
    warnings.push(t('Consider adding job-specific keywords for better ATS ranking.', 'Daha iyi ATS sıralaması için işe özel anahtar kelimeler eklemeyi düşünün.'));
  }

  return { passed, warnings };
};

// ATS uyumluluk skorunu hesaplama
const calculateAtsScore = (passed: string[], warnings: string[]): number => {
  const totalChecks = passed.length + warnings.length;
  return Math.floor((passed.length / totalChecks) * 100);
};

interface AtsOptimizationPanelProps {
  isAtsOptimized: boolean;
  onToggleAts: (value: boolean) => void;
  sections: any[];
  globalSettings: any;
}

const AtsOptimizationPanel: React.FC<AtsOptimizationPanelProps> = ({
  isAtsOptimized,
  onToggleAts,
  sections,
  globalSettings
}) => {
  const { t } = useTranslation('common');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  
  // ATS önerilerini ve skoru hesapla
  const { passed, warnings } = getAtsSuggestions(sections, keywords, isAtsOptimized, t);
  const atsScore = calculateAtsScore(passed, warnings);
  
  // Anahtar kelime ekle
  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };
  
  // Anahtar kelime sil
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('cv.template.atsOptimized')}
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={isAtsOptimized}
            onChange={(e) => onToggleAts(e.target.checked)}
            color="primary"
          />
        }
        label={t('cv.template.atsOptimizedLabel')}
      />
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {t('cv.template.atsDescription')}
      </Typography>
      
      {isAtsOptimized && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('cv.template.atsKeywords')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('cv.template.atsKeywordsLabel')}
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder={t('cv.template.atsKeywordsPlaceholder')}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {keywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onDelete={() => removeKeyword(keyword)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ mr: 1, fontSize: '1.2rem' }} />
              {t('cv.template.atsCompatibilityScore')}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={atsScore} 
                  color={atsScore > 80 ? "success" : atsScore > 50 ? "warning" : "error"}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {atsScore}%
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Lightbulb sx={{ mr: 1, fontSize: '1.2rem' }} />
              {t('cv.template.atsSuggestions')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {passed.length > 0 && (
                  <List dense>
                    {passed.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Check color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                {warnings.length > 0 && (
                  <List dense>
                    {warnings.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Close color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            </Grid>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>{t('cv.template.atsTips')}</AlertTitle>
            <List dense disablePadding>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Info color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Use standard section headings like 'Experience', 'Skills', 'Education'" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Info color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Avoid complex formatting, tables, or graphics" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Info color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Include keywords from the job description in your skills and experience" />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Info color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Use full abbreviations at least once (e.g., 'Artificial Intelligence (AI)')" />
              </ListItem>
            </List>
          </Alert>
        </>
      )}
    </Box>
  );
};

export default AtsOptimizationPanel; 