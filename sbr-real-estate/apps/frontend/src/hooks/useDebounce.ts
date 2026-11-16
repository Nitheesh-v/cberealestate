'use client';
import { useEffect, useState } from 'react';
/** Defers a value update until input has remained stable for the requested interval. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(() => value);
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebounced(() => value),
      Number.isFinite(delay) ? Math.max(0, delay) : 300,
    );
    return () => window.clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}
