import React from 'react';
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

interface MinimalTemplateProps {
  cv: CV;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ cv }) => {
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
            {fullName}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 500 }}>
            {cv.title}
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
                <Code /> Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
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
                  <Star /> Certificates
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
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={8}>
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
                <Work /> Work Experience
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
                    {exp.start_date} - {exp.end_date || 'Present'}
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
                <School /> Education
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
                    {edu.start_date} - {edu.end_date || 'Present'}
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
  );
};

export default MinimalTemplate; 