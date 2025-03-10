import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// _retry özelliğini ekle
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// API base URL'ini .env'den al veya varsayılan değeri kullan
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// console.log('API Base URL:', API_BASE_URL); // Debug için

// Seçili dili al
const selectedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedLanguage') || 'en';
  }
  return 'en';
};

// Axios instance oluştur
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Desteklenen diller
export const SUPPORTED_LANGUAGES = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  zh: '中文',
  ar: 'العربية',
  hi: 'हिन्दी'
};

// Token yenileme için değişkenler
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Bekleyen istekleri token ile güncelle
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Yeni token bekleyen istekleri kuyruğa ekle
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Request interceptor ekle
api.interceptors.request.use((config) => {
  // Token ekle
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Dil ayarını ekle
  const language = localStorage.getItem('selectedLanguage') || 'en';
  config.headers['Accept-Language'] = language;
  
  return config;
});

// Response interceptor ekle
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Token expired hatası kontrolü (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token yenilenirken bekleyen istekler için promise döndür
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token: string) => {
            // Yeni token ile isteği tekrar dene
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Token yenileme işlemini başlat
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token ile yeni access token al
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        const response = await authAPI.refreshToken(refreshToken);
        const { access, refresh } = response.data;
        
        // Yeni tokenları kaydet
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        // Bekleyen istekleri bilgilendir
        onRefreshed(access);
        
        // Orijinal isteği yeni token ile tekrar dene
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız olursa kullanıcıyı çıkış yaptır
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Kullanıcıyı login sayfasına yönlendir
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Diğer hata durumları için
    return Promise.reject(error);
  }
);

// Dil değiştirme fonksiyonu
export const setLanguage = (languageCode: string): void => {
  if (typeof window !== 'undefined' && languageCode in SUPPORTED_LANGUAGES) {
    // Eğer zaten aynı dil ayarlanmışsa işlem yapma
    const currentLanguage = localStorage.getItem('selectedLanguage');
    if (currentLanguage === languageCode) {
      return;
    }
    
    localStorage.setItem('selectedLanguage', languageCode);
    
    // Axios instance'ın default headers'ını güncelle
    api.defaults.headers.common['Accept-Language'] = languageCode;
    
    // Özel event tetikle - bu event'i dinleyen bileşenler varsa onları bilgilendir
    window.dispatchEvent(new Event('languageChange'));
  }
};

// Uygulama başladığında dil ayarını yükle
export const initializeLanguage = (): void => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLanguage);
  }
};

// API istekleri için interface'ler
export interface CV {
  id: number;
  title: string;
  personal_info: any;
  education: any[];
  experience: any[];
  skills: any[];
  languages: any[];
  certificates: any[];
  status: string;
  current_step: number;
  language?: string;
  video_url?: string | null;
  video_description?: string | null;
  video_info?: {
    url: string | null;
    description: string | null;
    type: string | null;
    uploaded_at: string | null;
  };
  created_at: string;
  updated_at: string;
}

// API fonksiyonları
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    password2: string;
    user_type: string;
    phone?: string;
    birth_date?: Date;
    company_name?: string;
    company_website?: string;
  }) => {
    return api.post('/api/users/register/', data);
  },

  login: (data: { email: string; password: string }) => {
    return api.post('/api/auth/login/', data);
  },

  logout: () => {
    return api.post('/api/auth/logout/');
  },

  refreshToken: (refresh: string) => {
    return api.post('/api/users/token/refresh/', { refresh });
  },
  
  googleAuth: (data: { token: string }) => {
    return api.post('/api/auth/google', data);
  },
  
  linkedinAuth: (data: { code: string }) => {
    return api.post('/api/auth/linkedin', data);
  },

  // Şifre sıfırlama için email gönderme
  forgotPassword: (email: string) => {
    // localStorage'dan dil tercihini al
    const language = typeof window !== 'undefined' ? localStorage.getItem('selectedLanguage') || 'en' : 'en';
    
    return api.post('/api/users/forgot-password/', { 
      email,
      language 
    });
  },

  // Şifre sıfırlama token'ını doğrulama
  validateResetToken: (token: string) => {
    return api.get(`/api/users/reset-password/validate/${token}/`);
  },

  // Şifre sıfırlama
  resetPassword: (data: { token: string; password: string; password_confirm: string }) => {
    return api.post('/api/users/reset-password/', data);
  }
};

export const cvAPI = {
  // Tüm CV'leri getir
  getAll: () => {
    return api.get<CV[]>('/api/cvs/');
  },

  // Tek bir CV getir
  getOne: (id: number) => {
    return api.get<CV>(`/api/cvs/${id}/`);
  },

  // Yeni CV oluştur
  create: (data: Partial<CV>) => {
    return api.post<CV>('/api/cvs/', data);
  },

  // CV güncelle
  update: (id: number, data: Partial<CV>) => {
    return api.patch<CV>(`/api/cvs/${id}/`, data);
  },

  // CV sil
  delete: (id: number) => {
    return api.delete(`/api/cvs/${id}/`);
  },

  // CV adımını güncelle
  updateStep: (id: number, step: number) => {
    return api.patch<CV>(`/api/cvs/${id}/update_step/`, { current_step: step });
  },

  // CV'yi PDF olarak oluştur
  generatePDF: (id: number, templateId: number) => {
    return api.post<{ pdf_url: string }>(`/api/cvs/${id}/generate-pdf/`, { template_id: templateId });
  },

  // CV'yi web sayfası olarak oluştur
  generateWeb: (id: number, templateId: number) => {
    return api.post<{ web_url: string }>(`/api/cvs/${id}/generate-web/`, { template_id: templateId });
  },

  // Sertifika yükle
  uploadCertificate: (id: number, formData: FormData) => {
    return api.post<CV>(`/api/cvs/${id}/upload_certificate/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Sertifika sil
  deleteCertificate: (id: number, certificateId: number) => {
    return api.delete(`/api/cvs/${id}/certificates/${certificateId}/`);
  },

  // Video yükle
  uploadVideo: (id: number, formData: FormData) => {
    return api.post<CV>(`/api/cvs/${id}/upload-video/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Video sil
  deleteVideo: (id: number) => {
    return api.patch<CV>(`/api/cvs/${id}/`, {
      video: null
    });
  }
};

// Email doğrulama işlemleri
export const verifyEmail = async (token: string) => {
  try {
    // localStorage'dan dil tercihini al
    const language = typeof window !== 'undefined' ? localStorage.getItem('selectedLanguage') || 'en' : 'en';
    
    // Dil parametresini URL'e ekle
    const response = await api.get(`/api/users/verify-email/${token}/?language=${language}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    // localStorage'dan dil tercihini al
    const language = typeof window !== 'undefined' ? localStorage.getItem('selectedLanguage') || 'en' : 'en';
    
    const response = await api.post('/api/users/resend-verification-email/', { 
      email,
      language 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api; 