'use client';

import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('app.name')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('app.description')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.quickLinks')}
            </Typography>
            <Link href="/" color="text.secondary" display="block">{t('footer.home')}</Link>
            {/* <Link href="/about" color="text.secondary" display="block">{t('footer.about')}</Link> */}
            <Link href="/contact" color="text.secondary" display="block">{t('footer.contact')}</Link>
            <Link href="/privacy-policy" color="text.secondary" display="block">{t('footer.privacy')}</Link>
            <Link href="/terms-of-service" color="text.secondary" display="block">{t('footer.terms')}</Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.followUs')}
            </Typography>
            {/* <Box> */}
              {/* <IconButton aria-label="linkedin" color="primary"> */}
                {/* <LinkedInIcon /> */}
              {/* </IconButton> */}
              {/* <IconButton aria-label="twitter" color="primary"> */}
                {/* <TwitterIcon /> */}
              {/* </IconButton> */}
              {/* <IconButton aria-label="facebook" color="primary"> */}
                {/* <FacebookIcon /> */}
              {/* </IconButton> */}
              {/* <IconButton aria-label="instagram" color="primary"> */}
                {/* <InstagramIcon /> */}
              {/* </IconButton> */}
            {/* </Box> */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t('footer.contact')}: info@cvbuilder.tech
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="/">
              CV Builder
            </Link>{' '}
            {new Date().getFullYear()}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 