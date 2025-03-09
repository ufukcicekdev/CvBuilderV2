import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon, Language as LanguageIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Flag from 'react-world-flags';
import { useLanguage } from '../contexts/LanguageContext';

const LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: 'TR' },
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'zh', name: '中文', flag: 'CN' },
  { code: 'ar', name: 'العربية', flag: 'SA' },
  { code: 'hi', name: 'हिन्दी', flag: 'IN' }
];

export default function Navbar() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { changeLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Dil ayarını kontrol et ve API için ayarla
    const initializeLanguage = async () => {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      const currentLocale = router.locale || 'en';
      
      // Eğer localStorage'da dil yoksa veya farklıysa, güncel dili kaydet
      if (!savedLanguage || savedLanguage !== currentLocale) {
        localStorage.setItem('selectedLanguage', currentLocale);
        
        // API için Accept-Language header'ını ayarla
        const { setLanguage } = await import('../services/api');
        setLanguage(currentLocale);
      }
    };

    // Sayfa yüklendiğinde ve her değişimde token kontrolü
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };

    initializeLanguage();
    checkAuth();
    
    // Route değişikliklerinde kontrolleri yap
    router.events.on('routeChangeComplete', () => {
      initializeLanguage();
      checkAuth();
    });

    return () => {
      router.events.off('routeChangeComplete', () => {
        initializeLanguage();
        checkAuth();
      });
    };
  }, [router]);

  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLangMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangMenuAnchor(null);
  };

  const handleLanguageChange = async (locale: string) => {
    try {
      // Context'i güncelle
      changeLanguage(locale);
      
      // Mevcut URL'yi al
      const currentPath = router.asPath;
      
      // Next.js route'unu güncelle
      await router.push(currentPath, currentPath, { 
        locale,
        scroll: false // Sayfanın en üste kaymasını önle
      });
      
      // Menüyü kapat
      handleLangMenuClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link}
          href="/"
          sx={{ 
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': {
              opacity: 0.8
            },
            cursor: 'pointer'
          }}
        >
          {!mounted ? 'CV Builder' : t('app.name')}
        </Typography>

        {/* Desktop Menu */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" component={Link} href="/pricing">
              {t('nav.pricing')}
            </Button>
            {isLoggedIn ? (
              <>
                <Button color="inherit" component={Link} href="/dashboard">
                  {t('nav.dashboard')}
                </Button>
                <Button color="inherit" component={Link} href="/profile">
                  {t('nav.profile')}
                </Button>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} href="/login">
                  {t('nav.login')}
                </Button>
                <Button color="inherit" component={Link} href="/register">
                  {t('nav.register')}
                </Button>
              </>
            )}
            <IconButton
              color="inherit"
              onClick={handleLangMenuClick}
            >
              <LanguageIcon />
            </IconButton>
          </Box>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              onClick={handleLangMenuClick}
              edge="end"
              sx={{ mr: 1 }}
            >
              <LanguageIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleMobileMenuClick}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMobileMenuClose}
            >
              {isLoggedIn ? (
                <>
                  <MenuItem component={Link} href="/dashboard" onClick={handleMobileMenuClose}>
                    {t('nav.dashboard')}
                  </MenuItem>
                  <MenuItem component={Link} href="/jobs" onClick={handleMobileMenuClose}>
                    {t('nav.jobs')}
                  </MenuItem>
                  <MenuItem component={Link} href="/profile" onClick={handleMobileMenuClose}>
                    {t('nav.profile')}
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                  >
                    {t('nav.logout')}
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem component={Link} href="/login" onClick={handleMobileMenuClose}>
                    {t('nav.login')}
                  </MenuItem>
                  <MenuItem component={Link} href="/register" onClick={handleMobileMenuClose}>
                    {t('nav.register')}
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        )}

        {/* Language Menu */}
        <Menu
          anchorEl={langMenuAnchor}
          open={Boolean(langMenuAnchor)}
          onClose={handleLangMenuClose}
        >
          {LANGUAGES.map((lang) => (
            <MenuItem 
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={router.locale === lang.code}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: '150px'
              }}
            >
              <Flag 
                code={lang.flag} 
                height="16" 
                fallback={<span>🏳️</span>}
                style={{ 
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '2px'
                }}
              />
              {lang.name}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
} 