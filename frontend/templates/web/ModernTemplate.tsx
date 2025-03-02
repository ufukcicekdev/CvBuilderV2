import React from 'react';
import { CV } from '../../types/cv';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
  CircularProgress,
  Rating,
  LinearProgress,
  IconButton,
  Tooltip,
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
} from '@mui/icons-material';

interface ModernTemplateProps {
  cv: CV;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ cv }) => {
  if (!cv) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 4,
            position: 'relative',
            backgroundImage: 'linear-gradient(135deg, primary.dark 0%, primary.main 100%)',
          }}>
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
                      boxShadow: 2
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
                      fontSize: '3rem'
                    }}
                  >
                    {cv.personal_info.first_name?.charAt(0) || ''}{cv.personal_info.last_name?.charAt(0) || ''}
                  </Avatar>
                )}
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant="h3" gutterBottom sx={{ 
                  fontWeight: 600,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {fullName}
                </Typography>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
                  {cv.title}
                </Typography>
                {cv.personal_info.description && (
                  <Typography variant="body1" sx={{ 
                    mt: 2, 
                    mb: 3,
                    opacity: 0.9,
                    lineHeight: 1.6,
                    maxWidth: '800px'
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
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={4}>
            {/* Languages Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Language /> Languages
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
            </Paper>

            {/* Skills Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Code /> Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {cv.skills.map((skill, index) => (
                  <Tooltip key={index} title={skill.level || ''}>
                    <Chip
                      label={skill.name}
                      color="primary"
                      variant={skill.level ? "filled" : "outlined"}
                      sx={{ 
                        borderRadius: '8px',
                        '& .MuiChip-label': {
                          fontWeight: 500
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Paper>

            {/* Certificates Section */}
            {cv.certificates.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  <Star /> Certificates
                </Typography>
                <List>
                  {cv.certificates.map((cert, index) => (
                    <ListItem key={index} sx={{ 
                      px: 0,
                      borderLeft: '2px solid',
                      borderColor: 'primary.main',
                      pl: 2,
                      mb: 2
                    }}>
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
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
            {/* Experience Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main',
                fontWeight: 600,
                mb: 3
              }}>
                <Work /> Work Experience
              </Typography>
              {cv.experience.map((exp, index) => (
                <Box key={index} sx={{ 
                  mb: 4,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-20px',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    bgcolor: 'primary.main',
                    display: { xs: 'none', md: 'block' }
                  }
                }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
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
                    mb: 1
                  }}>
                    <CalendarToday fontSize="small" />
                    {exp.start_date} - {exp.end_date || 'Present'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}>
                    {exp.description}
                  </Typography>
                  {index < cv.experience.length - 1 && <Divider sx={{ mt: 3 }} />}
                </Box>
              ))}
            </Paper>

            {/* Education Section */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main',
                fontWeight: 600,
                mb: 3
              }}>
                <School /> Education
              </Typography>
              {cv.education.map((edu, index) => (
                <Box key={index} sx={{ 
                  mb: 4,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-20px',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    bgcolor: 'primary.main',
                    display: { xs: 'none', md: 'block' }
                  }
                }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
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
                    mb: 1
                  }}>
                    <CalendarToday fontSize="small" />
                    {edu.start_date} - {edu.end_date || 'Present'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}>
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
  );
};

export default ModernTemplate; 