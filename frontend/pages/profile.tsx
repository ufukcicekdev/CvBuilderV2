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
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';

interface UserProfile {
  id?: number;
  email: string;
  username: string;
  user_type: 'jobseeker' | 'employer';
  profile_picture?: string;
  profile_picture_url?: string;
  phone?: string;
  birth_date?: string;
  profession?: string;
  company_name?: string;
  company_website?: string;
  company_position?: string;
  company_size?: string;
  first_name?: string;
  last_name?: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
  birth_date?: string;
  profession?: string;
  company_name?: string;
  company_website?: string;
  company_position?: string;
  company_size?: string;
}

function Profile() {
  const { t, i18n } = useTranslation('common');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentLanguage } = useLanguage();

  // Dil değişikliğini dinleyen useEffect
  useEffect(() => {
    // Dil değiştiğinde formu yeniden render etmek için state'i güncelle
    if (profile) {
      // Profil state'ini kopyalayarak yeniden set etmek, 
      // component'in yeniden render olmasını sağlar
      setProfile({...profile});
      if (editedProfile) {
        setEditedProfile({...editedProfile});
      }
      console.log('Language changed, refreshing form fields');
    }
  }, [currentLanguage, router.locale, i18n.language]);

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
    console.log('Edit mode activated');
    setIsEditing(true);
    // editedProfile'ı profile ile eşleştir (null değerleri boş string yap)
    if (profile) {
      const updatedProfile = { ...profile } as any;
      // Null değerleri boş string yap
      Object.keys(updatedProfile).forEach(key => {
        if (updatedProfile[key] === null) {
          updatedProfile[key] = '';
        }
      });
      setEditedProfile(updatedProfile as UserProfile);
    }
  };

  const handleCancel = () => {
    console.log('Edit mode cancelled');
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Ad alanı kontrolü
    if (!editedProfile?.first_name) {
      newErrors.first_name = t('common.required');
      isValid = false;
    }

    // Soyad alanı kontrolü
    if (!editedProfile?.last_name) {
      newErrors.last_name = t('common.required');
      isValid = false;
    }

    // Telefon alanı kontrolü
    if (!editedProfile?.phone) {
      newErrors.phone = t('common.required');
      isValid = false;
    }

    // İş arayan için meslek alanı kontrolü
    if (profile?.user_type === 'jobseeker' && !editedProfile?.profession) {
      newErrors.profession = t('common.required');
      isValid = false;
    }

    // İşveren için şirket adı alanı kontrolü
    if (profile?.user_type === 'employer' && !editedProfile?.company_name) {
      newErrors.company_name = t('common.required');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile changes...');
      console.log('Current editedProfile:', editedProfile);
      
      // Form doğrulama
      if (!validateForm()) {
        showToast.error(t('common.errors.validationError'));
        return;
      }
      
      // Sadece değiştirilebilir alanları al
      const { 
        id, email, user_type, profile_picture, profile_picture_url, 
        ...editableFields 
      } = editedProfile || {};
      
      console.log('Fields to be updated:', editableFields);
      
      // JSON formatında veri gönder
      const response = await axiosInstance.patch('/api/users/me/', editableFields, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Server response:', response.data);
      
      setProfile(response.data);
      setEditedProfile(response.data);
      setIsEditing(false);
      setErrors({});
      showToast.success(t('profile.updateSuccess'));
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = handleApiError(error, t);
      showToast.error(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = "${value}"`);
    
    // Boş string değerlerini de kabul et
    setEditedProfile(prev => {
      if (!prev) return null;
      
      const updated = { ...prev, [name]: value };
      console.log('Updated profile:', updated);
      return updated;
    });
    
    // Hata mesajını temizle
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
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

      // Profil resmi yükleme için özel endpoint kullan
      const response = await axiosInstance.post('/api/users/upload-profile-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Başarılı yanıt durumunda profil bilgilerini güncelle
      if (response.data && response.data.profile_picture_url) {
        // Profil bilgilerini güncelle
        setProfile(prev => prev ? {
          ...prev,
          profile_picture_url: response.data.profile_picture_url
        } : null);
        
        setEditedProfile(prev => prev ? {
          ...prev,
          profile_picture_url: response.data.profile_picture_url
        } : null);
        
        showToast.success(t('profile.pictureUpdateSuccess'));
        
        // Debug için
        console.log('Yeni profil resmi URL:', response.data.profile_picture_url);
      }
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
                  src={profile?.profile_picture_url || ''}
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
                <Button
                  onClick={handleEdit}
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  sx={{ mt: 2 }}
                >
                  {t('profile.edit')}
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    {t('profile.save')}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                  >
                    {t('profile.cancel')}
                  </Button>
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
                        label={t('profile.firstName')}
                        name="first_name"
                        value={isEditing ? (editedProfile?.first_name || '') : (profile?.first_name || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.firstNamePlaceholder')}
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.lastName')}
                        name="last_name"
                        value={isEditing ? (editedProfile?.last_name || '') : (profile?.last_name || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.lastNamePlaceholder')}
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.phone')}
                        name="phone"
                        value={isEditing ? (editedProfile?.phone || '') : (profile?.phone || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.phonePlaceholder')}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.birthDate')}
                        name="birth_date"
                        type="date"
                        value={isEditing ? (editedProfile?.birth_date || '') : (profile?.birth_date || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        InputLabelProps={{ shrink: true }}
                        placeholder={t('profile.birthDatePlaceholder')}
                        error={!!errors.birth_date}
                        helperText={errors.birth_date}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('profile.profession')}
                        name="profession"
                        value={isEditing ? (editedProfile?.profession || '') : (profile?.profession || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.professionPlaceholder')}
                        error={!!errors.profession}
                        helperText={errors.profession}
                        required={profile?.user_type === 'jobseeker'}
                      />
                    </Grid>
                  </>
                ) : (
                  // İşveren Profili
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.firstName')}
                        name="first_name"
                        value={isEditing ? (editedProfile?.first_name || '') : (profile?.first_name || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.firstNamePlaceholder')}
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.lastName')}
                        name="last_name"
                        value={isEditing ? (editedProfile?.last_name || '') : (profile?.last_name || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.lastNamePlaceholder')}
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.companyName')}
                        name="company_name"
                        value={isEditing ? (editedProfile?.company_name || '') : (profile?.company_name || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.companyNamePlaceholder')}
                        error={!!errors.company_name}
                        helperText={errors.company_name}
                        required={profile?.user_type === 'employer'}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('auth.companyWebsite')}
                        name="company_website"
                        value={isEditing ? (editedProfile?.company_website || '') : (profile?.company_website || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.companyWebsitePlaceholder')}
                        error={!!errors.company_website}
                        helperText={errors.company_website}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.companyPosition')}
                        name="company_position"
                        value={isEditing ? (editedProfile?.company_position || '') : (profile?.company_position || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.companyPositionPlaceholder')}
                        error={!!errors.company_position}
                        helperText={errors.company_position}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label={t('profile.companySize')}
                        name="company_size"
                        value={isEditing ? (editedProfile?.company_size || '') : (profile?.company_size || '')}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder={t('profile.companySizePlaceholder')}
                        error={!!errors.company_size}
                        helperText={errors.company_size}
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