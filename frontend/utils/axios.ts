import axios, { AxiosRequestHeaders } from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`
            } as AxiosRequestHeaders;
            
            console.log('Request config:', {
                url: config.url,
                method: config.method,
                headers: config.headers,
                token
            });
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.log('Error response:', {
            url: originalRequest?.url,
            status: error.response?.status,
            error: error.response?.data
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('/api/users/token/refresh/', {
                    refresh: refreshToken
                });

                const { access: newAccessToken } = response.data;
                localStorage.setItem('accessToken', newAccessToken);

                if (!originalRequest.headers) {
                    originalRequest.headers = {};
                }
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                console.log('Token refreshed:', {
                    newToken: newAccessToken,
                    headers: originalRequest.headers
                });

                return axiosInstance(originalRequest);

            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 