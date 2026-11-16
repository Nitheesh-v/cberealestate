'use client';
import { useEffect, useState } from 'react';
/** Returns a hydration-safe media-query match and cleans up its change listener. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    /** Synchronizes the current media match. */
    const update = (): void => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
