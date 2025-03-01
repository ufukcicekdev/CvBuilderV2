import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

interface AuthResponse {
    user: {
        id: number;
        email: string;
    };
    access: string;
    refresh: string;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login/`, {
                email,
                password
            });

            const { user, access, refresh } = response.data;
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await axios.post(`${API_URL}/auth/logout/`, {
                    refresh: refreshToken
                }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    refreshToken: async (): Promise<TokenResponse> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token found');
            }

            const response = await axios.post<TokenResponse>(`${API_URL}/auth/refresh/`, {
                refresh: refreshToken
            });

            const { access, refresh } = response.data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            return response.data;
        } catch (error) {
            console.error('Token refresh error:', error);
            await authService.logout();
            throw error;
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    }
};

export default authService; 