import React, { useEffect, useState, useRef } from 'react';
import { CV } from '../../types/cv';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Link,
  Chip,
  CircularProgress,
  LinearProgress,
  Tooltip,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Fade,
  Backdrop,
  Modal,
  Button,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Language,
  School,
  Work,
  Code,
  Star,
  LinkedIn,
  GitHub,
  Public,
  CalendarToday,
  Place,
  Translate,
  Person,
  Videocam,
  Description,
  ArrowDropDown,
  OpenInNew,
  PictureAsPdf,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Flag from 'react-world-flags';
import axiosInstance from '../../services/axios';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import axios from 'axios';

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'zh', name: '中文', flag: 'CN' },
  { code: 'ar', name: 'العربية', flag: 'SA' },
  { code: 'hi', name: 'हिन्दी', flag: 'IN' }
];

const translations = {
  tr: {
    languages: "Yabancı Diller",
    skills: "Yetenekler",
    certificates: "Sertifikalar",
    professionalSummary: "Profesyonel Özet",
    workExperience: "İş Deneyimi",
    education: "Eğitim",
    present: "Devam Ediyor",
    changeLanguage: "Dil Değiştir",
    loading: "Yükleniyor...",
    error: "Bir hata oluştu",
    videoIntroduction: "Video Tanıtım"
  },
  en: {
    languages: "Languages",
    skills: "Skills",
    certificates: "Certificates",
    professionalSummary: "Professional Summary",
    workExperience: "Work Experience",
    education: "Education",
    present: "Present",
    changeLanguage: "Change Language",
    loading: "Loading...",
    error: "An error occurred",
    videoIntroduction: "Video Introduction"
  },
  es: {
    languages: "Idiomas",
    skills: "Habilidades",
    certificates: "Certificados",
    professionalSummary: "Resumen Profesional",
    workExperience: "Experiencia Laboral",
    education: "Educación",
    present: "Presente",
    changeLanguage: "Cambiar Idioma",
    loading: "Cargando...",
    error: "Se produjo un error",
    videoIntroduction: "Video de Introducción"
  },
  zh: {
    languages: "语言",
    skills: "技能",
    certificates: "证书",
    professionalSummary: "专业总结",
    workExperience: "工作经验",
    education: "教育背景",
    present: "至今",
    changeLanguage: "更改语言",
    loading: "加载中...",
    error: "发生错误",
    videoIntroduction: "视频介绍"
  },
  ar: {
    languages: "اللغات",
    skills: "المهارات",
    certificates: "الشهادات",
    professionalSummary: "الملخص المهني",
    workExperience: "الخبرة العملية",
    education: "التعليم",
    present: "حتى الآن",
    changeLanguage: "تغيير اللغة",
    loading: "جار التحميل...",
    error: "حدث خطأ",
    videoIntroduction: "مقدمة فيديو"
  },
  hi: {
    languages: "भाषाएं",
    skills: "कौशल",
    certificates: "प्रमाणपत्र",
    professionalSummary: "व्यावसायिक सारांश",
    workExperience: "कार्य अनुभव",
    education: "शिक्षा",
    present: "वर्तमान",
    changeLanguage: "भाषा बदलें",
    loading: "लोड हो रहा है...",
    error: "एक त्रुटि हुई",
    videoIntroduction: "विडियो परिचय"
  }
};

interface MinimalTemplateProps {
  cv: CV;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ cv: initialCv }) => {
  const router = useRouter();
  const { id, translation_key, lang } = router.query;
  const currentLang = (lang as string) || 'en';
  const t = (key: keyof typeof translations.en) => translations[currentLang as keyof typeof translations]?.[key] || translations.en[key];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cv, setCv] = useState(initialCv);
  const open = Boolean(anchorEl);
  
  // Use ref to store video info
  const videoInfoRef = useRef<typeof cv.video_info>(initialCv.video_info);
  
  // Update ref when video_info changes
  useEffect(() => {
    if (cv.video_info?.video_url) {
      videoInfoRef.current = cv.video_info;
    }
  }, [cv.video_info?.video_url]);

  // Listen for language changes in the URL
  useEffect(() => {
    if (lang && typeof lang === 'string') {
      console.log('Language changed in URL to:', lang);
      
      // When URL language changes, update the CV data
      const fetchCVForLanguage = async () => {
        if (!id || !translation_key) return;
        
        try {
          setIsLoading(true);
          console.log('Fetching CV data for language:', lang);
          
          const response = await axiosInstance.get(`/cvs/${id}/${translation_key}/${lang}/`);
          console.log('Fetched data in useEffect:', response.data);
          
          // Force a re-render by creating a new object
          const newCvData = { ...response.data };
          
          // Preserve video_info if it's missing in the new data but exists in the ref
          if (!newCvData.video_info?.video_url && videoInfoRef.current?.video_url) {
            console.log('Preserving video_info from ref:', videoInfoRef.current);
            newCvData.video_info = videoInfoRef.current;
          }
          
          console.log('Setting new CV data in useEffect:', newCvData);
          
          // Set the state with the new data
          setCv(newCvData);
        } catch (error) {
          console.error('Error fetching CV for language:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCVForLanguage();
    }
  }, [lang, id, translation_key]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!id || !translation_key || !lang) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 seconds

    const connectWebSocket = () => {
      // Close existing connection if any
      if (ws) {
        ws.close();
      }

      // Backend sunucusuna doğrudan bağlan
      const wsUrl = `ws://localhost:8000/ws/cv/${id}/${translation_key}/${lang}/`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connection established successfully');
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          console.log('Received WebSocket message:', event.data);
          try {
            const data = JSON.parse(event.data);
            
            // Preserve video_info if it's missing in the new data but exists in the ref
            if (!data.video_info?.video_url && videoInfoRef.current?.video_url) {
              console.log('Preserving video_info from ref in WebSocket update:', videoInfoRef.current);
              data.video_info = videoInfoRef.current;
            }
            
            setCv(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, reconnectDelay);
          } else {
            console.error('Max reconnection attempts reached');
          }
        };

        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            url: wsUrl
          });

          if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, reconnectDelay);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, [id, translation_key, lang]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (newLang: string) => {
    try {
      setIsLoading(true);
      
      // Use router.query values
      const cvId = id;
      const translationKey = translation_key;
      const templateId = router.asPath.split('/')[2]; // URL'den template_id'yi al

      if (!cvId || !translationKey || !templateId) {
        console.error('Missing required parameters');
        return;
      }

      // Change URL to load the CV in the new language with template
      window.location.href = `/cv/${templateId}/${cvId}/${translationKey}/${newLang}/`;
      
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const [selectedCertificate, setSelectedCertificate] = useState<{ documentUrl?: string; document_type?: string; name?: string; description?: string } | null>(null);
  
  const handleCertificateClick = (cert: { documentUrl?: string; document_type?: string; name?: string; description?: string }) => {
    setSelectedCertificate(cert);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  if (!cv) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentLanguage = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const fullName = `${cv.personal_info.first_name} ${cv.personal_info.last_name}`;

  // Skill seviyelerini 1-5 arası değere dönüştür
  const getSkillLevel = (level?: string) => {
    if (!level) return 3;
    const levels: { [key: string]: number } = {
      'Beginner': 1,
      'Elementary': 2,
      'Intermediate': 3,
      'Advanced': 4,
      'Expert': 5
    };
    return levels[level] || 3;
  };

  return (
    <Box sx={{ bgcolor: '#f9f9f9', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ ml: 2 }}>{t('loading')}</Typography>
        </Backdrop>

        {/* Navbar */}
        <AppBar position="static" color="primary" elevation={1}>
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  CV Builder
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Language Selection */}
                <Tooltip title={t('changeLanguage')}>
                  <IconButton
                    color="inherit"
                    onClick={handleClick}
                    disabled={isLoading}
                  >
                    <Language />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  TransitionComponent={Fade}
                >
                  {LANGUAGES.map((language) => (
                    <MenuItem 
                      key={language.code} 
                      onClick={() => handleLanguageChange(language.code)}
                      selected={language.code === currentLanguage.code}
                      disabled={isLoading}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: '150px'
                      }}
                    >
                      <Flag height="20" code={language.flag} />
                      {language.name}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="md">
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                {cv.personal_info.photo ? (
                  <Avatar
                    src={cv.personal_info.photo}
                    sx={{
                      width: 180,
                      height: 180,
                      mx: 'auto',
                      mb: 3,
                      border: '4px solid',
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 180,
                      height: 180,
                      mx: 'auto',
                      mb: 3,
                      border: '4px solid',
                      borderColor: 'primary.main',
                      boxShadow: 2,
                      fontSize: '4rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {cv.personal_info.first_name?.charAt(0) || ''}{cv.personal_info.last_name?.charAt(0) || ''}
                  </Avatar>
                )}
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  {cv.personal_info.full_name}
                </Typography>
               
               
               
                {cv.personal_info.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: 800,
                      mx: 'auto',
                      mt: 2,
                      mb: 4,
                      color: 'text.secondary',
                      lineHeight: 1.8,
                    }}
                  >
                    {cv.personal_info.description}
                  </Typography>
                )}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 4,
                  flexWrap: 'wrap',
                  '& a': {
                    color: 'text.primary',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.main' }
                  }
                }}>
                  {cv.personal_info.email && (
                    <Tooltip title="Email">
                      <Link href={`mailto:${cv.personal_info.email}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        {cv.personal_info.email}
                      </Link>
                    </Tooltip>
                  )}
                  {cv.personal_info.phone && (
                    <Tooltip title="Phone">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" />
                        {cv.personal_info.phone}
                      </Box>
                    </Tooltip>
                  )}
                  {cv.personal_info.address && (
                    <Tooltip title="Location">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        {cv.personal_info.address}
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Grid container spacing={6}>
                {/* Left Column */}
                <Grid item xs={12} md={4}>
                  {/* Languages Section */}
                  <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                    }}>
                      <Language /> {t('languages')}
                    </Typography>
                    <List>
                      {cv.languages.map((lang, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {lang.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {lang.level}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <LinearProgress 
                                variant="determinate" 
                                value={getSkillLevel(lang.level) * 20} 
                                sx={{ 
                                  mt: 1, 
                                  height: 6, 
                                  borderRadius: 1,
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'primary.main'
                                  }
                                }}
                              />
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Skills Section */}
                  <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                    }}>
                      <Code /> {t('skills')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {cv.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={`${skill.name} (${skill.level})`}
                          color="primary"
                          variant="filled"
                          sx={{ 
                            borderRadius: '8px',
                            '& .MuiChip-label': {
                              fontWeight: 500
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Certificates Section */}
                  {cv.certificates.length > 0 && (
                    <Box sx={{ mb: 6 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontWeight: 600,
                        color: 'primary.main',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        pb: 1,
                      }}>
                        <Star /> {t('certificates')}
                      </Typography>
                      <List>
                        {cv.certificates.map((cert, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 2 }}>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                  {cert.name}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {cert.issuer}
                                  </Typography>
                                  {cert.date && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                      <CalendarToday fontSize="small" />
                                      {cert.date}
                                    </Typography>
                                  )}
                                  {cert.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      {cert.description}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                            {cert.documentUrl && (
                              <IconButton
                                size="small"
                                onClick={() => handleCertificateClick(cert)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    backgroundColor: 'primary.light',
                                    color: 'white'
                                  }
                                }}
                              >
                                {cert.document_type === 'image' ? <ImageIcon /> : <PictureAsPdf />}
                              </IconButton>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={8}>
                  {/* Video Section */}
                  {cv.video_info && cv.video_info.video_url && cv.video_info.video_url.trim() !== '' && (
                    <>
                      {console.log('Rendering video section in MinimalTemplate, video_url:', cv.video_info.video_url)}
                      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Videocam sx={{ mr: 1.5, color: 'text.secondary' }} />
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {t('videoIntroduction')}
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                          <video
                            controls
                            style={{ 
                              width: '100%', 
                              maxWidth: '640px', 
                              borderRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                            src={cv.video_info.video_url}
                            onError={(e) => {
                              console.error('Video loading error:', e);
                              // Video yüklenemezse elementi gizle
                              const target = e.target as HTMLVideoElement;
                              target.style.display = 'none';
                              // Hata mesajı göster
                              const parent = target.parentElement;
                              if (parent) {
                                const errorMsg = document.createElement('p');
                                errorMsg.textContent = 'Video yüklenemedi.';
                                errorMsg.style.color = 'red';
                                parent.appendChild(errorMsg);
                              }
                            }}
                          />
                        </Box>
                        
                        {cv.video_info.description && (
                          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                            {cv.video_info.description}
                          </Typography>
                        )}
                      </Paper>
                    </>
                  )}

                  {/* Summary Section */}
                  {cv.personal_info.summary && (
                    <Box sx={{ mb: 6 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontWeight: 600,
                        color: 'primary.main',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        pb: 1,
                        mb: 3,
                      }}>
                        <Person /> {t('professionalSummary')}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.8,
                          fontWeight: 'bold',
                          fontStyle: 'italic',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                          pl: 2,
                          py: 1,
                        }}
                      >
                        {cv.personal_info.summary}
                      </Typography>
                    </Box>
                  )}

                  {/* Experience Section */}
                  <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                      mb: 3,
                    }}>
                      <Work /> {t('workExperience')}
                    </Typography>
                    {cv.experience.map((exp, index) => (
                      <Box key={index} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {exp.position}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {exp.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Place fontSize="small" />
                            {exp.location}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mb: 2
                        }}>
                          <CalendarToday fontSize="small" />
                          {exp.start_date} - {exp.end_date || t('present')}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.8
                        }}>
                          {exp.description}
                        </Typography>
                        {index < cv.experience.length - 1 && <Divider sx={{ mt: 3 }} />}
                      </Box>
                    ))}
                  </Box>

                  {/* Education Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 600,
                      color: 'primary.main',
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                      mb: 3,
                    }}>
                      <School /> {t('education')}
                    </Typography>
                    {cv.education.map((edu, index) => (
                      <Box key={index} sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {edu.degree}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {edu.school}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <Place fontSize="small" />
                            {edu.location}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mb: 2
                        }}>
                          <CalendarToday fontSize="small" />
                          {edu.start_date} - {edu.end_date || t('present')}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.8
                        }}>
                          {edu.description}
                        </Typography>
                        {index < cv.education.length - 1 && <Divider sx={{ mt: 3 }} />}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Container>

        {/* Certificate Modal */}
        <Modal
          open={Boolean(selectedCertificate)}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& .MuiModal-backdrop': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          <Fade in={Boolean(selectedCertificate)}>
            <Box
              sx={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                overflow: 'auto',
              }}
            >
              {selectedCertificate?.name && (
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  {selectedCertificate.name}
                </Typography>
              )}
              
              {selectedCertificate?.description && (
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedCertificate.description}
                </Typography>
              )}
              
              {selectedCertificate?.document_type === 'image' ? (
                <img
                  src={selectedCertificate.documentUrl}
                  alt="Certificate"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <iframe
                  src={selectedCertificate?.documentUrl}
                  style={{
                    width: '100%',
                    height: '80vh',
                    border: 'none',
                  }}
                />
              )}
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Fade>
        </Modal>
      </Container>
    </Box>
  );
};

export default MinimalTemplate; 