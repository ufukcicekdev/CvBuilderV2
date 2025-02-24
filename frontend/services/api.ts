import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/users/login/', { email, password });
    return {
      token: response.data.token,
      user: response.data.user
    };
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const register = async (userData: {
  email: string;
  password: string;
  user_type: string;
  username: string;
}) => {
  const response = await api.post('/users/register/', userData);
  return response.data;
};

export default api; 