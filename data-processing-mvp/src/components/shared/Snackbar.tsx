import React from 'react';
import {
  Snackbar as MuiSnackbar,
  Alert,
  AlertProps,
} from '@mui/material';
import { create } from 'zustand';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertProps['severity'];
  autoHideDuration: number;
  
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  closeSnackbar: () => void;
}

export const useSnackbar = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 6000,
  
  showSuccess: (message, duration = 6000) => set({
    open: true,
    message,
    severity: 'success',
    autoHideDuration: duration
  }),
  
  showError: (message, duration = 6000) => set({
    open: true,
    message,
    severity: 'error',
    autoHideDuration: duration
  }),
  
  showInfo: (message, duration = 6000) => set({
    open: true,
    message,
    severity: 'info',
    autoHideDuration: duration
  }),
  
  showWarning: (message, duration = 6000) => set({
    open: true,
    message,
    severity: 'warning',
    autoHideDuration: duration
  }),
  
  closeSnackbar: () => set({ open: false })
}));

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open, message, severity, autoHideDuration, closeSnackbar } = useSnackbar();
  
  return (
    <>
      {children}
      <MuiSnackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={() => closeSnackbar()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => closeSnackbar()} 
          severity={severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </MuiSnackbar>
    </>
  );
};