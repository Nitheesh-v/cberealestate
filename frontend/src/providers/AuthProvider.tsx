'use client';
import { useEffect, useRef, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
/** Restores a cookie session and prevents private query data from crossing account boundaries. */
export function AuthProvider({ children }: PropsWithChildren): React.JSX.Element {
  const client = useQueryClient();
  const id = useAuthStore((state) => state.user?.id ?? null);
  const previous = useRef<string | null>(null);
  useEffect(() => {
    /** Hydrates the explicit-logout marker before attempting an HTTP-only cookie refresh. */
    const initialize = async (): Promise<void> => {
      await useAuthStore.persist.rehydrate();
      await useAuthStore.getState().checkAuth();
    };
    void initialize();
  }, []);
  useEffect(() => {
    if (previous.current !== id) client.clear();
    previous.current = id;
  }, [client, id]);
  return <>{children}</>;
}
