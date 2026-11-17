import 'reflect-metadata';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { randomBytes } from 'node:crypto';
import { hash } from 'bcrypt';
import { model } from 'mongoose';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../src/modules/auth/strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { AuthRateLimitGuard } from '../src/common/guards/auth-rate-limit.guard';
import { UsersService } from '../src/modules/users/users.service';
import {
  User,
  UserRole,
  UserSchema,
  type UserDocument,
} from '../src/modules/users/schemas/user.schema';
import { EmailProducer } from '../src/modules/email/email.producer';
import { Roles } from '../src/common/decorators/roles.decorator';
import { setupApp } from '../src/setup-app';
const Users = model<User>('HttpAuthUser', UserSchema);
/** Test-only protected routes exercise the actual global access and role guards. */
@Controller('private')
class PrivateController {
  /** Requires any current, active account. */
  @Get() getPrivate(): { ok: boolean } {
    return { ok: true };
  }
  /** Requires current administrator privilege. */
  @Get('admin') @Roles('admin') getAdmin(): { ok: boolean } {
    return { ok: true };
  }
}
describe('Auth HTTP (real JWTs/guards, mocked MongoDB/Redis/mail)', () => {
  let app: INestApplication;
  let user: UserDocument;
  let passwordHash: string;
  let limited = false;
  const config = new ConfigService({
    NODE_ENV: 'test',
    FRONTEND_URL: 'https://web.example.test',
    API_PREFIX: 'api',
    APP_URL: 'https://web.example.test',
    JWT_SECRET: randomBytes(48).toString('hex'),
    JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
    JWT_ISSUER: 'auth-http',
    JWT_AUDIENCE: 'auth-http-web',
  });
  const users = {
    findByEmail: jest.fn(async () => user),
    findById: jest.fn(async () => user),
    create: jest.fn(async () => user),
    setSession: jest.fn(
      async (
        _id: string,
        version: number,
        digest: string,
        nextVersion: number,
        previous?: string,
      ) => {
        if (user.tokenVersion !== version || (previous && previous !== user.refreshToken))
          return false;
        user.tokenVersion = nextVersion;
        user.refreshToken = digest;
        return true;
      },
    ),
    revokeSession: jest.fn(async () => {
      user.tokenVersion += 1;
      user.refreshToken = undefined;
    }),
    markVerified: jest.fn(),
    setResetToken: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
  };
  const tx = {
    hset: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    exec: jest.fn(async () => [[null, 'OK']]),
  };
  const redis = {
    multi: () => tx,
    set: jest.fn(async () => 'OK'),
    eval: jest.fn(async () => [limited ? 999 : 1, 60]),
  };
  beforeAll(async () => {
    passwordHash = await hash('GoodPassword1!', 12);
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({})],
      controllers: [AuthController, PrivateController],
      providers: [
        AuthService,
        JwtStrategy,
        JwtRefreshStrategy,
        AuthRateLimitGuard,
        { provide: UsersService, useValue: users },
        { provide: ConfigService, useValue: config },
        { provide: getRedisConnectionToken(), useValue: redis },
        {
          provide: EmailProducer,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendOtpEmail: jest.fn(),
            sendResetPasswordEmail: jest.fn(),
          },
        },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
  });
  beforeEach(() => {
    limited = false;
    user = new Users({
      firstName: 'Test',
      lastName: 'Person',
      email: 'test@example.test',
      password: passwordHash,
      role: UserRole.USER,
      tokenVersion: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
  afterAll(async () => {
    await app.close();
  });
  /** Obtains a real signed JWT through the actual public controller. */
  const login = async () =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'GoodPassword1!' })
      .expect(200);
  it('protects all non-public routes by default', async () => {
    await request(app.getHttpServer()).get('/api/private').expect(401);
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });
  it('validates registration role and mass-assignment fields before service execution', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'Person',
        email: user.email,
        password: 'GoodPassword1!',
        role: 'admin',
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'Person',
        email: user.email,
        password: 'GoodPassword1!',
        isVerified: true,
      })
      .expect(400);
  });
  it('issues HTTP-only cookies and never returns selected password fields', async () => {
    const response = await login();
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain(passwordHash);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(String(response.headers['set-cookie'])).toContain('HttpOnly');
    expect(String(response.headers['set-cookie'])).toContain('SameSite=Lax');
  });
  it('honors remember-me=false with a session-only refresh cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'GoodPassword1!', rememberMe: false })
      .expect(200);
    expect(String(response.headers['set-cookie'])).not.toContain('Max-Age=');
  });
  it('allows bearer access but rejects refresh-token substitution', async () => {
    const response = await login();
    const data = response.body.data as { accessToken: string; refreshToken: string };
    await request(app.getHttpServer())
      .get('/api/private')
      .auth(data.accessToken, { type: 'bearer' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/private')
      .auth(data.refreshToken, { type: 'bearer' })
      .expect(401);
  });
  it('allows access-cookie extraction but rejects cookie mutations without Origin', async () => {
    const response = await login();
    const data = response.body.data as { accessToken: string; refreshToken: string };
    await request(app.getHttpServer())
      .get('/api/private')
      .set('Cookie', `accessToken=${data.accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${data.refreshToken}`)
      .send({})
      .expect(403);
  });
  it('rotates a cookie token once, then rejects its replay', async () => {
    const response = await login();
    const data = response.body.data as { refreshToken: string };
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Origin', 'https://web.example.test')
      .set('Cookie', `refreshToken=${data.refreshToken}`)
      .send({})
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: data.refreshToken })
      .expect(401);
  });
  it('enforces current database roles', async () => {
    const response = await login();
    const data = response.body.data as { accessToken: string };
    await request(app.getHttpServer())
      .get('/api/private/admin')
      .auth(data.accessToken, { type: 'bearer' })
      .expect(403);
    user.role = UserRole.ADMIN;
    await request(app.getHttpServer())
      .get('/api/private/admin')
      .auth(data.accessToken, { type: 'bearer' })
      .expect(200);
  });
  it('revokes existing access JWTs on logout', async () => {
    const response = await login();
    const data = response.body.data as { accessToken: string };
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .auth(data.accessToken, { type: 'bearer' })
      .send({})
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/private')
      .auth(data.accessToken, { type: 'bearer' })
      .expect(401);
  });
  it('rejects disabled accounts even with an unexpired access token', async () => {
    const response = await login();
    user.isActive = false;
    const data = response.body.data as { accessToken: string };
    await request(app.getHttpServer())
      .get('/api/private')
      .auth(data.accessToken, { type: 'bearer' })
      .expect(401);
  });
  it('returns 429 and Retry-After when a shared limit is exceeded', async () => {
    limited = true;
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: 'GoodPassword1!' })
      .expect(429);
    expect(response.headers['retry-after']).toBe('60');
  });
});
