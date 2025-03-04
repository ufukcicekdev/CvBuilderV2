import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear any existing tokens and user data before login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];

      const response = await axios.post('/api/users/login/', {
        email,
        password
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setIsAuthenticated(true);
      setUser(user);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // console.log('Login successful:', {
      //   user,
      //   token: access,
      //   headers: axios.defaults.headers.common
      // });

      router.push('/dashboard/create-cv');

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setIsAuthenticated(false);
    setUser(null);

    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 