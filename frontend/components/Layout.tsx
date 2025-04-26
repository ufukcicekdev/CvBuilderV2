'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Navbar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          position: 'relative',
          width: '100%',
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
} 