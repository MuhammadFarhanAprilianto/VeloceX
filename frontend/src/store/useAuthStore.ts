import { create } from 'zustand';
import { User } from '@/types/trading';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if running in browser and load from localStorage
  const isBrowser = typeof window !== 'undefined';
  const savedToken = isBrowser ? localStorage.getItem('velocex_access_token') : null;
  const savedRefresh = isBrowser ? localStorage.getItem('velocex_refresh_token') : null;
  const savedUser = isBrowser && localStorage.getItem('velocex_user')
    ? JSON.parse(localStorage.getItem('velocex_user') || '{}')
    : null;

  return {
    user: savedUser,
    accessToken: savedToken,
    refreshToken: savedRefresh,
    isAuthenticated: !!savedToken,

    setAuth: (user, accessToken, refreshToken) => {
      if (isBrowser) {
        localStorage.setItem('velocex_access_token', accessToken);
        localStorage.setItem('velocex_refresh_token', refreshToken);
        localStorage.setItem('velocex_user', JSON.stringify(user));
      }
      set({ user, accessToken, refreshToken, isAuthenticated: true });
    },

    logout: () => {
      if (isBrowser) {
        localStorage.removeItem('velocex_access_token');
        localStorage.removeItem('velocex_refresh_token');
        localStorage.removeItem('velocex_user');
      }
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
  };
});
