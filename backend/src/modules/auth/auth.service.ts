import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { compare, hash } from 'bcrypt';
import { createHmac, randomBytes, randomInt, randomUUID } from 'node:crypto';
import { UsersService, publicUser } from '../users/users.service';
import { UserRole, type UserDocument } from '../users/schemas/user.schema';
import { EmailProducer } from '../email/email.producer';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import type {
  ActiveUserData,
  PublicUser,
} from '../../common/interfaces/active-user-data.interface';
import { equalDigest, tokenDigest } from '../../common/security';
export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  rememberMe: boolean;
  verificationEmailQueued?: boolean;
}
/** Converts validated JWT lifetimes to seconds without accepting zero/unbounded expiries. */
export function durationSeconds(input: string): number {
  const match = /^(\d+)([smhd])$/.exec(input);
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = Number(match?.[1]) * (units[match?.[2] ?? ''] ?? 0);
  if (!Number.isSafeInteger(seconds) || seconds < 1 || seconds > 31 * 86400)
    throw new Error('JWT lifetime must be between 1 second and 31 days');
  return seconds;
}
/** Authentication orchestration; raw reset/OTP credentials are never persisted in MongoDB. */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly dummyHash = hash(randomBytes(32).toString('hex'), 12);
  /** Injects persistence, token signing, shared challenge storage and mail delivery. */
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    private readonly email: EmailProducer,
  ) {}
  /** Creates a restricted-role account, starts a session, and queues verification mail. */
  async register(dto: RegisterDto): Promise<AuthResult> {
    if (![UserRole.USER, UserRole.AGENT].includes(dto.role))
      throw new BadRequestException('Invalid registration role');
    const user = await this.users.create(dto);
    const result = await this.startSession(user);
    let verificationEmailQueued = true;
    try {
      await this.createOtp(user);
      await this.email.sendWelcomeEmail(user.email, user.firstName);
    } catch {
      verificationEmailQueued = false;
      this.logger.error('Registration email could not be queued; user may request a new code');
    }
    return { ...result, verificationEmailQueued };
  }
  /** Performs a bcrypt comparison even for unknown emails to reduce timing enumeration. */
  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.users.findByEmail(email);
    const matches = await compare(password, user?.password ?? (await this.dummyHash));
    if (!user?.isActive || !matches)
      throw new UnauthorizedException('Email or password is incorrect');
    return user;
  }
  /** Issues a new single-device session; prior account sessions are revoked. */
  async login(email: string, password: string, remember = true): Promise<AuthResult> {
    return this.startSession(await this.validateUser(email, password), remember);
  }
  /** Signs typed, audience-bound tokens with a cryptographically random JWT identifier. */
  private async tokens(
    user: UserDocument,
    version: number,
    remember: boolean,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    rememberMe: boolean;
  }> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      version,
      remember,
    };
    const options = {
      algorithm: 'HS256' as const,
      issuer: this.config.getOrThrow<string>('JWT_ISSUER'),
      audience: this.config.getOrThrow<string>('JWT_AUDIENCE'),
    };
    const expiresIn = durationSeconds(this.config.get<string>('JWT_EXPIRES_IN') ?? '15m');
    const accessToken = await this.jwt.signAsync(
      { ...payload, type: 'access', jti: randomUUID() },
      { ...options, secret: this.config.getOrThrow<string>('JWT_SECRET'), expiresIn },
    );
    const refreshToken = await this.jwt.signAsync(
      { ...payload, type: 'refresh', jti: randomUUID() },
      {
        ...options,
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.refreshLifetime(),
      },
    );
    return { accessToken, refreshToken, expiresIn, rememberMe: remember };
  }
  /** Returns the same refresh lifetime used by the cookie and signer. */
  refreshLifetime(): number {
    return durationSeconds(this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d');
  }
  /** Installs a new session via compare-and-swap, avoiding concurrent login overwrites. */
  private async startSession(user: UserDocument, remember = true): Promise<AuthResult> {
    const nextVersion = user.tokenVersion + 1;
    const tokens = await this.tokens(user, nextVersion, remember);
    if (
      !(await this.users.setSession(
        user._id.toString(),
        user.tokenVersion,
        tokenDigest(tokens.refreshToken),
        nextVersion,
      ))
    )
      throw new UnauthorizedException('Account changed. Please sign in again.');
    return { ...tokens, user: publicUser(user) };
  }
  /** Validates current database state, so disabled accounts and stale roles cannot retain access. */
  async validateAccess(payload: JwtPayload): Promise<ActiveUserData> {
    const user = await this.users.findById(payload.sub);
    if (!user.isActive || user.tokenVersion !== payload.version)
      throw new UnauthorizedException('Session expired');
    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
  }
  /** Rotates a refresh token exactly once using its stored digest as an atomic predicate. */
  async refreshToken(payload: JwtPayload, raw: string): Promise<AuthResult> {
    const user = await this.users.findById(payload.sub, true);
    if (
      !user.isActive ||
      user.tokenVersion !== payload.version ||
      !user.refreshToken ||
      !equalDigest(tokenDigest(raw), user.refreshToken)
    )
      throw new UnauthorizedException('Refresh token is invalid or expired');
    const tokens = await this.tokens(user, payload.version, payload.remember);
    if (
      !(await this.users.setSession(
        payload.sub,
        payload.version,
        tokenDigest(tokens.refreshToken),
        payload.version,
        tokenDigest(raw),
      ))
    )
      throw new UnauthorizedException('Refresh token has already been used');
    return { ...tokens, user: publicUser(user) };
  }
  /** Revokes access and refresh credentials immediately. */
  async logout(user: ActiveUserData): Promise<void> {
    await this.users.revokeSession(user.id, user.tokenVersion);
  }
  /** Returns the current strictly serialized profile. */
  async me(id: string): Promise<PublicUser> {
    return publicUser(await this.users.findById(id));
  }
  /** Creates a keyed digest for a low-entropy OTP, preventing offline Redis brute force. */
  private otpDigest(email: string, otp: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_SECRET'))
      .update(`${email}:${otp}`)
      .digest('hex');
  }
  /** Stores an expiring challenge and enqueues mail; never logs or returns the code. */
  private async createOtp(user: UserDocument): Promise<void> {
    const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const key = `otp:${tokenDigest(user.email)}`;
    const stored = await this.redis
      .multi()
      .hset(key, {
        digest: this.otpDigest(user.email, otp),
        attempts: 0,
        userId: user._id.toString(),
      })
      .expire(key, 600)
      .set(`otp-cooldown:${tokenDigest(user.email)}`, '1', 'EX', 60)
      .exec();
    if (!stored || stored.some(([error]) => error !== null))
      throw new Error('OTP storage unavailable');
    await this.email.sendOtpEmail(user.email, otp);
  }
  /** Resends verification at most once a minute without disclosing account existence. */
  async resendOtp(email: string): Promise<{ message: string }> {
    const allowed = await this.redis.set(`otp-cooldown:${tokenDigest(email)}`, '1', 'EX', 60, 'NX');
    if (allowed) {
      const user = await this.users.findByEmail(email);
      if (user?.isActive && !user.isVerified) {
        try {
          await this.createOtp(user);
        } catch {
          this.logger.error('Verification email could not be queued');
        }
      }
    }
    return { message: 'If an unverified account exists, a new code has been requested.' };
  }
  /** Atomically consumes an OTP with a five-attempt maximum and a ten-minute expiry. */
  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const result: unknown = await this.redis.eval(
      "local digest=redis.call('HGET',KEYS[1],'digest'); if not digest then return '' end; local n=redis.call('HINCRBY',KEYS[1],'attempts',1); if n>5 then redis.call('DEL',KEYS[1]); return '' end; if digest~=ARGV[1] then if n==5 then redis.call('DEL',KEYS[1]) end; return '' end; local id=redis.call('HGET',KEYS[1],'userId'); redis.call('DEL',KEYS[1]); return id",
      1,
      `otp:${tokenDigest(email)}`,
      this.otpDigest(email, otp),
    );
    if (typeof result !== 'string' || !result)
      throw new BadRequestException('Code is invalid or expired. Request a new code.');
    await this.users.markVerified(result);
    return { message: 'Email verified successfully.' };
  }
  /** Always responds generically; a cooldown also prevents per-email inbox flooding. */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const allowed = await this.redis.set(
      `reset-cooldown:${tokenDigest(email)}`,
      '1',
      'EX',
      60,
      'NX',
    );
    if (allowed) {
      const user = await this.users.findByEmail(email);
      if (user?.isActive) {
        const token = randomBytes(32).toString('hex');
        await this.users.setResetToken(user._id.toString(), tokenDigest(token));
        const url = new URL('/reset-password', this.config.getOrThrow<string>('APP_URL'));
        url.searchParams.set('token', token);
        try {
          await this.email.sendResetPasswordEmail(email, url.href);
        } catch {
          this.logger.error('Password reset email could not be queued');
        }
      }
    }
    return { message: 'If an account exists, a password reset email has been requested.' };
  }
  /** Saves a new password and invalidates the single-use token and all existing sessions. */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    await this.users.resetPassword(tokenDigest(token), password);
    return { message: 'Password reset. Please sign in again.' };
  }
  /** Changes a password only with the current password and a fresh session. */
  async changePassword(
    user: ActiveUserData,
    current: string,
    password: string,
  ): Promise<{ message: string }> {
    await this.users.changePassword(user.id, user.tokenVersion, current, password);
    return { message: 'Password changed. Please sign in again.' };
  }
}
