import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// API'nin taban URL'sini ayarla
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// İstek gönderilmeden önce tetiklenen interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Tarayıcı tarafında çalışıyorsak, JWT token'ı ekle
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Cevap alındıktan sonra tetiklenen interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized hatası durumunda kullanıcıyı login sayfasına yönlendir
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API servisi
export const apiService = {
  /**
   * GET isteği gönderir
   * @param url Endpoint URL'si
   * @param config Axios istek ayarları
   * @returns API cevabı
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
  },

  /**
   * POST isteği gönderir
   * @param url Endpoint URL'si
   * @param data İstek gövdesi
   * @param config Axios istek ayarları
   * @returns API cevabı
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
  },

  /**
   * PUT isteği gönderir
   * @param url Endpoint URL'si
   * @param data İstek gövdesi
   * @param config Axios istek ayarları
   * @returns API cevabı
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
  },

  /**
   * PATCH isteği gönderir
   * @param url Endpoint URL'si
   * @param data İstek gövdesi
   * @param config Axios istek ayarları
   * @returns API cevabı
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
  },

  /**
   * DELETE isteği gönderir
   * @param url Endpoint URL'si
   * @param config Axios istek ayarları
   * @returns API cevabı
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
  },
};
