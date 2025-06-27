import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useSnackbar } from '../components/shared/Snackbar';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { showError } = useSnackbar.getState();
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized, token expired or invalid
        useAuthStore.getState().logout();
        showError('Your session has expired. Please login again.');
        window.location.href = '/auth';
      } else if (status === 403) {
        // Forbidden
        showError('You do not have permission to perform this action');
      } else if (status === 404) {
        // Not found
        showError('Resource not found');
      } else if (status >= 500) {
        // Server error
        showError('Server error. Please try again later.');
      } else {
        // Other errors
        const errorMessage = error.response.data?.message || 'An error occurred. Please try again.';
        showError(errorMessage);
      }
    } else if (error.request) {
      // The request was made but no response was received
      showError('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      showError('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

// Generic GET request
export const getData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await api.get(url, config);
  return response.data.data;
};

// Generic POST request
export const postData = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data, config);
  return response.data.data;
};

// Generic PUT request
export const putData = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await api.put(url, data, config);
  return response.data.data;
};

// Generic DELETE request
export const deleteData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<ApiResponse<T>> = await api.delete(url, config);
  return response.data.data;
};

// Upload file with progress tracking
export const uploadFile = (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  additionalData?: Record<string, any>
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  }).then(response => response.data.data);
};

export default api;