'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import CssBaseline from '@mui/material/CssBaseline';
import { useRouter } from 'next/router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider>
      <AuthProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <div dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
              {children}
            </div>
          </LocalizationProvider>
        </MuiThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 