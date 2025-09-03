import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
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
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { CV } from '@/types/cv';
import {
  Email,
  Phone,
  LocationOn,
  ArrowDropDown,
  Close as CloseIcon,
  ColorLens,
  LinkedIn,
  GitHub,
  Public,
  Work,
  School,
  Language,
  Description,
  Person,
  Star
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axios';
import { motion } from 'framer-motion';

const LANGUAGES = [
  // flag değerlerini dosya adlarıyla değiştirin
  { code: 'tr', name: 'Türkçe', flag: 'TR.svg' },
  { code: 'en', name: 'English', flag: 'GB.svg' },
  { code: 'de', name: 'Deutsch', flag: 'DE.svg' },
  { code: 'es', name: 'Español', flag: 'ES.svg' },
  { code: 'zh', name: '中文', flag: 'CN.svg' },
  { code: 'ar', name: 'العربية', flag: 'SA.svg' },
  { code: 'hi', name: 'हिन्दी', flag: 'IN.svg' },
];

interface ColorfulTemplateProps {
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
    contactInfo: "İletişim Bilgileri",
    viewCertificate: "Sertifikayı Görüntüle"
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
    contactInfo: "Contact Information",
    viewCertificate: "View Certificate"
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
    contactInfo: "Información de Contacto",
    viewCertificate: "Ver Certificado"
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
    contactInfo: "联系方式",
    viewCertificate: "查看证书"
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
    contactInfo: "معلومات الاتصال",
    viewCertificate: "عرض الشهادة"
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
    contactInfo: "संपर्क जानकारी",
    viewCertificate: "प्रमाणपत्र देखें"
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
    contactInfo: "Kontaktinformationen",
    viewCertificate: "Zertifikat anzeigen"
  }
};

const ColorfulTemplate: React.FC<ColorfulTemplateProps> = ({ cv: initialCv }) => {
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
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent1: '#45B7D1',
    accent2: '#96CEB4',
    accent3: '#FFEEAD',
    background: '#FFFFFF',
    cardBg: '#F8F9FA',
    text: '#2D3436',
    subtext: '#636E72',
    border: '#DFE6E9'
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
      } as any,
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
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>{t('loading')}</Typography>
      </Backdrop>

      {/* Header */}
      <AppBar position="static" color="transparent" elevation={1} sx={{ bgcolor: colors.cardBg }}>
        <Container maxWidth="lg">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ 
                  color: colors.text, 
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
              sx={{ color: colors.text }}
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
                    <Image
    src={`/flags/${lang.flag}`} // lang.flag'ın 'TR.svg' gibi bir dosya adı olduğunu varsayıyoruz
    alt={lang.name}
    width={24} // height={16} ile orantılı bir genişlik
    height={16}
  />
                    {lang.name}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={3}>
                  {cv.personal_info.photo && (
                    <Box
                      component="img"
                      src={cv.personal_info.photo}
                      alt={`${cv.personal_info.first_name} ${cv.personal_info.last_name}`}
                      sx={{
                        width: '160px',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: `4px solid ${colors.primary}`,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        mx: { xs: 'auto', md: 0 },
                        display: 'block'
                      }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={9}>
                  <Typography variant="h4" sx={{ color: colors.primary, mb: 1, fontWeight: 600, textAlign: { xs: 'center', md: 'left' } }}>
                    {cv.personal_info.first_name} {cv.personal_info.last_name}
                  </Typography>
                  <Typography variant="h6" sx={{ color: colors.text, mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
                    {cv.personal_info.full_name || cv.title}
                  </Typography>
                  
                  {cv.personal_info.summary && (
                    <Typography variant="body1" sx={{ 
                      color: colors.text,
                      mb: 2, 
                      textAlign: { xs: 'center', md: 'left' },
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${colors.primary}05`,
                      borderLeft: `3px solid ${colors.primary}`,
                    }}>
                      {cv.personal_info.summary}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                color: colors.primary, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                borderBottom: `2px solid ${colors.primary}20`,
                pb: 1
              }}>
                <Email /> {t('contactInfo')}
              </Typography>
              <Grid container spacing={2}>
                {cv.personal_info.email && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`
                      }
                    }}>
                      <Avatar sx={{ bgcolor: `${colors.primary}15`, color: colors.primary, width: 36, height: 36 }}>
                        <Email fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{cv.personal_info.email}</Typography>
                    </Box>
                  </Grid>
                )}
                {cv.personal_info.phone && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`
                      }
                    }}>
                      <Avatar sx={{ bgcolor: `${colors.primary}15`, color: colors.primary, width: 36, height: 36 }}>
                        <Phone fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{cv.personal_info.phone}</Typography>
                    </Box>
                  </Grid>
                )}
                {cv.personal_info.location && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`
                      }
                    }}>
                      <Avatar sx={{ bgcolor: `${colors.primary}15`, color: colors.primary, width: 36, height: 36 }}>
                        <LocationOn fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">{cv.personal_info.location}</Typography>
                    </Box>
                  </Grid>
                )}
                {cv.personal_info.linkedin && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`
                      }
                    }}>
                      <Avatar sx={{ bgcolor: `${colors.primary}15`, color: colors.primary, width: 36, height: 36 }}>
                        <LinkedIn fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">
                        <a href={cv.personal_info.linkedin} target="_blank" rel="noopener noreferrer" 
                           style={{ color: colors.text, textDecoration: 'none' }}>
                          LinkedIn
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {cv.personal_info.github && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`
                      }
                    }}>
                      <Avatar sx={{ bgcolor: `${colors.primary}15`, color: colors.primary, width: 36, height: 36 }}>
                        <GitHub fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">
                        <a href={cv.personal_info.github} target="_blank" rel="noopener noreferrer" 
                           style={{ color: colors.text, textDecoration: 'none' }}>
                          GitHub
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {cv.personal_info.website && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: `${colors.primary}08`
                      }
                    }}>
                      <Avatar sx={{ bgcolor: `${colors.primary}15`, color: colors.primary, width: 36, height: 36 }}>
                        <Public fontSize="small" />
                      </Avatar>
                      <Typography variant="body2">
                        <a href={cv.personal_info.website} target="_blank" rel="noopener noreferrer" 
                           style={{ color: colors.text, textDecoration: 'none' }}>
                          Website
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </motion.div>

          {/* Skills */}
          {cv.skills && cv.skills.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  color: colors.primary, 
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  borderBottom: `2px solid ${colors.primary}20`,
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Star /> {t('skills')}
                </Typography>
                <Grid container spacing={3}>
                  {cv.skills.map((skill, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ 
                        mb: 2, 
                        p: 1, 
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: `${colors.primary}08`,
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                          <Typography variant="body1" sx={{ 
                            color: colors.text, 
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <ColorLens sx={{ color: colors.primary, mr: 1, fontSize: '1rem' }} />
                            {skill.name}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: colors.primary,
                            bgcolor: `${colors.primary}15`,
                            px: 1,
                            py: 0.5,
                            borderRadius: 5,
                            fontWeight: 600
                          }}>
                            {skill.level}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getSkillLevel(skill.level) * 20}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: `${colors.primary}22`,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: colors.primary,
                              borderRadius: 3,
                              backgroundImage: `linear-gradient(90deg, ${colors.primary}, ${colors.accent1})`
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}

          {/* Languages Section */}
          {cv.languages && cv.languages.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  color: colors.primary, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  borderBottom: `2px solid ${colors.primary}20`,
                  pb: 1
                }}>
                  <Language /> {t('languages')}
                </Typography>
                <Grid container spacing={2}>
                  {cv.languages.map((lang, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Box sx={{
                        bgcolor: `${colors.primary}10`,
                        borderRadius: 2,
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: `${colors.primary}20`,
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 10px rgba(0,0,0,0.05)'
                        }
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}>
                          {lang.name}
                        </Typography>
                        <Chip
                          label={lang.level}
                          size="small"
                          sx={{ 
                            bgcolor: `${colors.primary}15`,
                            color: colors.primary,
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}

          {/* Experience */}
          {cv.experience && cv.experience.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  color: colors.primary, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  borderBottom: `2px solid ${colors.primary}20`,
                  pb: 1
                }}>
                  <Work /> {t('workExperience')}
                </Typography>
                {cv.experience.map((exp, index) => (
                  <Box key={index} sx={{ 
                    mb: index < cv.experience.length - 1 ? 4 : 0,
                    position: 'relative',
                    pl: { xs: 0, md: 4 },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: { xs: 12, md: 16 },
                      top: 40,
                      bottom: 0,
                      width: 2,
                      bgcolor: `${colors.primary}30`,
                      display: { xs: 'none', md: 'block' }
                    }
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: -32,
                            top: 8,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: colors.primary,
                            display: { xs: 'none', md: 'block' }
                          }
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: colors.text, 
                            fontWeight: 600, 
                            fontSize: '1.15rem',
                            mb: 0.5
                          }}>
                            {exp.position}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ 
                            color: colors.primary, 
                            mb: 1,
                            fontWeight: 500, 
                            fontSize: '0.95rem',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            {exp.company}
                            {exp.location && (
                              <>
                                <Box component="span" sx={{ 
                                  display: 'inline-block', 
                                  mx: 0.5, 
                                  bgcolor: colors.primary,
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%'
                                }} />
                                {exp.location}
                              </>
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: colors.subtext, 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                          }}>
                            <Box component="span" sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center', 
                              bgcolor: `${colors.primary}15`,
                              color: colors.primary,
                              px: 1,
                              py: 0.5,
                              borderRadius: 10,
                              mr: 1,
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}>
                              {exp.start_date} - {exp.end_date || t('present')}
                            </Box>
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: colors.text,
                            fontSize: '0.9rem',
                            lineHeight: 1.6
                          }}>
                            {exp.description}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    {index < cv.experience.length - 1 && (
                      <Divider sx={{ my: 3, opacity: 0, display: { xs: 'block', md: 'none' } }} />
                    )}
                  </Box>
                ))}
              </Paper>
            </motion.div>
          )}

          {/* Education */}
          {cv.education && cv.education.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3, 
                  color: colors.primary, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 600,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  borderBottom: `2px solid ${colors.primary}20`,
                  pb: 1
                }}>
                  <School /> {t('education')}
                </Typography>
                <Grid container spacing={3}>
                  {cv.education.map((edu, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Box sx={{ 
                        mb: 3, 
                        p: 2,
                        borderLeft: `3px solid ${colors.secondary}`,
                        borderRadius: 1,
                        bgcolor: `${colors.primary}05`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                          transform: 'translateY(-2px)',
                          bgcolor: `${colors.primary}08`
                        }
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: colors.text, 
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}>
                          {edu.degree}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ 
                          color: colors.primary, 
                          mb: 1,
                          fontWeight: 500,
                          fontSize: '0.95rem'
                        }}>
                          {edu.school}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                          <Typography variant="body2" sx={{ 
                            color: colors.primary,
                            bgcolor: `${colors.primary}15`,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 10,
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {edu.start_date} - {edu.end_date || t('present')}
                          </Typography>
                          {edu.location && (
                            <Typography variant="body2" sx={{ 
                              color: colors.subtext,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 10,
                              fontSize: '0.75rem',
                              bgcolor: 'rgba(0,0,0,0.05)'
                            }}>
                              {edu.location}
                            </Typography>
                          )}
                        </Box>
                        {edu.description && (
                          <Typography variant="body2" sx={{ 
                            color: colors.text,
                            fontSize: '0.85rem',
                            lineHeight: 1.5
                          }}>
                            {edu.description}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}

          {/* Certificates */}
          {cv.certificates && cv.certificates.length > 0 && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, color: colors.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description /> {t('certificates')}
                </Typography>
                <Grid container spacing={3}>
                  {cv.certificates.map((cert, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          height: '100%',
                          bgcolor: `${colors.primary}08`,
                          cursor: cert.documentUrl ? 'pointer' : 'default',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': cert.documentUrl ? {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                          } : {}
                        }}
                        onClick={() => cert.documentUrl && handleCertificateClick(cert)}
                      >
                        <Typography variant="h6" sx={{ color: colors.primary, mb: 1, fontSize: '1.1rem' }}>
                          {cert.name}
                        </Typography>
                        {cert.issuer && (
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1, fontWeight: 500 }}>
                            {cert.issuer}
                          </Typography>
                        )}
                        {cert.date && (
                          <Typography variant="body2" sx={{ color: colors.subtext }}>
                            {cert.date}
                          </Typography>
                        )}
                        {cert.documentUrl && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: colors.primary, 
                              mt: 2,
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            {t('viewCertificate')}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          )}

          {/* Video Section */}
          {cv.video_info?.video_url && (
            <motion.div variants={itemVariants}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: colors.cardBg, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, color: colors.primary }}>
                  {t('videoIntroduction')}
                </Typography>
                <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src={cv.video_info.video_url}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
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
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: colors.text
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedCertificate && (
              <>
                <Typography variant="h5" sx={{ mb: 2, color: colors.text }}>
                  {selectedCertificate.name}
                </Typography>
                {selectedCertificate.description && (
                  <Typography variant="body1" sx={{ mb: 3, color: colors.subtext }}>
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
                        borderRadius: 1
                      }}
                    />
                  ) : (
                    <iframe
                      src={selectedCertificate.documentUrl}
                      style={{
                        width: '100%',
                        height: '70vh',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                      title={selectedCertificate.name}
                    />
                  )
                )}
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ColorfulTemplate; 