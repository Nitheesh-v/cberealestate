// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/store/auth.store';
import { refreshSession } from './auth-session';
const post = vi.hoisted(() => vi.fn());
vi.mock('./http', () => ({ http: { post } }));
const session = {
  user: {
    id: 'test',
    firstName: 'Test',
    lastName: 'Person',
    fullName: 'Test Person',
    email: 'test@example.test',
    role: 'user',
    isVerified: true,
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  accessToken: 'new-access',
  expiresIn: 900,
  rememberMe: true,
};
describe('Single-flight refresh coordinator', () => {
  beforeEach(() => {
    post.mockReset();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      sessionEpoch: 0,
      loggedOut: false,
    });
  });
  it('shares concurrent refresh requests', async () => {
    post.mockResolvedValueOnce({ data: { data: session } });
    const results = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);
    expect(post).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(3);
    expect(useAuthStore.getState().accessToken).toBe('new-access');
  });
  it('does not restore a session after an intervening logout', async () => {
    let complete: ((value: unknown) => void) | undefined;
    post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const request = refreshSession();
    useAuthStore.getState().clearAuth();
    complete?.({ data: { data: session } });
    await expect(request).rejects.toThrow('Session changed');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
  it('resets its in-flight promise after failure so retry is possible', async () => {
    post.mockRejectedValueOnce(new Error('expired'));
    await expect(refreshSession()).rejects.toThrow();
    post.mockResolvedValueOnce({ data: { data: session } });
    await expect(refreshSession()).resolves.toMatchObject({ accessToken: 'new-access' });
  });
  it('never uses a cookie automatically after explicit logout', async () => {
    useAuthStore.setState({ loggedOut: true });
    await expect(refreshSession()).rejects.toThrow('Signed out');
    expect(post).not.toHaveBeenCalled();
  });
});
