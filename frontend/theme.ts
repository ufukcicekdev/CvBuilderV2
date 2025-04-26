import { createTheme } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles';

// Create a theme instance with shared options
const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: '#1565c0',
            light: '#4f83cc',
            dark: '#0d47a1',
          },
          secondary: {
            main: '#c2185b',
            light: '#e91e63',
            dark: '#880e4f',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#212121',
            secondary: '#616161',
          },
        }
      : {
          // Dark mode palette
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
        }),
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Create the light theme (default)
export const theme = createTheme(getThemeOptions('light'));

// TypeScript için tema tipini genişlet
declare module '@mui/material/styles' {
  interface Theme {
    // Özel tema özellikleri buraya eklenebilir
  }
  interface ThemeOptions {
    // Özel tema seçenekleri buraya eklenebilir
  }
} 