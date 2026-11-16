import axios from 'axios';
import { API_URL } from './constants';
import { toast } from '@/hooks/use-toast';
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
/** Attaches a bearer token only when running in a browser and storage is accessible. */
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const token = window.localStorage.getItem('accessToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* Storage can be blocked by browser privacy settings; continue unauthenticated. */
    }
  }
  return config;
});
/** Handles transport failures without trusting HTML or arbitrary text from a server. */
api.interceptors.response.use(
  async (response) => response,
  async (error: unknown) => {
    if (
      typeof window !== 'undefined' &&
      axios.isAxiosError<unknown>(error) &&
      !axios.isCancel(error)
    ) {
      if (error.response?.status === 401) {
        try {
          window.localStorage.removeItem('accessToken');
        } catch {
          /* Storage is optional. */
        }
        if (!['/login', '/register'].includes(window.location.pathname))
          window.location.assign(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      }
      toast({
        title: 'Request unsuccessful',
        description:
          error.response?.status === 401
            ? 'Please sign in to continue.'
            : 'We could not complete your request. Please try again.',
      });
    }
    throw error;
  },
);
