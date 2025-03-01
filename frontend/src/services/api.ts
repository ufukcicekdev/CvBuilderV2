import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import authService from './auth';

class ApiService {
    private api: AxiosInstance;
    private isRefreshing: boolean = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor() {
        this.api = axios.create({
            baseURL: 'http://localhost:8000/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = authService.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config;
                if (!originalRequest) {
                    return Promise.reject(error);
                }

                // Token expired hatası kontrolü (401)
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        try {
                            const token = await new Promise<string>((resolve) => {
                                this.refreshSubscribers.push((token: string) => {
                                    resolve(token);
                                });
                            });
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return this.api(originalRequest);
                        } catch (err) {
                            return Promise.reject(err);
                        }
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const data = await authService.refreshToken();
                        const { access } = data;
                        
                        this.refreshSubscribers.forEach((callback) => callback(access));
                        this.refreshSubscribers = [];
                        
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                        return this.api(originalRequest);
                    } catch (refreshError) {
                        // Token yenileme başarısız olursa login sayfasına yönlendir
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    public get instance(): AxiosInstance {
        return this.api;
    }
}

const apiService = new ApiService();
export default apiService.instance; 