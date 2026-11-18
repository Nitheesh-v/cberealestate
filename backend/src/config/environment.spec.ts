import { validateEnvironment } from './environment';
const valid = {
  NODE_ENV: 'test',
  APP_URL: 'https://example.test',
  SMTP_HOST: 'smtp.example.test',
  SMTP_USER: 'user',
  SMTP_PASSWORD: 'test-only',
  SMTP_FROM: 'noreply@example.test',
  MONGODB_URI: 'mongodb://db/test',
  REDIS_HOST: 'redis',
  FRONTEND_URL: 'https://example.test',
  JWT_SECRET: 'a'.repeat(40),
  JWT_REFRESH_SECRET: 'b'.repeat(40),
};
describe('validateEnvironment', () => {
  it('casts port and applies defaults', () => {
    expect(validateEnvironment({ ...valid, PORT: '5050' })).toMatchObject({
      PORT: 5050,
      REDIS_PORT: 6379,
    });
  });
  it('rejects missing infrastructure', () => {
    expect(() => validateEnvironment({})).toThrow('Invalid environment');
  });
  it.each(['*', 'https://example.test/', 'javascript:alert(1)', ''])(
    'rejects unsafe CORS origin %s',
    (origin) => {
      expect(() => validateEnvironment({ ...valid, FRONTEND_URL: origin })).toThrow();
    },
  );
  it('rejects shared production secrets', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: valid.JWT_SECRET,
      }),
    ).toThrow('distinct');
  });
});

describe('Local SMTP configuration', () => {
  const local = {
    ...valid,
    SMTP_HOST: '127.0.0.1',
    SMTP_AUTH_ENABLED: 'false',
    SMTP_USER: '',
    SMTP_PASSWORD: '',
  };
  it('allows a local development inbox without fake SMTP credentials', () => {
    expect(validateEnvironment(local)).toMatchObject({ SMTP_AUTH_ENABLED: 'false' });
  });
  it('requires credentials by default', () => {
    expect(() => validateEnvironment({ ...valid, SMTP_USER: '', SMTP_PASSWORD: '' })).toThrow();
  });
  it('rejects unauthenticated remote SMTP', () => {
    expect(() => validateEnvironment({ ...local, SMTP_HOST: 'smtp.example.test' })).toThrow(
      'loopback',
    );
  });
  it.each(['staging', 'production'])('rejects disabled SMTP authentication in %s', (mode) => {
    expect(() => validateEnvironment({ ...local, NODE_ENV: mode })).toThrow('loopback');
  });
});
