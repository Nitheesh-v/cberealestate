// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm, safeReturnTo } from './LoginForm';
import { useAuthStore } from '@/store/auth.store';
const mocks = vi.hoisted(() => ({ replace: vi.fn(), login: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams('returnTo=https://evil.example'),
}));
vi.mock('@/services/auth.service', () => ({
  authService: { login: mocks.login },
  authError: () => 'Sign-in failed',
}));
describe('Login form', () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.replace.mockReset();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      loggedOut: false,
    });
  });
  afterEach(cleanup);
  it('does not submit invalid input', async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/ }));
    expect(await screen.findByText('Enter a valid email address')).toBeTruthy();
    expect(mocks.login).not.toHaveBeenCalled();
  });
  it('supports password visibility toggling', async () => {
    render(<LoginForm />);
    const password = screen.getByLabelText('Password', { exact: true });
    expect(password.getAttribute('type')).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password.getAttribute('type')).toBe('text');
  });
  it('shows a persistent accessible error for bad credentials', async () => {
    mocks.login.mockRejectedValueOnce(new Error('invalid'));
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email address'), 'test@example.test');
    await userEvent.type(screen.getByLabelText('Password', { exact: true }), 'GoodPassword1!');
    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/ }));
    expect((await screen.findByRole('alert')).textContent).toBe('Sign-in failed');
  });
  it('rejects external/protocol-relative redirects and user-to-admin redirects', () => {
    expect(safeReturnTo('https://evil.example', 'user')).toBe('/dashboard');
    expect(safeReturnTo('//evil.example', 'user')).toBe('/dashboard');
    expect(safeReturnTo('/admin', 'user')).toBe('/dashboard');
    expect(safeReturnTo('/dashboard/profile', 'user')).toBe('/dashboard/profile');
    expect(safeReturnTo(null, 'admin')).toBe('/admin');
  });
});
