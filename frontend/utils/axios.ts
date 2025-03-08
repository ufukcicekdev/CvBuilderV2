import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // CSRF ve auth token'lar için önemli
});

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
            // Clear any existing Authorization header
            delete config.headers.Authorization;
            
            // Get token from localStorage first
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                // If no token in localStorage, try to get from session
                const session = await getSession();
                if (session?.accessToken) {
                    config.headers.Authorization = `Bearer ${session.accessToken}`;
                }
            }
            
            return config;
        },
        (error) => {
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
                        const response = await axios.post('/api/users/token/refresh/', {
                            refresh: refreshToken
                        });
                        const { access } = response.data;
                        localStorage.setItem('accessToken', access);
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        processQueue(null, access);
                        return axiosInstance(originalRequest);
                    }
                    
                    // If no refresh token in localStorage, try session
                    const session = await getSession();
                    if (session?.accessToken) {
                        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
                        processQueue(null, session.accessToken);
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
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