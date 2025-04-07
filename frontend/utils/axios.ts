import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

// API URL'yi doğrudan .env dosyasından alıyoruz
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// console.log('Axios using API URL:', API_URL); // Debug için

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

    // Request interceptor - only in browser
    axiosInstance.interceptors.request.use(
        async (config) => {
            // Debug için URL'yi loglayalım
            // console.log(`Request to: ${config.url}`);
            
            // Clear any existing Authorization header
            delete config.headers.Authorization;
            
            // Get token from localStorage first
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                // console.log('Using token from localStorage');
            } else {
                // If no token in localStorage, try to get from session
                const session = await getSession();
                if (session?.accessToken) {
                    config.headers.Authorization = `Bearer ${session.accessToken}`;
                    // console.log('Using token from NextAuth session');
                } else {
                    // console.log('No token found in localStorage or session');
                }
            }
            
            // Debug için header'ları loglayalım
            // console.log('Request headers:', JSON.stringify(config.headers));
            // console.log('Request data:', config.data);
            
            return config;
        },
        (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor - only in browser
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
                    // Try to get new token from localStorage first
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        // console.log('Refreshing token with localStorage refreshToken');
                        // Burada axios yerine axiosInstance kullanmıyoruz çünkü
                        // axiosInstance kullanırsak sonsuz döngüye girebiliriz
                        const response = await axios.post(`${API_URL}/api/users/token/refresh/`, {
                            refresh: refreshToken
                        });
                        const { access } = response.data;
                        localStorage.setItem('accessToken', access);
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        // console.log('Token refreshed successfully');
                        processQueue(null, access);
                        return axiosInstance(originalRequest);
                    }
                    
                    // If no refresh token in localStorage, try session
                    const session = await getSession();
                    if (session?.accessToken) {
                        // console.log('Using token from NextAuth session after refresh attempt');
                        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
                        processQueue(null, session.accessToken);
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh error:', refreshError);
                    processQueue(refreshError, null);
                    // Clear all auth data on refresh error
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    await signOut({ redirect: true, callbackUrl: '/login' });
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