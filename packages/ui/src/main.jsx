import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

import App from './App.jsx';

import './index.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff',
    },
    secondary: {
      main: '#b388ff',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.06)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    text: {
      primary: 'rgba(255, 255, 255, 0.92)',
      secondary: 'rgba(255, 255, 255, 0.55)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(36, 36, 58, 0.84)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        },
        head: {
          backgroundColor: '#1a1a2e',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#252238',
          border: '1px solid rgba(179, 136, 255, 0.28)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          color: 'rgba(255, 255, 255, 0.88)',
          fontSize: '0.75rem',
        },
        arrow: {
          color: '#252238',
          filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.35))',
          '&:before': {
            border: '1px solid rgba(179, 136, 255, 0.28)',
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
