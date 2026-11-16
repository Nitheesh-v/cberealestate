import { create } from 'zustand';
export type Theme = 'light' | 'dark' | 'system';
interface UiState {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeFilterCount: number;
  setActiveFilterCount: (count: number) => void;
  incrementActiveFilterCount: () => void;
  resetActiveFilterCount: () => void;
}
/** Shared UI-only state; no authentication or business records are persisted here. */
export const useUiStore = create<UiState>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  activeFilterCount: 0,
  setActiveFilterCount: (count) =>
    set({ activeFilterCount: Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0 }),
  incrementActiveFilterCount: () =>
    set((state) => ({ activeFilterCount: state.activeFilterCount + 1 })),
  resetActiveFilterCount: () => set({ activeFilterCount: 0 }),
}));
