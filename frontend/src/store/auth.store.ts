'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/types/user.types';
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionEpoch: number;
  loggedOut: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}
/** Persists only a profile hint; tokens and authorization state are never trusted from storage. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      sessionEpoch: 0,
      loggedOut: false,
      setAuth: (user, token) =>
        set((state) => ({
          user,
          loggedOut: false,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
          sessionEpoch: state.sessionEpoch + 1,
        })),
      clearAuth: () =>
        set((state) => ({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          sessionEpoch: state.sessionEpoch + 1,
        })),
      updateUser: (user) => set({ user }),
      logout: async () => {
        const token = get().accessToken;
        get().clearAuth();
        set({ loggedOut: true });
        if (token) {
          const { authService } = await import('@/services/auth.service');
          await authService.logout(token);
        }
      },
      checkAuth: async () => {
        if (get().loggedOut) {
          get().clearAuth();
          return;
        }
        const { refreshSession } = await import('@/lib/auth-session');
        try {
          await refreshSession();
        } catch {
          if (!get().accessToken) get().clearAuth();
        }
      },
    }),
    {
      name: 'sbr-auth-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, loggedOut: state.loggedOut }),
      skipHydration: true,
    },
  ),
);
