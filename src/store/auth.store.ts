import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '@/services/api';
import { STORAGE_KEYS } from '@/constants/config';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.token);
      if (token) {
        set({ token, isAuthenticated: true });
        await get().fetchMe();
      }
    } catch {
      // Ignore storage errors
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { token } = await AuthService.login(email, password);
      await SecureStore.setItemAsync(STORAGE_KEYS.token, token);
      set({ token, isAuthenticated: true });
      await get().fetchMe();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password, phone) => {
    set({ isLoading: true });
    try {
      const { token } = await AuthService.register({ name, email, password, phone });
      await SecureStore.setItemAsync(STORAGE_KEYS.token, token);
      set({ token, isAuthenticated: true });
      await get().fetchMe();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AuthService.logout();
    await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
    set({ token: null, user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const user = await AuthService.me();
      set({ user });
    } catch {
      // Token may be expired
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
}));
