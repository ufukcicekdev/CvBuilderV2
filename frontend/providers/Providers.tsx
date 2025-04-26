'use client';

import { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme as lightTheme } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../contexts/ThemeContext';

// ThemeWrapper component to handle theme changes
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme();
  
  // Create a theme based on the mode from context
  const theme = useMemo(() => {
    if (mode === 'dark') {
      return createTheme({
        ...lightTheme,
        palette: {
          mode: 'dark',
          primary: {
            main: '#82b1ff',
            light: '#aed8ff',
            dark: '#5472d3',
          },
          secondary: {
            main: '#ff80ab',
            light: '#ffb2dd',
            dark: '#c94f7c',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#aaaaaa',
          },
        }
      });
    }
    return lightTheme;
  }, [mode]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CustomThemeProvider>
      <ThemeWrapper>
        <AuthProvider>
          <ProgressBar
            height="4px"
            color="#1565c0"
            options={{ showSpinner: false }}
            shallowRouting
          />
          {children}
        </AuthProvider>
      </ThemeWrapper>
    </CustomThemeProvider>
  );
} 