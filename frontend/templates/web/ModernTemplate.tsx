import React, { useEffect, useRef } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Divider, Chip, IconButton, Tooltip, Menu, MenuItem, Button, AppBar, Toolbar, Container, Fade, Backdrop, CircularProgress, Modal } from '@mui/material';
import { CV } from '@/types/cv';
import {
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  GitHub,
  Public,
  Work,
  School,
  Code,
  Language,
  Star,
  Translate,
  PictureAsPdf,
  Image as ImageIcon,
  Close as CloseIcon,
  Person,
  Videocam,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Flag from 'react-world-flags';
import axiosInstance from '@/utils/axios';
import { useTranslation } from 'next-i18next';
import axios from 'axios';

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'zh', name: '中文', flag: 'CN' },
  { code: 'ar', name: 'العربية', flag: 'SA' },
  { code: 'hi', name: 'हिन्दी', flag: 'IN' }
];

interface ModernTemplateProps {
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
    videoIntroduction: "Introducción en Video"
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
  }
};

const ModernTemplate: React.FC<ModernTemplateProps> = ({ cv: initialCv }) => {
  const router = useRouter();
  const { id, translation_key, lang } = router.query;
  const currentLang = (lang as string) || 'en';
  const t = (key: keyof typeof translations.en) => translations[currentLang as keyof typeof translations]?.[key] || translations.en[key];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [cv, setCv] = React.useState(initialCv);
  const [selectedCertificate, setSelectedCertificate] = React.useState<{ documentUrl?: string; document_type?: string; name?: string; description?: string } | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
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
      // console.log('Language changed in URL to:', lang);
      
      // When URL language changes, update the CV data
      const fetchCVForLanguage = async () => {
        if (!id || !translation_key) return;
        
        try {
          setIsLoading(true);
          // console.log('Fetching CV data for language:', lang);
          
          const response = await axiosInstance.get(`/cvs/${id}/${translation_key}/${lang}/`);
          // console.log('Fetched data in useEffect:', response.data);
          
          // Force a re-render by creating a new object
          const newCvData = { ...response.data };
          
          // Preserve video_info if it's missing in the new data but exists in the ref
          if (!newCvData.video_info?.video_url && videoInfoRef.current?.video_url) {
            // console.log('Preserving video_info from ref:', videoInfoRef.current);
            newCvData.video_info = videoInfoRef.current;
          }
          
          // console.log('Setting new CV data in useEffect:', newCvData);
          
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

  // CV state'i değiştiğinde log ekleyelim
  useEffect(() => {
    // console.log('CV state updated:', cv);
  }, [cv]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!id || !translation_key || !lang) return;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10; // Daha fazla yeniden bağlanma denemesi
    const reconnectDelay = 3000; // 3 seconds
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let pingInterval: NodeJS.Timeout | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;
    let lastMessageTime = Date.now(); // Son mesaj zamanı
    let connectionCheckInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      // console.log('Attempting to connect to WebSocket with params:', { id, translation_key, lang });
      
      // Close existing connection if any
      if (ws) {
        ws.close();
        ws = null;
      }

      // Clear any existing timeouts and intervals
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
      
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
      }
      
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
      }

      // Template ID'yi URL'den al
      const templateId = router.asPath.split('/')[2] || 'web-template1'; // Varsayılan değer
      
      // Backend sunucusuna doğrudan bağlan
      // API URL'yi .env dosyasından alıyoruz
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // ws:// veya wss:// protokolünü belirle
      const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
      // URL'den http:// veya https:// kısmını çıkar
      const apiHost = apiUrl.replace(/^https?:\/\//, '');
      
      // WebSocket URL'sini talimatlara göre oluştur:
      // 1. Template ID
      // 2. CV ID
      // 3. Translation Key
      // 4. Language
      const wsUrl = `${wsProtocol}://${apiHost}/ws/cv/${templateId}/${id}/${translation_key}/${lang}/`;
      // console.log('WebSocket URL with correct parameters:', wsUrl);
      
      // Grup adını backend'in beklediği formatta oluştur
      const groupName = `cv_${templateId}_${id}_${translation_key}_${lang}`;
      // console.log('WebSocket group name:', groupName);
      
      try {
        // WebSocket bağlantısını oluştur
        ws = new WebSocket(wsUrl);
        // console.log('WebSocket instance created, readyState:', ws.readyState);
        
        // Bağlantı durumunu kontrol et
        // console.log('WebSocket connection state:', {
        //   CONNECTING: ws.readyState === WebSocket.CONNECTING,
        //   OPEN: ws.readyState === WebSocket.OPEN,
        //   CLOSING: ws.readyState === WebSocket.CLOSING,
        //   CLOSED: ws.readyState === WebSocket.CLOSED
        // });

        // Bağlantı zaman aşımı - 15 saniye
        connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection timeout after 15 seconds');
            ws.close();
            
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              // console.log(`Connection timeout. Reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
              reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
            }
          }
        }, 15000);

        ws.onopen = () => {
          // console.log('WebSocket connection established successfully, readyState:', ws?.readyState);
          lastMessageTime = Date.now();
          
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          
          reconnectAttempts = 0;
          
          // Bağlantıyı canlı tutmak için her 20 saniyede bir ping gönder
          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              // console.log('Sending ping to keep connection alive');
              try {
                ws.send(JSON.stringify({ action: 'ping', timestamp: Date.now() }));
                lastMessageTime = Date.now();
              } catch (error) {
                console.error('Error sending ping:', error);
              }
            } else {
              console.warn('Cannot send ping, WebSocket not open. readyState:', ws?.readyState);
            }
          }, 20000);
          
          // Bağlantı durumunu düzenli olarak kontrol et
          connectionCheckInterval = setInterval(() => {
            const now = Date.now();
            const timeSinceLastMessage = now - lastMessageTime;
            
            // console.log('Connection check - Time since last message:', timeSinceLastMessage / 1000, 'seconds');
            
            // 60 saniyeden fazla mesaj alınmadıysa bağlantıyı yeniden kur
            if (timeSinceLastMessage > 60000) {
              console.warn('No messages received for 60 seconds, reconnecting...');
              if (ws) {
                ws.close();
                ws = null;
              }
              connectWebSocket();
            }
          }, 30000);
          
          // Bağlantı kurulduğunda bir başlangıç mesajı gönder
          try {
            // console.log('Sending init message to server');
            if (ws && ws.readyState === WebSocket.OPEN) {
              // Bağlantı bilgilerini gönder
              ws.send(JSON.stringify({ 
                action: 'init', 
                template_id: templateId,
                cv_id: id,
                translation_key: translation_key,
                lang: lang,
                group_name: groupName,
                timestamp: Date.now() 
              }));
              
              // CV verisini talep et
              // console.log('Requesting CV data from server');
              ws.send(JSON.stringify({ 
                action: 'get_cv_data', 
                template_id: templateId,
                cv_id: id,
                translation_key: translation_key,
                lang: lang
              }));
            } else {
              console.error('Cannot send init message, WebSocket not open. readyState:', ws?.readyState);
            }
          } catch (error) {
            console.error('Error sending init message:', error);
          }
        };

        ws.onmessage = (event) => {
          // console.log('Received WebSocket message:', event.data);
          lastMessageTime = Date.now();
          
          // Ham mesajı loglayalım
          // console.log('Raw message type:', typeof event.data);
          // console.log('Raw message length:', event.data.length);
          
          // Düz metin ping/pong mesajlarını kontrol et
          if (typeof event.data === 'string') {
            if (event.data === 'ping' || event.data === 'pong') {
              // console.log('Received plain text ping/pong from server');
              // Ping mesajına pong ile yanıt ver
              if (event.data === 'ping' && ws && ws.readyState === WebSocket.OPEN) {
                ws.send('pong');
              }
              return;
            }
            
            // Mesaj içeriğini kontrol et
            // console.log('Message content first 100 chars:', event.data.substring(0, 100));
          }
          
          try {
            // Mesajı JSON olarak parse et
            const parsedData = JSON.parse(event.data);
            // console.log('Parsed WebSocket message:', parsedData);
            
            // Mesaj tipine göre işlem yap (type veya action alanını kontrol et)
            if (parsedData.type === 'pong' || parsedData.action === 'pong') {
              // console.log('Received JSON pong from server');
              return;
            }
            
            if (parsedData.type === 'ping' || parsedData.action === 'ping') {
              // console.log('Received JSON ping from server');
              // Ping mesajına pong ile yanıt ver
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ action: 'pong', timestamp: Date.now() }));
              }
              return;
            }
            
            // Gelen mesaj içeriğini console'a detaylıca yazdır
            // console.log('CV data update received. Checking format...');
            // console.log('Message has "message" field:', parsedData.hasOwnProperty('message'));
            // console.log('Message has "id" field:', parsedData.hasOwnProperty('id') || (parsedData.message && parsedData.message.hasOwnProperty('id')));
            
            // Veri format kontrolü
            let cvData: any = null;
            
            // Durum 1: Direkt CV verisi geldi
            if (parsedData.id && (parsedData.personal_info || parsedData.education || parsedData.experience)) {
              // console.log('Direct CV data format detected');
              cvData = parsedData;
            }
            // Durum 2: Mesaj içinde CV verisi var (message alanı içinde)
            else if (parsedData.message && typeof parsedData.message === 'object' && 
                     parsedData.message.id && (parsedData.message.personal_info || parsedData.message.education || parsedData.message.experience)) {
              // console.log('CV data inside message field detected');
              cvData = parsedData.message;
            }
            // Durum 3: Mesaj içinde string olarak JSON data var
            else if (parsedData.message && typeof parsedData.message === 'string') {
              try {
                const innerData = JSON.parse(parsedData.message);
                if (innerData.id && (innerData.personal_info || innerData.education || innerData.experience)) {
                  // console.log('CV data as string inside message field detected');
                  cvData = innerData;
                }
              } catch (err) {
                // console.log('Message contains string but not valid JSON CV data');
              }
            }
            
            // CV verisi varsa state'i güncelle
            if (cvData) {
              // console.log('Valid CV data found, updating state:', cvData);
              
              // Preserve video_info if it's missing in the new data but exists in the ref
              if (!cvData.video_info?.video_url && videoInfoRef.current?.video_url) {
                // console.log('Preserving video_info from ref in WebSocket update:', videoInfoRef.current);
                cvData.video_info = videoInfoRef.current;
              }
              
              // State'i güncelle ve UI'ı yeniden render et
              setCv((prevCv: CV) => {
                // Sadece varolan değerleri güncelle, eksik alanları korumaya çalış
                const mergedData = { 
                  ...prevCv,
                  ...cvData,
                  // Önemli nesne alanlarını özel olarak birleştir
                  personal_info: { ...(prevCv?.personal_info || {}), ...(cvData.personal_info || {}) },
                  education: cvData.education || prevCv?.education || [],
                  experience: cvData.experience || prevCv?.experience || [],
                  skills: cvData.skills || prevCv?.skills || [],
                  languages: cvData.languages || prevCv?.languages || [],
                  certificates: cvData.certificates || prevCv?.certificates || []
                };
                
                // console.log('State updated with merged data');
                return mergedData;
              });
            } else {
              // console.log('No valid CV data found in the message, ignoring');
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            // JSON parse hatası olduğunda mesajı loglayalım
            // console.error('Raw message that failed to parse:', event.data);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          console.error('WebSocket readyState:', ws?.readyState);
          console.error('WebSocket URL:', wsUrl);
          
          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            // console.log(`WebSocket error. Reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
            reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
          } else {
            console.error('Max reconnection attempts reached');
          }
        };

        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            url: wsUrl,
            readyState: ws?.readyState
          });

          if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
          }
          
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          
          if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval);
            connectionCheckInterval = null;
          }

          if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            // console.log(`Connection closed. Reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
            reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          // console.log(`Error creating WebSocket. Reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
          reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
        }
      }
    };

    connectWebSocket();

    return () => {
      // console.log('Cleaning up WebSocket connection');
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

  const handleCertificateClick = (cert: { documentUrl?: string; document_type?: string; name?: string; description?: string }) => {
    setSelectedCertificate(cert);
  };

  const handleCloseModal = () => {
    setSelectedCertificate(null);
  };

  const currentLanguage = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const fullName = `${cv.personal_info.first_name} ${cv.personal_info.last_name}`;

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
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
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg">
          {/* Header Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)',
                backgroundSize: '30px 30px',
                opacity: 0.1,
                pointerEvents: 'none'
              }
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {cv.personal_info.photo ? (
                  <Avatar
                    src={cv.personal_info.photo}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mx: { xs: 'auto', md: 0 },
                      border: '4px solid white',
                      boxShadow: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                ) : (
                  <Avatar
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mx: { xs: 'auto', md: 0 },
                      border: '4px solid white',
                      boxShadow: 2,
                      fontSize: '3rem',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {cv.personal_info.first_name?.[0]}{cv.personal_info.last_name?.[0]}
                  </Avatar>
                )}
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 600,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}>
                  {cv.personal_info.full_name}
                </Typography>
               
                {cv.personal_info.description && (
                  <Typography variant="body1" sx={{ 
                    mt: 2, 
                    mb: 3,
                    opacity: 0.9,
                    lineHeight: 1.6,
                    maxWidth: '800px',
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}>
                    {cv.personal_info.description}
                  </Typography>
                )}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  flexWrap: 'wrap',
                  mt: 2,
                  '& a': { 
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.8 }
                  }
                }}>
                  {cv.personal_info.email && (
                    <Tooltip title="Email">
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <Email fontSize="small" />
                        {cv.personal_info.email}
                      </Box>
                    </Tooltip>
                  )}
                  {cv.personal_info.phone && (
                    <Tooltip title="Phone">
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <Phone fontSize="small" />
                        {cv.personal_info.phone}
                      </Box>
                    </Tooltip>
                  )}
                  {cv.personal_info.address && (
                    <Tooltip title="Location">
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <LocationOn fontSize="small" />
                        {cv.personal_info.address}
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={4}>
              {/* Languages Section */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  <Language /> {t('languages')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {cv.languages.map((lang, index) => (
                    <Chip
                      key={index}
                      label={`${lang.name} (${lang.level})`}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        borderRadius: '8px',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Skills Section */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  <Code /> {t('skills')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {cv.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={`${skill.name} (${skill.level})`}
                      color="primary"
                      variant="filled"
                      sx={{ 
                        borderRadius: '8px',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Certificates Section */}
              {cv.certificates.length > 0 && (
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600
                  }}>
                    <Star /> {t('certificates')}
                  </Typography>
                  {cv.certificates.map((cert, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 2,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.issuer}
                          </Typography>
                          {cert.date && (
                            <Typography variant="caption" color="text.secondary">
                              {cert.date}
                            </Typography>
                          )}
                          {cert.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {cert.description}
                            </Typography>
                          )}
                        </Box>
                        {cert.documentUrl && (
                          <Tooltip title="View Certificate">
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
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={8}>
              {/* Summary Section */}
              {cv.personal_info.summary && (
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 3
                  }}>
                    <Person /> {t('professionalSummary')}
                  </Typography>
                  <Box sx={{
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    borderRadius: 1,
                    p: 2,
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                  }}>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      fontWeight: 'bold',
                      fontStyle: 'italic',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}>
                      {cv.personal_info.summary}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Video Section */}
              {cv.video_info && cv.video_info.video_url && cv.video_info.video_url.trim() !== '' && (
                <>
                  {/* console.log('Rendering video section in ModernTemplate, video_url:', cv.video_info.video_url) */}
                  <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Videocam sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {t('videoIntroduction')}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <video
                        controls
                        style={{ 
                          width: '100%', 
                          maxWidth: '640px', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        {cv.video_info.description}
                      </Typography>
                    )}
                  </Paper>
                </>
              )}

              {/* Experience Section */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3
                }}>
                  <Work /> {t('workExperience')}
                </Typography>
                {cv.experience.map((exp, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 4,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      {exp.position}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {exp.company}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.location}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exp.start_date} - {exp.end_date || t('present')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {exp.description}
                    </Typography>
                    {index < cv.experience.length - 1 && <Divider sx={{ mt: 3 }} />}
                  </Box>
                ))}
              </Paper>

              {/* Education Section */}
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3
                }}>
                  <School /> {t('education')}
                </Typography>
                {cv.education.map((edu, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 4,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      {edu.degree}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {edu.school}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edu.location}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {edu.start_date} - {edu.end_date || t('present')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {edu.description}
                    </Typography>
                    {index < cv.education.length - 1 && <Divider sx={{ mt: 3 }} />}
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Certificate Modal */}
      <Modal
        open={Boolean(selectedCertificate)}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
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
    </Box>
  );
};

export default ModernTemplate; 