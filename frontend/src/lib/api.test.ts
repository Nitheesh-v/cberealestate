// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, type AxiosAdapter } from 'axios';
import { api } from './api';
import { useAuthStore } from '@/store/auth.store';
const refresh = vi.hoisted(() => vi.fn());
vi.mock('./auth-session', () => ({ refreshSession: refresh }));
describe('Authenticated Axios transport', () => {
  beforeEach(() => {
    refresh.mockReset();
    useAuthStore.setState({
      user: null,
      accessToken: 'old',
      isAuthenticated: true,
      sessionEpoch: 0,
    });
  });
  it('attaches the in-memory credential', async () => {
    api.defaults.adapter = (async (config) => {
      expect(config.headers.Authorization).toBe('Bearer old');
      return { config, status: 200, statusText: 'OK', headers: {}, data: {} };
    }) satisfies AxiosAdapter;
    await api.get('/private');
  });
  it('refreshes on 401 and retries once with the rotated credential', async () => {
    let calls = 0;
    refresh.mockImplementation(async () => {
      useAuthStore.setState({ accessToken: 'new' });
      return { accessToken: 'new' };
    });
    api.defaults.adapter = (async (config) => {
      calls += 1;
      if (calls === 1)
        throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, undefined, {
          config,
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          data: {},
        });
      expect(config.headers.Authorization).toBe('Bearer new');
      return { config, status: 200, statusText: 'OK', headers: {}, data: {} };
    }) satisfies AxiosAdapter;
    await api.get('/private');
    expect(calls).toBe(2);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('never refreshes recursively if the retried request also returns 401', async () => {
    refresh.mockResolvedValue({ accessToken: 'new' });
    api.defaults.adapter = (async (config) => {
      throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, undefined, {
        config,
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        data: {},
      });
    }) satisfies AxiosAdapter;
    await expect(api.get('/private')).rejects.toThrow();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('does not refresh forbidden responses', async () => {
    api.defaults.adapter = (async (config) => {
      throw new AxiosError('forbidden', 'ERR_BAD_REQUEST', config, undefined, {
        config,
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        data: {},
      });
    }) satisfies AxiosAdapter;
    await expect(api.get('/private')).rejects.toThrow();
    expect(refresh).not.toHaveBeenCalled();
  });
});
