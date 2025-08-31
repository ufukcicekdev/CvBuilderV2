import { useState, useEffect } from 'react';
import { Box, Typography, Button, Link as MuiLink, useTheme, Slide } from '@mui/material';
import { useTranslation, Trans } from 'next-i18next';

const CookieConsentBanner = () => {
  const { t } = useTranslation('');
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent === null) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: theme.palette.background.paper,
          p: { xs: 2, sm: 3 },
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.snackbar,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1200px',
            mx: 'auto',
            gap: 2,
          }}
        >
          <Typography 
  variant="body2" 
  sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}
>
  {t('cookie.bannerText')}{' '}
  <MuiLink 
    href="/privacy-policy" 
    sx={{ color: 'primary.main', textDecoration: 'underline' }}
  >
    {t('cookie.privacyPolicy')}
  </MuiLink>
</Typography>


          <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <Button variant="outlined" onClick={handleDecline}>
              {t('cookie.decline')}
            </Button>
            <Button variant="contained" onClick={handleAccept}>
              {t('cookie.accept')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Slide>
  );
};

export default CookieConsentBanner;
