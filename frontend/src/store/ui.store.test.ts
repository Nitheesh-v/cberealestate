import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui.store';
describe('UI store', () => {
  beforeEach(() => {
    useUiStore.setState({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      theme: 'light',
      activeFilterCount: 0,
    });
  });
  it('toggles menus independently', () => {
    useUiStore.getState().toggleMobileMenu();
    expect(useUiStore.getState().isMobileMenuOpen).toBe(true);
    expect(useUiStore.getState().isSearchOpen).toBe(false);
    useUiStore.getState().toggleSearch();
    expect(useUiStore.getState().isSearchOpen).toBe(true);
  });
  it('bounds filter count', () => {
    useUiStore.getState().setActiveFilterCount(-5);
    expect(useUiStore.getState().activeFilterCount).toBe(0);
    useUiStore.getState().setActiveFilterCount(Infinity);
    expect(useUiStore.getState().activeFilterCount).toBe(0);
    useUiStore.getState().setActiveFilterCount(2.8);
    useUiStore.getState().incrementActiveFilterCount();
    expect(useUiStore.getState().activeFilterCount).toBe(3);
    useUiStore.getState().resetActiveFilterCount();
    expect(useUiStore.getState().activeFilterCount).toBe(0);
  });
  it('sets the theme preference', () => {
    useUiStore.getState().setTheme('system');
    expect(useUiStore.getState().theme).toBe('system');
  });
});
