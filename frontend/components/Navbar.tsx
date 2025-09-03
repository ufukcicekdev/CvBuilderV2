import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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
  useMediaQuery,
  alpha,
  Container
} from '@mui/material';
import { Menu as MenuIcon, Language as LanguageIcon, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

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

export default function Navbar() {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const { changeLanguage } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const { isAuthenticated, logout, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    changeLanguage(locale);
    const currentPath = router.asPath;
    await router.push(currentPath, currentPath, { locale, scroll: false });
    handleLangMenuClose();
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    handleMobileMenuClose();
  };

  const navLinks = [
    { name: t('nav.pricing'), href: '/pricing' },
    { name: t('nav.blog'), href: '/blog' },
    // Add other main navigation links here if needed
  ];

  const authLinks = isAuthenticated ? [
    { name: t('nav.dashboard'), href: user?.user_type === 'employer' ? '/dashboard/employer' : '/dashboard' },
    { name: t('nav.profile'), href: '/profile' },
  ] : [];

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
      },
    },
    exit: {
        opacity: 0,
        y: -10,
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === router.locale) || LANGUAGES[0];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: scrolled 
          ? alpha(theme.palette.background.paper, 0.85)
          : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? theme.shadows[2] : 'none',
        transition: theme.transitions.create(['background-color', 'box-shadow', 'backdrop-filter'], {
          duration: theme.transitions.duration.short,
        }),
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Logo />

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navLinks.map(link => (
                <Button key={link.name} sx={{ color: 'text.primary', fontWeight: 500 }} component={Link} href={link.href}>
                  {link.name}
                </Button>
              ))}
              {authLinks.map(link => (
                <Button key={link.name} sx={{ color: 'text.primary', fontWeight: 500 }} component={Link} href={link.href}>
                  {link.name}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: isMobile ? 0 : 2 }}>
            {/* Language Selector */}
            <Button
              color="inherit"
              onClick={handleLangMenuClick}
              aria-label={t('nav.selectLanguage')}
              endIcon={<ArrowDropDownIcon />}
              sx={{ color: 'text.primary', textTransform: 'none' }}
            >
              <Image
      src={`/flags/${currentLanguage.flag}`}
      alt={currentLanguage.name}
      width={24}  // height="16" ise, orantılı bir genişlik (örneğin 24) verin
      height={16}
      style={{ marginRight: '8px', borderRadius: '2px' }}
      aria-hidden="true"
    />
              {isMobile ? currentLanguage.code.toUpperCase() : currentLanguage.name}
            </Button>
            <Menu
              anchorEl={langMenuAnchor}
              open={Boolean(langMenuAnchor)}
              onClose={handleLangMenuClose}
              MenuListProps={{ sx: { py: 1 } }}
              PaperProps={{ sx: { borderRadius: 2, mt: 1.5, boxShadow: theme.shadows[4] } }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem 
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  selected={router.locale === lang.code}
                  sx={{ gap: 1.5, px: 2, py: 1, borderRadius: 1, mx: 1 }}
                >
                  <Image
          src={`/flags/${lang.flag}`}
          alt={lang.name}
          width={24}
          height={16}
          style={{ borderRadius: '2px' }}
          aria-hidden="true"
        />
                  {lang.name}
                </MenuItem>
              ))}
            </Menu>

            {/* Auth Buttons / Mobile Menu Toggle */}
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMobileMenuClick}
                  edge="end"
                  aria-label={t('nav.openMenu')}
                  sx={{ color: 'text.primary' }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={handleMobileMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { width: '200px', borderRadius: 2, mt: 1.5, boxShadow: theme.shadows[4] } }}
                >
                  <AnimatePresence>
                    {Boolean(mobileMenuAnchor) && (
                      <motion.div variants={menuVariants} initial="hidden" animate="visible" exit="exit">
                        {[...navLinks, ...authLinks].map(link => (
                          <motion.div key={link.href} variants={menuItemVariants}>
                            <MenuItem component={Link} href={link.href} onClick={handleMobileMenuClose}>{link.name}</MenuItem>
                          </motion.div>
                        ))}
                        {isAuthenticated ? (
                          <motion.div variants={menuItemVariants}>
                            <MenuItem onClick={handleLogout}>{t('nav.logout')}</MenuItem>
                          </motion.div>
                        ) : (
                          <motion.div variants={menuItemVariants}>
                            <MenuItem component={Link} href="/login" onClick={handleMobileMenuClose}>{t('nav.login')}</MenuItem>
                            <MenuItem component={Link} href="/register" onClick={handleMobileMenuClose}>{t('nav.register')}</MenuItem>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Menu>
              </>
            ) : (
              !isAuthenticated && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button sx={{ color: 'text.primary' }} component={Link} href="/login">
                    {t('nav.login')}
                  </Button>
                  <Button variant="contained" component={Link} href="/register">
                    {t('nav.register')}
                  </Button>
                </Box>
              )
            )}
            {isAuthenticated && !isMobile && (
                <Button variant="outlined" onClick={handleLogout}>
                    {t('nav.logout')}
                </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}