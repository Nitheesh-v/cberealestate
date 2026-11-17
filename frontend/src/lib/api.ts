import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from './constants';
import { useAuthStore } from '@/store/auth.store';
import { refreshSession } from './auth-session';
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
/** Attaches only the current in-memory bearer credential. */
api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
/** Retries one time after a single-flight refresh; never recurses through auth handshakes. */
api.interceptors.response.use(
  async (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;
    const request = error.config as
      (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
    if (error.response?.status !== 401 || !request || request.retried) throw error;
    request.retried = true;
    const epoch = useAuthStore.getState().sessionEpoch;
    try {
      const session = await refreshSession();
      request.headers.Authorization = `Bearer ${session.accessToken}`;
    } catch {
      if (useAuthStore.getState().sessionEpoch !== epoch) throw error;
      useAuthStore.getState().clearAuth();
      if (
        typeof window !== 'undefined' &&
        /^\/(dashboard|admin)(?:\/|$)/.test(window.location.pathname)
      )
        window.location.assign(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      throw error;
    }
    return api.request(request);
  },
);
