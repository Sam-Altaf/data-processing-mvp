import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // Simulate API call
          // In a real app, replace with actual API call: const response = await api.post('/auth/login', { email, password });
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          const mockUser = {
            id: 'user-1',
            name: 'Demo User',
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=random`
          };
          
          const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
          
          set({
            token: mockToken,
            user: mockUser,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          // Simulate API call
          // In a real app, replace with actual API call: const response = await api.post('/auth/register', { name, email, password });
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Mock successful registration
          const mockUser = {
            id: 'user-' + Math.random().toString(36).substring(2),
            name,
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          };
          
          const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
          
          set({
            token: mockToken,
            user: mockUser,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },
      
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage
    }
  )
);