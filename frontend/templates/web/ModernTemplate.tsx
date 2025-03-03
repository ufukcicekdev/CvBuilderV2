import React from 'react';
import { Box, Typography, Grid, Paper, Avatar, Divider, Chip, IconButton, Tooltip, Menu, MenuItem, Button, AppBar, Toolbar, Container, Fade, Backdrop, CircularProgress } from '@mui/material';
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
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Flag from 'react-world-flags';
import axiosInstance from '@/utils/axios';
import { useTranslation } from 'next-i18next';

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

const ModernTemplate: React.FC<ModernTemplateProps> = ({ cv: initialCv }) => {
  const router = useRouter();
  const { id, translation_key, lang } = router.query;
  const { t } = useTranslation('common');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [cv, setCv] = React.useState(initialCv);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (newLang: string) => {
    try {
      setIsLoading(true);
      
      // Use router.query values instead of parsing URL
      const cvId = id;
      const translationKey = translation_key;

      // Fetch CV data in the new language
      const response = await axiosInstance.get(`/cvs/${cvId}/${translationKey}/${newLang}/`);
      setCv(response.data);

      // Update URL without reloading the page
      const newUrl = `/cv/${cvId}/${translationKey}/${newLang}/`;
      window.history.pushState({}, '', newUrl);
    } catch (error) {
      console.error('Error changing language:', error);
      alert('Error loading translation. Please try again.');
    } finally {
      setIsLoading(false);
      handleClose();
    }
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
      </Backdrop>

      {/* Navbar */}
      <AppBar position="static" color="primary" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Image
                src="/logo.png"
                alt="CV Builder Logo"
                width={40}
                height={40}
                style={{ marginRight: '10px' }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                CV Builder
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Language Selection */}
              <Tooltip title="Change Language">
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
                  {fullName}
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ 
                  mb: 3, 
                  opacity: 0.9,
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}>
                  {cv.title}
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
                      label={skill.name}
                      color="primary"
                      variant={skill.level ? "filled" : "outlined"}
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
                    </Box>
                  ))}
                </Paper>
              )}
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={8}>
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
                  <Work /> {t('work_experience')}
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
    </Box>
  );
};

export default ModernTemplate; 