import { http } from './http';
import { useAuthStore } from '@/store/auth.store';
import { authSessionSchema } from './validators/auth.validator';
import type { AuthSession } from '@/types/auth.types';
import type { ApiResponse } from '@/types';
let refreshing: Promise<AuthSession> | null = null;
/** Single-flight refresh, serialized across browser tabs where Web Locks is supported. */
export async function refreshSession(): Promise<AuthSession> {
  if (useAuthStore.getState().loggedOut) throw new Error('Signed out');
  if (refreshing) return refreshing;
  const epoch = useAuthStore.getState().sessionEpoch;
  /** Redeems the current HTTP-only cookie and ignores responses from a superseded session. */
  const rotate = async (): Promise<AuthSession> => {
    const response = await http.post<ApiResponse<unknown>>('/auth/refresh', {});
    const session = authSessionSchema.parse(response.data.data);
    if (useAuthStore.getState().sessionEpoch !== epoch) throw new Error('Session changed');
    useAuthStore.getState().setAuth(session.user, session.accessToken);
    return session;
  };
  refreshing = (async () => {
    try {
      return typeof navigator !== 'undefined' && navigator.locks
        ? await navigator.locks.request('sbr-auth-refresh', rotate)
        : await rotate();
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}
