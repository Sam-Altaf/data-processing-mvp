import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import DatasetView from './pages/DatasetView';
import ConversationView from './pages/ConversationView';
import Settings from './pages/Settings';
import Layout from './components/Layout/Layout';
import Auth from './pages/Auth';
import { SnackbarProvider } from './components/shared/Snackbar';
import { useAuthStore } from './store/authStore';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#6573c3',
      dark: '#2c387e',
    },
    secondary: {
      main: '#f50057',
      light: '#f73378',
      dark: '#ab003c',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 6px -1px rgba(0,0,0,0.08), 0px 6px 10px 0px rgba(0,0,0,0.05), 0px 1px 18px 0px rgba(0,0,0,0.04)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 5px 10px -1px rgba(0,0,0,0.1), 0px 8px 16px 0px rgba(0,0,0,0.08), 0px 2px 24px 0px rgba(0,0,0,0.06)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dataset/:id" element={<DatasetView />} />
              <Route path="conversation/:id" element={<ConversationView />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;