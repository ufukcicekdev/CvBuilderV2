import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return function WithAuthComponent(props: T) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 