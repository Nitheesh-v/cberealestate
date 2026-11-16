'use client';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, type PropsWithChildren } from 'react';
import { useUiStore, type Theme } from '@/store/ui.store';
/** Mirrors the persisted theme provider value into transient UI state. */
function ThemeSync(): null {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const selected: Theme = theme === 'dark' || theme === 'system' ? theme : 'light';
    useUiStore.getState().setTheme(selected);
    return useUiStore.subscribe((state, previous) => {
      if (state.theme !== previous.theme) setTheme(state.theme);
    });
  }, [theme, setTheme]);
  return null;
}
/** Supports light/dark/system with a light initial preference. */
export function ThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeSync />
      {children}
    </NextThemesProvider>
  );
}
