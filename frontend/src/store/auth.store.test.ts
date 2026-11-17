// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './auth.store';
import { UserRole, type User } from '@/types/user.types';
const logout = vi.hoisted(() => vi.fn());
vi.mock('@/services/auth.service', () => ({ authService: { logout } }));
const user: User = {
  id: 'test',
  firstName: 'Test',
  lastName: 'Person',
  fullName: 'Test Person',
  email: 'test@example.test',
  role: UserRole.USER,
  isVerified: false,
  isActive: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};
describe('Authentication store', () => {
  beforeEach(() => {
    localStorage.clear();
    logout.mockReset().mockResolvedValue(undefined);
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      sessionEpoch: 0,
      loggedOut: false,
    });
  });
  it('stores tokens in memory but persists neither token nor authorization flag', () => {
    useAuthStore.getState().setAuth(user, 'secret-access-token');
    const persisted = localStorage.getItem('sbr-auth-profile') ?? '';
    expect(persisted).toContain('Test Person');
    expect(persisted).not.toContain('secret-access-token');
    expect(persisted).not.toContain('isAuthenticated');
  });
  it('clears local auth and prevents automatic cookie restore even when server logout fails', async () => {
    useAuthStore.getState().setAuth(user, 'token');
    logout.mockRejectedValueOnce(new Error('network down'));
    await expect(useAuthStore.getState().logout()).rejects.toThrow();
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      loggedOut: true,
    });
    await useAuthStore.getState().checkAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
  it('updates a public profile without replacing the access credential', () => {
    useAuthStore.getState().setAuth(user, 'token');
    useAuthStore.getState().updateUser({ ...user, firstName: 'Updated' });
    expect(useAuthStore.getState().user?.firstName).toBe('Updated');
    expect(useAuthStore.getState().accessToken).toBe('token');
  });
  it('allows explicit sign-in after an intentional logout', async () => {
    useAuthStore.getState().setAuth(user, 'old');
    await useAuthStore.getState().logout();
    useAuthStore.getState().setAuth(user, 'new');
    expect(useAuthStore.getState()).toMatchObject({
      loggedOut: false,
      isAuthenticated: true,
      accessToken: 'new',
    });
  });
});
