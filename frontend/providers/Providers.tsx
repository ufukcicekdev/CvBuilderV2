'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ProgressBar
          height="4px"
          color="#2196f3"
          options={{ showSpinner: false }}
          shallowRouting
        />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
} 