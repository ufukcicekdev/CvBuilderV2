import axios from 'axios';

// API URL'yi doğrudan .env dosyasından alıyoruz
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CSRF ve auth token'lar için önemli
});

// Backend'deki session API'sini kullanmak için yardımcı fonksiyon
export const getBackendSession = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/session/');
    return response.data;
  } catch (error) {
    console.error('Backend session error:', error);
    return null;
  }
};

// Only add interceptors in browser environment
if (typeof window !== 'undefined') {
  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Request interceptor
  axiosInstance.interceptors.request.use(
    async (config) => {
      delete config.headers.Authorization;

      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const session = await getBackendSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${API_URL}/api/users/token/refresh/`, {
              refresh: refreshToken,
            });
            const { access } = response.data;
            localStorage.setItem('accessToken', access);
            originalRequest.headers.Authorization = `Bearer ${access}`;
            processQueue(null, access);
            return axiosInstance(originalRequest);
          }

          const session = await getBackendSession();
          if (session?.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            processQueue(null, session.accessToken);
            return axiosInstance(originalRequest);
          }

        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          processQueue(refreshError, null);

          // Hook kullanmadan logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}

export default axiosInstance;
