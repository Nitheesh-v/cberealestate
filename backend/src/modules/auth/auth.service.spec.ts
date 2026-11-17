import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { compare, hash } from 'bcrypt';
import { model, Types } from 'mongoose';
import { randomBytes } from 'node:crypto';
import { AuthService, durationSeconds } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  User,
  UserRole,
  UserSchema,
  hashUserPassword,
  type UserDocument,
} from '../users/schemas/user.schema';
import { EmailProducer } from '../email/email.producer';
import { tokenDigest } from '../../common/security';
import { assertPayload } from './strategies/jwt.strategy';
const UserModel = model<User>('AuthUnitUser', UserSchema);
const password = 'ValidPassword1!';
const payload = {
  sub: new Types.ObjectId().toString(),
  email: 'test@example.test',
  role: UserRole.USER,
  version: 0,
  type: 'refresh' as const,
  jti: '12345678-1234-1234-1234-123456789abc',
  remember: true,
};
describe('AuthService security boundaries', () => {
  let auth: AuthService;
  let user: UserDocument;
  let hashed: string;
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    setSession: jest.fn(),
    revokeSession: jest.fn(),
    markVerified: jest.fn(),
    setResetToken: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };
  const transaction = {
    hset: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };
  const redis = { multi: jest.fn(() => transaction), set: jest.fn(), eval: jest.fn() };
  const email = {
    sendWelcomeEmail: jest.fn(),
    sendOtpEmail: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
  };
  beforeAll(async () => {
    hashed = await hash(password, 12);
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    user = new UserModel({
      _id: payload.sub,
      firstName: 'Test',
      lastName: 'Person',
      email: payload.email,
      password: hashed,
      role: UserRole.USER,
      isActive: true,
      isVerified: false,
      tokenVersion: 0,
      refreshToken: tokenDigest('old-refresh'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    users.create.mockResolvedValue(user);
    users.findByEmail.mockResolvedValue(user);
    users.findById.mockResolvedValue(user);
    users.setSession.mockResolvedValue(true);
    redis.set.mockResolvedValue('OK');
    transaction.exec.mockResolvedValue([[null, 'OK']]);
    redis.eval.mockResolvedValue(user._id.toString());
    email.sendOtpEmail.mockResolvedValue(undefined);
    email.sendWelcomeEmail.mockResolvedValue(undefined);
    email.sendResetPasswordEmail.mockResolvedValue(undefined);
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: new JwtService() },
        {
          provide: ConfigService,
          useValue: new ConfigService({
            JWT_SECRET: randomBytes(48).toString('hex'),
            JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
            JWT_ISSUER: 'test',
            JWT_AUDIENCE: 'test-client',
            APP_URL: 'https://frontend.example.test',
          }),
        },
        { provide: getRedisConnectionToken(), useValue: redis },
        { provide: EmailProducer, useValue: email },
      ],
    }).compile();
    auth = module.get(AuthService);
  });
  it('registers with hashed OTP storage, bounded TTL and a sanitized public user', async () => {
    const result = await auth.register({
      firstName: 'Test',
      lastName: 'Person',
      email: payload.email,
      password,
      role: UserRole.USER,
    });
    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('refreshToken');
    expect(result.user).not.toHaveProperty('tokenVersion');
    expect(transaction.expire).toHaveBeenCalledWith(expect.any(String), 600);
    const sentCode: unknown = email.sendOtpEmail.mock.calls[0]?.[1];
    expect(sentCode).toEqual(expect.stringMatching(/^\d{6}$/));
    const stored: unknown = transaction.hset.mock.calls[0]?.[1];
    expect(stored).toMatchObject({ digest: expect.stringMatching(/^[a-f0-9]{64}$/), attempts: 0 });
    expect(users.setSession).toHaveBeenCalledWith(
      payload.sub,
      0,
      tokenDigest(result.refreshToken),
      1,
    );
    expect(email.sendWelcomeEmail).toHaveBeenCalled();
  });
  it('survives mail-queue failure with an explicit resend status, not a fake sent message', async () => {
    email.sendOtpEmail.mockRejectedValueOnce(new Error('queue down'));
    const result = await auth.register({
      firstName: 'Test',
      lastName: 'Person',
      email: payload.email,
      password,
      role: UserRole.USER,
    });
    expect(result.verificationEmailQueued).toBe(false);
  });
  it('rejects public administrator registration defensively', async () => {
    const dto = {
      firstName: 'Test',
      lastName: 'Person',
      email: payload.email,
      password,
      role: UserRole.ADMIN,
    } as unknown as import('./dto/register.dto').RegisterDto;
    await expect(auth.register(dto)).rejects.toThrow('Invalid registration role');
    expect(users.create).not.toHaveBeenCalled();
  });
  it('returns the same credential error for wrong, inactive and missing accounts', async () => {
    await expect(auth.login(payload.email, 'wrong')).rejects.toThrow(
      'Email or password is incorrect',
    );
    user.isActive = false;
    await expect(auth.login(payload.email, password)).rejects.toThrow(
      'Email or password is incorrect',
    );
    users.findByEmail.mockResolvedValueOnce(null);
    await expect(auth.login(payload.email, password)).rejects.toThrow(
      'Email or password is incorrect',
    );
  });
  it('rejects revoked access versions and inactive users', async () => {
    await expect(auth.validateAccess({ ...payload, type: 'access', version: 3 })).rejects.toThrow(
      'Session expired',
    );
    user.isActive = false;
    await expect(auth.validateAccess({ ...payload, type: 'access' })).rejects.toThrow(
      'Session expired',
    );
  });
  it('returns a current database role, not a stale claim', async () => {
    user.role = UserRole.AGENT;
    expect((await auth.validateAccess({ ...payload, type: 'access' })).role).toBe(UserRole.AGENT);
  });
  it('rotates with the old digest as an atomic compare-and-swap condition', async () => {
    const result = await auth.refreshToken(payload, 'old-refresh');
    expect(users.setSession).toHaveBeenCalledWith(
      payload.sub,
      0,
      tokenDigest(result.refreshToken),
      0,
      tokenDigest('old-refresh'),
    );
  });
  it('allows only one concurrent redemption of a refresh credential', async () => {
    users.setSession.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const result = await Promise.allSettled([
      auth.refreshToken(payload, 'old-refresh'),
      auth.refreshToken(payload, 'old-refresh'),
    ]);
    expect(result.filter((entry) => entry.status === 'fulfilled')).toHaveLength(1);
  });
  it('rejects an unknown refresh digest before issuing a session', async () => {
    await expect(auth.refreshToken(payload, 'stolen-or-old')).rejects.toThrow(
      'Refresh token is invalid',
    );
    expect(users.setSession).not.toHaveBeenCalled();
  });
  it('revokes logout using the authenticated session generation', async () => {
    await auth.logout({
      id: payload.sub,
      email: payload.email,
      role: UserRole.USER,
      tokenVersion: 0,
    });
    expect(users.revokeSession).toHaveBeenCalledWith(payload.sub, 0);
  });
  it('hashes reset tokens before persistence and does not return them', async () => {
    const result = await auth.forgotPassword(payload.email);
    expect(result).not.toHaveProperty('token');
    expect(users.setResetToken.mock.calls[0]?.[1]).toMatch(/^[a-f0-9]{64}$/);
    const url = new URL(String(email.sendResetPasswordEmail.mock.calls[0]?.[1]));
    expect(url.origin).toBe('https://frontend.example.test');
    expect(url.searchParams.get('token')).toMatch(/^[a-f0-9]{64}$/);
  });
  it('uses an identical recovery response for missing users', async () => {
    const found = await auth.forgotPassword(payload.email);
    users.findByEmail.mockResolvedValueOnce(null);
    const missing = await auth.forgotPassword('missing@example.test');
    expect(found).toEqual(missing);
  });
  it('does not flood recovery inboxes during cooldown', async () => {
    redis.set.mockResolvedValueOnce(null);
    await auth.forgotPassword(payload.email);
    expect(email.sendResetPasswordEmail).not.toHaveBeenCalled();
  });
  it('consumes valid OTP challenges and rejects expired/used/locked challenges', async () => {
    await auth.verifyOtp(payload.email, '000123');
    expect(users.markVerified).toHaveBeenCalledWith(payload.sub);
    redis.eval.mockResolvedValueOnce('');
    await expect(auth.verifyOtp(payload.email, '000123')).rejects.toThrow(
      'Code is invalid or expired',
    );
  });
  it('hashes reset inputs before passing them to the persistence boundary', async () => {
    await auth.resetPassword('a'.repeat(64), password);
    expect(users.resetPassword).toHaveBeenCalledWith(tokenDigest('a'.repeat(64)), password);
  });
});
describe('Password hook and JWT claims', () => {
  it('hashes a modified password with 12 rounds', async () => {
    const doc = { password, isModified: () => true } as unknown as UserDocument;
    await hashUserPassword.call(doc);
    expect(doc.password).toMatch(/^\$2[aby]\$12\$/);
    expect(await compare(password, doc.password)).toBe(true);
  });
  it('does not rehash an unchanged password', async () => {
    const doc = { password: 'unchanged-hash', isModified: () => false } as unknown as UserDocument;
    await hashUserPassword.call(doc);
    expect(doc.password).toBe('unchanged-hash');
  });
  it('rejects bcrypt-truncated multibyte passwords', async () => {
    const doc = { password: '🙂'.repeat(20), isModified: () => true } as unknown as UserDocument;
    await expect(hashUserPassword.call(doc)).rejects.toThrow('72 UTF-8 bytes');
  });
  it('rejects cross-purpose and malformed JWT payloads', () => {
    expect(() => assertPayload(payload, 'access')).toThrow();
    expect(() => assertPayload({ ...payload, sub: '$where' }, 'refresh')).toThrow();
    expect(() => assertPayload({ ...payload, version: -1 }, 'refresh')).toThrow();
    expect(() => assertPayload(payload, 'refresh')).not.toThrow();
  });
  it.each(['0m', 'forever', '100d'])('rejects invalid or excessive JWT lifetime %s', (input) => {
    expect(() => durationSeconds(input)).toThrow();
  });
});
