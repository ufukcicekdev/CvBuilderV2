import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// _retry özelliğini ekle
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// API base URL'ini .env'den al veya varsayılan değeri kullan
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    console.log('Response headers:', response.config.headers);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Dil değiştirme fonksiyonu
export const setLanguage = (languageCode: string): void => {
  if (typeof window !== 'undefined' && languageCode in SUPPORTED_LANGUAGES) {
    localStorage.setItem('selectedLanguage', languageCode);
    console.log('Selected language:', languageCode);
    // Axios instance'ın default headers'ını güncelle
    api.defaults.headers.common['Accept-Language'] = languageCode;
    
    console.log('Language changed:', languageCode);
    console.log('Current headers:', api.defaults.headers);
    
    // Özel event tetikle
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
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    return api.post('/api/auth/register/', data);
  },

  login: (data: { email: string; password: string }) => {
    return api.post('/api/auth/login/', data);
  },

  logout: () => {
    return api.post('/api/auth/logout/');
  },

  refreshToken: (refresh: string) => {
    return api.post('/api/auth/token/refresh/', { refresh });
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

export default api; 