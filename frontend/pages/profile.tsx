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
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, PhotoCamera } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import axiosInstance from '../services/axios';
import { showToast } from '../utils/toast';
import { handleApiError } from '../utils/handleApiError';
import { useRouter } from 'next/router';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import SubscriptionInfo from '../components/SubscriptionInfo';
import SubscriptionPaymentHistory from '../components/SubscriptionPaymentHistory';

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
  const prevLanguageRef = useRef(currentLanguage);
  const [activeTab, setActiveTab] = useState(0);

  // Dil değişikliğini dinleyen useEffect
  useEffect(() => {
    // Sadece dil değiştiğinde çalışsın
    if (prevLanguageRef.current !== currentLanguage) {
      prevLanguageRef.current = currentLanguage;
      
      // Dil değiştiğinde sadece bir kez log yazdır
      console.log('Language changed to:', currentLanguage);
      
      // Profil verisi varsa ve düzenleme modunda değilse, formu yeniden yükle
      if (profile && !isEditing) {
        // Profil verilerini yeniden çekmek daha güvenli
        fetchProfile();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, router.locale, i18n.language]); // Sonsuz döngüyü önlemek için bağımlılıkları sınırlıyoruz

  const fetchProfile = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      
      // Token kontrolü
      const token = localStorage.getItem('accessToken');
      if (!token) {
        showToast.error(t('auth.sessionExpired'));
        router.push('/login');
        return;
      }
      
      const formData = new FormData();
      formData.append('profile_picture', file);

      // Profil resmi yükleme için özel endpoint kullan
      const response = await axiosInstance.post('/api/users/upload-profile-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000, // Dosya yükleme için daha uzun timeout
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
      
      // Hata tipine göre özel mesajlar
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error(t('auth.sessionExpired'));
          // Token yenileme denemesi
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const refreshResponse = await axiosInstance.post('/api/users/token/refresh/', {
                refresh: refreshToken
              });
              
              if (refreshResponse.data && refreshResponse.data.access) {
                localStorage.setItem('accessToken', refreshResponse.data.access);
                showToast.info(t('auth.tokenRefreshed'));
                // Kullanıcıya tekrar denemesini söyle
                showToast.info(t('profile.tryAgain'));
              }
            }
          } catch (refreshError) {
            // Refresh token hatası, kullanıcıyı login sayfasına yönlendir
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            router.push('/login');
          }
        } else if (error.response.status === 413) {
          showToast.error(t('profile.errors.fileTooLarge'));
        } else {
          const errorMessage = handleApiError(error, t);
          showToast.error(errorMessage || t('profile.pictureUpdateError'));
        }
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        showToast.error(t('common.errors.networkError'));
      } else {
        // İstek oluşturulurken bir şeyler yanlış gitti
        showToast.error(t('profile.pictureUpdateError'));
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            flexDirection: 'column',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              {t('common.loading')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '50vh',
            flexDirection: 'column',
            p: 2
          }}>
            <Typography variant="h6" color="error" sx={{ textAlign: 'center', mb: 2 }}>
              {t('profile.notFound')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push('/')}
            >
              {t('common.backToHome')}
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={t('profile.seo.title', 'Your Profile')}
        description={t('profile.seo.description', 'Manage your CV Builder profile, update your personal information, and customize your account settings.')}
        keywords={t('profile.seo.keywords', 'profile, account settings, personal information, cv builder account')}
        ogType="profile"
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Profil Başlığı */}
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: 2 
              }}>
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
                      width: { xs: 80, sm: 100 }, 
                      height: { xs: 80, sm: 100 },
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
                <Box sx={{ 
                  flexGrow: 1,
                  textAlign: { xs: 'center', sm: 'left' },
                  mb: { xs: 2, sm: 0 }
                }}>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {profile.username}
                  </Typography>
                  <Typography color="textSecondary">{profile.email}</Typography>
                  <Typography variant="subtitle1">
                    {profile.user_type === 'jobseeker' ? t('auth.jobseeker') : t('auth.employer')}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  {!isEditing ? (
                    <Button
                      onClick={handleEdit}
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      sx={{ mt: { xs: 0, sm: 2 } }}
                      fullWidth={false}
                    >
                      {t('profile.edit')}
                    </Button>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: { xs: 0, sm: 2 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      width: { xs: '100%', sm: 'auto' }
                    }}>
                      <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        fullWidth={false}
                      >
                        {t('profile.save')}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        fullWidth={false}
                      >
                        {t('profile.cancel')}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Tabs */}
          <Grid item xs={12}>
            <Paper sx={{ p: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="profile tabs"
              >
                <Tab label={t('profile.personalInfo')} />
                <Tab label={t('subscription.membership', 'Membership')} />
                <Tab label={t('subscription.paymentHistory', 'Payment History')} />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tab Content */}
          <Grid item xs={12}>
            {activeTab === 0 && (
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" gutterBottom>
                  {t('profile.personalInfo')}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {profile.user_type === 'jobseeker' ? (
                    // İş Arayan Profili
                    <>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                    </>
                  ) : (
                    // İşveren Profili
                    <>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
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
                          size="medium"
                          margin="normal"
                          sx={{ mt: { xs: 1, sm: 2 } }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            )}

            {activeTab === 1 && (
              <SubscriptionInfo onSubscriptionChange={() => {}} />
            )}

            {activeTab === 2 && (
              <SubscriptionPaymentHistory />
            )}
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