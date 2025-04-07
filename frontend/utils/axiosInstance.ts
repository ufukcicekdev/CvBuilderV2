import axios from 'axios';

/**
 * API istekleri için yapılandırılmış axios instance
 * 
 * - Kimlik doğrulama için authorization header'ı otomatik ekler
 * - Hata yakalama için interceptor içerir
 * - Base URL'i uygulama yapılandırmasından alır
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  // İstek zaman aşımı (10 saniye)
  timeout: 10000,
});

// Request Interceptor - İstekler için kimlik doğrulama token'ı ekle
axiosInstance.interceptors.request.use(
  (config) => {
    // Browser tarafında olduğumuzdan emin olalım
    if (typeof window !== 'undefined') {
      try {
        // First check for auth_token
        let token = localStorage.getItem('auth_token');
        
        // If auth_token is not found, try accessToken as a fallback
        if (!token) {
          token = localStorage.getItem('accessToken');
          if (token) {
            // console.log('Using accessToken as fallback since auth_token was not found');
          }
        }
        
        // Eğer token varsa, Authorization header'ına ekle
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // console.warn('No authentication token found in localStorage');
        }
      } catch (error) {
        console.error('Token alınırken hata:', error);
      }
    } else {
      // console.log('Running in server environment - skipping token addition');
    }
    
    return config;
  },
  (error) => {
    console.error('API isteği gönderilirken hata oluştu:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Yanıtları işle, hataları yakala
axiosInstance.interceptors.response.use(
  (response) => {
    // Başarılı yanıtlarda token bilgisini logla (debug için)
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
        if (response.config.url?.includes('/templates/')) {
          // console.log('Successful API response to templates endpoint with token present:', !!token);
          // console.log('API operation type:', response.config.method);
        }
      } catch (error) {
        // Token kontrol hatalarını yoksay
      }
    }
    return response;
  },
  (error) => {
    // Hata mesajını konsola yazdır
    console.error('API yanıtı işlenirken hata oluştu:', error);
    
    // Template operasyonları sırasında kimlik doğrulama hataları için ek bilgi logla
    if (error.config?.url?.includes('/templates/')) {
      // console.log('Template operation failed with config:', {
      //   url: error.config.url,
      //   method: error.config.method,
      //   hasAuthHeader: !!error.config.headers?.Authorization,
      //   status: error.response?.status
      // });
    }
    
    // DELETE isteklerinde ek kontrol - Özellikle şablon silme işlemleri için
    if (error.config?.method === 'delete' && error.config?.url?.includes('/templates/')) {
      // console.warn('Error during DELETE operation on template:', error.response?.status);
      
      // 401 veya 403 hataları için daha açıklayıcı mesaj göster
      if (error.response?.status === 401 || error.response?.status === 403) {
        return Promise.reject(new Error('Bu şablonu silme yetkiniz yok veya oturumunuz sonlanmış olabilir. Sayfayı yenileyip tekrar deneyin.'));
      }
    }
    
    // 401 Unauthorized hatası (token süresi dolmuş, geçersiz token vb.)
    if (error.response && error.response.status === 401) {
      // console.log('Authentication error (401) received');
      
      // Template endpoint'leri için otomatik yönlendirme yapmayalım
      if (error.config?.url?.includes('/templates/')) {
        // console.warn('Authentication error during template operation - NOT redirecting to login');
        
        // POST, PUT ve DELETE işlemleri için farklı mesajlar
        if (error.config.method === 'post') {
          return Promise.reject(new Error('Şablon kaydederken yetkilendirme hatası. Lütfen sayfayı yenileyip tekrar deneyin.'));
        } else if (error.config.method === 'put') {
          return Promise.reject(new Error('Şablon güncellenirken yetkilendirme hatası. Lütfen sayfayı yenileyip tekrar deneyin.'));
        } else if (error.config.method === 'delete') {
          return Promise.reject(new Error('Şablon silinirken yetkilendirme hatası. Lütfen sayfayı yenileyip tekrar deneyin.'));
        }
        
        return Promise.reject(new Error('Oturum bilginiz doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.'));
      }
      
      // Token'ı temizle ve oturum açma sayfasına yönlendir
      localStorage.removeItem('auth_token');
      // Sadece şablon işlemleri dışındaki 401 hataları için login sayfasına yönlendir
      window.location.href = '/login';
      return Promise.reject(new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.'));
    }
    
    // 404 Not Found hatası
    if (error.response && error.response.status === 404) {
      // Template DELETE işlemi için özel mesaj
      if (error.config?.method === 'delete' && error.config?.url?.includes('/templates/')) {
        return Promise.reject(new Error('Silmeye çalıştığınız şablon bulunamadı. Başka bir kullanıcı tarafından silinmiş olabilir.'));
      }
      
      return Promise.reject(new Error('İstenen kaynak bulunamadı.'));
    }
    
    // 500 Internal Server Error
    if (error.response && error.response.status === 500) {
      return Promise.reject(new Error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'));
    }
    
    // İnternet bağlantısı olmadığında
    if (!error.response) {
      return Promise.reject(new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.'));
    }
    
    // API'den dönen hata mesajını al (varsa)
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'İstek işlenirken bir hata oluştu.';
                        
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance; 