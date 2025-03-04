import { useEffect, useState, useRef } from 'react';
import { withAuth } from '../components/withAuth';
import Layout from '../components/Layout';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  Divider,
  TextField,
  IconButton,
  Badge,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, PhotoCamera } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import axiosInstance from '../services/axios';
import { showToast } from '../utils/toast';
import { handleApiError } from '../utils/handleApiError';

interface UserProfile {
  email: string;
  username: string;
  user_type: 'jobseeker' | 'employer';
  profile_picture?: string;
  phone?: string;
  birth_date?: string;
  profession?: string;
  company_name?: string;
  company_website?: string;
  company_position?: string;
  company_size?: string;
}

function Profile() {
  const { t } = useTranslation('common');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/users/me/');
        setProfile(response.data);
        setEditedProfile(response.data);
      } catch (error: any) {
        console.error('Profile fetch error:', error);
        const errorMessage = handleApiError(error, t);
        showToast.error(errorMessage || t('profile.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [t]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    try {
      const response = await axiosInstance.put('/api/users/me/update/', editedProfile);
      setProfile(response.data);
      setEditedProfile(response.data);
      setIsEditing(false);
      showToast.success(t('profile.updateSuccess'));
    } catch (error: any) {
      const errorMessage = handleApiError(error, t);
      showToast.error(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error(t('profile.errors.fileTooLarge'));
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error(t('profile.errors.invalidFileType'));
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await axiosInstance.patch('/api/users/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      setEditedProfile(response.data);
      showToast.success(t('profile.pictureUpdateSuccess'));
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      const errorMessage = handleApiError(error, t);
      showToast.error(errorMessage || t('profile.pictureUpdateError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography>Yükleniyor...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography color="error">Profil bulunamadı.</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Profil Başlığı */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    onClick={handleProfilePictureClick}
                    disabled={uploading}
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  src={profile.profile_picture}
                  sx={{ 
                    width: 100, 
                    height: 100,
                    cursor: 'pointer',
                    opacity: uploading ? 0.5 : 1,
                  }}
                  onClick={handleProfilePictureClick}
                />
              </Badge>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4">{profile.username}</Typography>
                <Typography color="textSecondary">{profile.email}</Typography>
                <Typography variant="subtitle1">
                  {profile.user_type === 'jobseeker' ? t('auth.jobseeker') : t('auth.employer')}
                </Typography>
              </Box>
              {!isEditing ? (
                <IconButton onClick={handleEdit} color="primary">
                  <EditIcon />
                </IconButton>
              ) : (
                <Box>
                  <IconButton onClick={handleSave} color="primary">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleCancel} color="error">
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Profil Detayları */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('profile.personalInfo')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {profile.user_type === 'jobseeker' ? (
                  // İş Arayan Profili
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.phone')}
                        name="phone"
                        value={isEditing ? editedProfile?.phone : profile.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.birthDate')}
                        name="birth_date"
                        type="date"
                        value={isEditing ? editedProfile?.birth_date : profile.birth_date}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('profile.profession')}
                        name="profession"
                        value={isEditing ? editedProfile?.profession : profile.profession}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </>
                ) : (
                  // İşveren Profili
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.companyName')}
                        name="company_name"
                        value={isEditing ? editedProfile?.company_name : profile.company_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.companyWebsite')}
                        name="company_website"
                        value={isEditing ? editedProfile?.company_website : profile.company_website}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.companyPosition')}
                        name="company_position"
                        value={isEditing ? editedProfile?.company_position : profile.company_position}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.companySize')}
                        name="company_size"
                        value={isEditing ? editedProfile?.company_size : profile.company_size}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

export const getStaticProps = async ({ locale = 'tr' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default withAuth(Profile); 