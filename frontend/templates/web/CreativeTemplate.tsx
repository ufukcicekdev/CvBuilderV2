import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Button, 
  AppBar, 
  Toolbar, 
  Container, 
  Fade, 
  Backdrop, 
  CircularProgress, 
  Modal,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import { CV } from '@/types/cv';
import {
  Email,
  Phone,
  LocationOn,
  ArrowDropDown,
  Close as CloseIcon,
  Palette,
  Code,
  School,
  Language,
  Work,
  Description,
  Menu as MenuIcon,
  Person,
  Image as ImageIcon,
  PictureAsPdf,
  LinkedIn,
  GitHub,
  Public
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Flag from 'react-world-flags';
import axiosInstance from '@/utils/axios';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'zh', name: '中文', flag: 'CN' },
  { code: 'ar', name: 'العربية', flag: 'SA' },
  { code: 'hi', name: 'हिन्दी', flag: 'IN' },
  { code: 'de', name: 'Deutsch', flag: 'DE' }
];

interface CreativeTemplateProps {
  cv: CV;
}

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
    videoIntroduction: "Video Tanıtım",
    viewCertificate: "Sertifikayı Görüntüle",
    contactInfo: "İletişim Bilgileri"
  },
  de: {
    languages: "Sprachen",
    skills: "Fähigkeiten",
    certificates: "Zertifikate",
    professionalSummary: "Berufliche Zusammenfassung",
    workExperience: "Berufserfahrung",
    education: "Ausbildung",
    present: "Aktuell",
    changeLanguage: "Sprache ändern",
    loading: "Laden...",
    error: "Ein Fehler ist aufgetreten",
    videoIntroduction: "Video-Vorstellung",
    viewCertificate: "Zertifikat anzeigen",
    contactInfo: "Kontaktinformationen"
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
    videoIntroduction: "Video Introduction",
    viewCertificate: "View Certificate",
    contactInfo: "Contact Information"
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
    videoIntroduction: "Introducción en Video",
    viewCertificate: "Ver Certificado",
    contactInfo: "Información de Contacto"
  },
  zh: {
    languages: "语言能力",
    skills: "技能",
    certificates: "证书",
    professionalSummary: "专业摘要",
    workExperience: "工作经验",
    education: "教育背景",
    present: "至今",
    changeLanguage: "更换语言",
    loading: "加载中...",
    error: "发生错误",
    videoIntroduction: "视频介绍",
    viewCertificate: "查看证书",
    contactInfo: "联系方式"
  },
  ar: {
    languages: "اللغات",
    skills: "المهارات",
    certificates: "الشهادات",
    professionalSummary: "ملخص مهني",
    workExperience: "الخبرة العملية",
    education: "التعليم",
    present: "حتى الآن",
    changeLanguage: "تغيير اللغة",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    videoIntroduction: "مقدمة فيديو",
    viewCertificate: "عرض الشهادة",
    contactInfo: "معلومات الاتصال"
  },
  hi: {
    languages: "भाषाएँ",
    skills: "कौशल",
    certificates: "प्रमाणपत्र",
    professionalSummary: "पेशेवर सारांश",
    workExperience: "कार्य अनुभव",
    education: "शिक्षा",
    present: "वर्तमान",
    changeLanguage: "भाषा बदलें",
    loading: "लोड हो रहा है...",
    error: "एक त्रुटि हुई",
    videoIntroduction: "वीडियो परिचय",
    viewCertificate: "प्रमाणपत्र देखें",
    contactInfo: "संपर्क जानकारी"
  }
};

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ cv: initialCv }) => {
  const [cv, setCv] = useState<CV>(initialCv);
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CV['certificates'][0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (router.query.lang && typeof router.query.lang === 'string') {
      // Update current language state
      setCurrentLang(router.query.lang);
      
      // When URL language changes, update the CV data
      const fetchCVForLanguage = async () => {
        if (!router.query.id || !router.query.translation_key) return;
        
        try {
          setIsLoading(true);
          
          const response = await axiosInstance.get(`/cvs/${router.query.id}/${router.query.translation_key}/${router.query.lang}/`);
          
          // Force a re-render by creating a new object
          const newCvData = { ...response.data };
          
          // Preserve video_info if it's missing in the new data but exists in the ref
          if (!newCvData.video_info?.video_url && videoInfoRef.current?.video_url) {
            newCvData.video_info = videoInfoRef.current;
          }
          
          // Set the state with the new data
          setCv(newCvData);
        } catch (error) {
          console.error('Error fetching CV for language:', error);
          setError(t('error'));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCVForLanguage();
    }
  }, [router.query]);

  const colors = {
    primary: '#6200EA',
    secondary: '#03DAC6',
    accent: '#FF4081',
    dark: '#121212',
    light: '#FFFFFF',
    background: '#F7F7F7',
    cardBg: '#FFFFFF',
    text: '#121212',
    subtext: '#6E6E6E',
    border: '#E0E0E0'
  };

  const t = (key: keyof typeof translations.en) => translations[currentLang as keyof typeof translations]?.[key] || translations.en[key];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

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
      const cvId = router.query.id;
      const translationKey = router.query.translation_key;
      const templateId = router.asPath.split('/')[2];

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

  const handleCertificateClick = (cert: CV['certificates'][0]) => {
    setSelectedCertificate(cert);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCertificate(null);
  };

  const getSkillLevel = (level?: string | number) => {
    if (typeof level === 'number') {
      return Math.min(Math.max(Math.round(level / 20), 0), 5);
    }

    if (!level || typeof level !== 'string') {
      return 3;
    }

    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case 'expert':
        return 5;
      case 'advanced':
        return 4;
      case 'intermediate':
        return 3;
      case 'beginner':
        return 2;
      default:
        return 3;
    }
  };

  if (!cv) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', pb: 3 }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>{t('loading')}</Typography>
      </Backdrop>

      {/* Navbar */}
      <AppBar position="static" color="transparent" elevation={1} sx={{ bgcolor: colors.dark }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
                {cv.personal_info.first_name} {cv.personal_info.last_name}
              </Typography>
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ 
                  color: colors.light, 
                  opacity: 0.8,
                  cursor: 'pointer'
                }}
                onClick={() => window.location.href = '/'}
              >
                CV Builder
              </Typography>
            </Box>
            <Button
              id="language-button"
              onClick={handleClick}
              endIcon={<ArrowDropDown />}
              sx={{ color: colors.light }}
            >
              {LANGUAGES.find(lang => lang.code === currentLang)?.name || 'English'}
            </Button>
            <Menu
              id="language-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem 
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  selected={currentLang === lang.code}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Flag code={lang.flag} height="16" />
                    {lang.name}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: colors.dark,
          color: colors.light,
          py: 4,
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: `linear-gradient(45deg, ${colors.primary}88 0%, ${colors.secondary}88 100%)`,
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
            opacity: 0.8
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '70%',
            height: '50%',
            background: `linear-gradient(45deg, ${colors.primary}88 0%, ${colors.accent}88 100%)`,
            clipPath: 'polygon(0 100%, 100% 100%, 0 0)',
            opacity: 0.6
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              {cv.personal_info.photo && (
                <Grid item xs={12} md={4}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '70%',
                        paddingTop: '70%',
                        borderRadius: '50%',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                        border: `3px solid ${colors.light}`,
                        mx: 'auto',
                        overflow: 'hidden'
                      }}
                    >
                      <Image
                        src={cv.personal_info.photo}
                        alt={`${cv.personal_info.first_name} ${cv.personal_info.last_name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{
                          objectFit: 'cover',
                          borderRadius: '50%',
                        }}
                        priority
                      />
                    </Box>
                  </motion.div>
                </Grid>
              )}
              <Grid item xs={12} md={cv.personal_info.photo ? 8 : 12}>
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    mb: 1, 
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {cv.personal_info.first_name} <Box component="span" sx={{ color: colors.secondary }}>{cv.personal_info.last_name}</Box>
                  </Typography>
                </motion.div>
                
                <motion.div 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Typography variant="h6" sx={{ mb: 2, opacity: 0.9, color: colors.secondary }}>
                    {cv.personal_info.full_name || cv.title}
                  </Typography>
                </motion.div>

                {cv.personal_info.summary && (
                  <motion.div 
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Typography variant="body1" sx={{ 
                      maxWidth: '800px', 
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      opacity: 0.8
                    }}>
                      {cv.personal_info.summary}
                    </Typography>
                  </motion.div>
                )}
                
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    {cv.personal_info.email && (
                      <Chip 
                        icon={<Email sx={{ color: colors.light }} />} 
                        label={cv.personal_info.email}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.light,
                          borderRadius: '8px',
                          px: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                    )}
                    
                    {cv.personal_info.phone && (
                      <Chip 
                        icon={<Phone sx={{ color: colors.light }} />} 
                        label={cv.personal_info.phone}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.light,
                          borderRadius: '8px',
                          px: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                    )}
                    
                    {cv.personal_info.location && (
                      <Chip 
                        icon={<LocationOn sx={{ color: colors.light }} />} 
                        label={cv.personal_info.location}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.light,
                          borderRadius: '8px',
                          px: 1,
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                    )}
                    
                    {cv.personal_info.linkedin && (
                      <Chip 
                        icon={<LinkedIn sx={{ color: colors.light }} />}
                        label="LinkedIn"
                        component="a"
                        href={cv.personal_info.linkedin}
                        target="_blank" 
                        rel="noopener noreferrer"
                        clickable
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.light,
                          borderRadius: '8px',
                          px: 1,
                          backdropFilter: 'blur(4px)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      />
                    )}
                    
                    {cv.personal_info.github && (
                      <Chip 
                        icon={<GitHub sx={{ color: colors.light }} />}
                        label="GitHub"
                        component="a"
                        href={cv.personal_info.github}
                        target="_blank" 
                        rel="noopener noreferrer"
                        clickable
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.light,
                          borderRadius: '8px',
                          px: 1,
                          backdropFilter: 'blur(4px)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      />
                    )}
                    
                    {cv.personal_info.website && (
                      <Chip 
                        icon={<Public sx={{ color: colors.light }} />}
                        label="Website"
                        component="a"
                        href={cv.personal_info.website}
                        target="_blank" 
                        rel="noopener noreferrer"
                        clickable
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: colors.light,
                          borderRadius: '8px',
                          px: 1,
                          backdropFilter: 'blur(4px)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      />
                    )}
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Professional Summary Section */}
          {cv.personal_info.summary && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.primary}, ${colors.accent})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.primary
                  }}>
                    <Person /> {t('professionalSummary')}
                  </Typography>
                  
                  <Box sx={{
                    bgcolor: 'rgba(98, 0, 234, 0.03)',
                    borderRadius: 2,
                    p: 2,
                    borderLeft: `4px solid ${colors.primary}`,
                  }}>
                    <Typography variant="body1" sx={{
                      color: colors.text,
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}>
                      {cv.personal_info.summary}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          )}
          
          {/* Skills Section */}
          {cv.skills && cv.skills.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.primary
                  }}>
                    <Palette /> {t('skills')}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {cv.skills.map((skill, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: colors.text }}>
                              {skill.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.primary }}>
                              {skill.level || ''}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getSkillLevel(skill.level) * 20}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              bgcolor: 'rgba(98, 0, 234, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                                borderRadius: 6
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          )}
          
          {/* Languages Section */}
          {cv.languages && cv.languages.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.primary}, ${colors.accent})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.primary
                  }}>
                    <Language /> {t('languages')}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {cv.languages.map((lang, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(98, 0, 234, 0.03)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          transition: 'transform 0.3s',
                          '&:hover': {
                            transform: 'translateY(-5px)'
                          }
                        }}>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {lang.name}
                          </Typography>
                          <Box sx={{ width: '100%', mb: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={getSkillLevel(lang.level) * 20}
                              sx={{
                                height: 12,
                                borderRadius: 6,
                                bgcolor: 'rgba(98, 0, 234, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                                  borderRadius: 6
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: colors.primary }}>
                            {lang.level}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          )}
          
          {/* Experience Section */}
          {cv.experience && cv.experience.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.secondary}, ${colors.primary})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.primary
                  }}>
                    <Work /> {t('workExperience')}
                  </Typography>
                  
                  {cv.experience.map((exp, index) => (
                    <Box key={index} sx={{ mb: index < cv.experience.length - 1 ? 4 : 0 }}>
                      <Box sx={{ 
                        display: 'inline-block', 
                        bgcolor: colors.primary, 
                        color: colors.light,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.8rem',
                        mb: 1,
                        fontWeight: 'bold'
                      }}>
                        {exp.start_date} - {exp.end_date || t('present')}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {exp.position}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: colors.secondary, mb: 2 }}>
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.subtext }}>
                        {exp.description}
                      </Typography>
                      {index < cv.experience.length - 1 && (
                        <Divider sx={{ mt: 3, opacity: 0.3 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          )}
          
          {/* Education Section */}
          {cv.education && cv.education.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.secondary}, ${colors.accent})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.primary
                  }}>
                    <School /> {t('education')}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {cv.education.map((edu, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Paper elevation={0} sx={{ 
                          bgcolor: 'rgba(3, 218, 198, 0.03)', 
                          mb: 2, 
                          borderRadius: 2,
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                          }
                        }}>
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ 
                              display: 'inline-block', 
                              bgcolor: colors.secondary, 
                              color: colors.dark,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.8rem',
                              mb: 1,
                              fontWeight: 'bold'
                            }}>
                              {edu.start_date} - {edu.end_date || t('present')}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {edu.degree}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: colors.primary, mb: 2 }}>
                              {edu.school}
                              {edu.location && ` • ${edu.location}`}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.subtext }}>
                              {edu.description}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          )}

          {/* Certificates Section */}
          {cv.certificates && cv.certificates.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.accent}, ${colors.secondary})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.primary
                  }}>
                    <Description /> {t('certificates')}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {cv.certificates.map((cert, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper elevation={0} sx={{ 
                          bgcolor: 'rgba(3, 218, 198, 0.05)', 
                          mb: 2, 
                          borderRadius: 2,
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          cursor: cert.documentUrl ? 'pointer' : 'default',
                          '&:hover': cert.documentUrl ? {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                          } : {}
                        }}
                        onClick={() => cert.documentUrl && handleCertificateClick(cert)}
                        >
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: colors.primary }}>
                              {cert.name}
                            </Typography>
                            {cert.issuer && (
                              <Typography variant="subtitle1" sx={{ color: colors.secondary, mb: 1 }}>
                                {cert.issuer}
                              </Typography>
                            )}
                            {cert.date && (
                              <Typography variant="body2" sx={{ 
                                display: 'inline-block', 
                                bgcolor: colors.primary + '22', 
                                color: colors.primary,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.8rem',
                                mb: 1,
                                fontWeight: 'medium'
                              }}>
                                {cert.date}
                              </Typography>
                            )}
                            {cert.documentUrl && (
                              <Box sx={{ 
                                mt: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                color: colors.primary,
                                fontWeight: 'medium',
                                fontSize: '0.9rem'
                              }}>
                                {t('viewCertificate')} 
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: colors.primary,
                                    ml: 1,
                                    '&:hover': {
                                      backgroundColor: `${colors.primary}22`,
                                      color: colors.primary
                                    }
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleCertificateClick(cert);
                                  }}
                                >
                                  {cert.document_type === 'image' ? <ImageIcon /> : <PictureAsPdf />}
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          )}

          {/* Video Section */}
          {cv.video_info?.video_url && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 4,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  background: `linear-gradient(to bottom, ${colors.accent}, ${colors.primary})`,
                }
              }}>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="h5" sx={{ 
                    mb: 3, 
                    fontWeight: 'bold', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    color: colors.accent
                  }}>
                    {t('videoIntroduction')}
                  </Typography>
                  <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 2, overflow: 'hidden' }}>
                    <iframe
                      src={cv.video_info.video_url}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      </Container>

      {/* Certificate Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
      >
        <Fade in={modalOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 800,
            bgcolor: colors.cardBg,
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
            p: 4,
          }}>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                color: colors.text,
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedCertificate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Typography variant="h4" sx={{ mb: 2, color: colors.primary, fontWeight: 'bold' }}>
                  {selectedCertificate.name}
                </Typography>
                {selectedCertificate.description && (
                  <Typography variant="body1" sx={{ mb: 4, color: colors.subtext }}>
                    {selectedCertificate.description}
                  </Typography>
                )}
                {selectedCertificate.documentUrl && (
                  selectedCertificate.document_type === 'image' ? (
                    <Box
                      component="img"
                      src={selectedCertificate.documentUrl}
                      alt={selectedCertificate.name}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  ) : (
                    <Box sx={{ position: 'relative', pt: '56.25%', borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                      <iframe
                        src={selectedCertificate.documentUrl}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        title={selectedCertificate.name}
                      />
                    </Box>
                  )
                )}
              </motion.div>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CreativeTemplate; 