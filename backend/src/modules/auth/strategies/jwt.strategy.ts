import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Types } from 'mongoose';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { UserRole } from '../../users/schemas/user.schema';
import type { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
/** Rejects signed but structurally invalid tokens and cross-purpose token substitution. */
export function assertPayload(
  value: unknown,
  type: 'access' | 'refresh',
): asserts value is JwtPayload {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('sub' in value) ||
    typeof value.sub !== 'string' ||
    !Types.ObjectId.isValid(value.sub) ||
    !('email' in value) ||
    typeof value.email !== 'string' ||
    !('role' in value) ||
    !Object.values(UserRole).includes(value.role as UserRole) ||
    !('version' in value) ||
    !Number.isSafeInteger(value.version) ||
    Number(value.version) < 0 ||
    !('remember' in value) ||
    typeof value.remember !== 'boolean' ||
    !('type' in value) ||
    value.type !== type ||
    !('jti' in value) ||
    typeof value.jti !== 'string' ||
    !/^[0-9a-f-]{36}$/.test(value.jti)
  )
    throw new UnauthorizedException('Invalid token');
}
/** Extracts only string cookie values from an otherwise untrusted cookie bag. */
export function cookieValue(request: Request, name: string): string | null {
  const cookies: unknown = request.cookies;
  if (typeof cookies !== 'object' || cookies === null || !(name in cookies)) return null;
  const value: unknown = (cookies as Record<string, unknown>)[name];
  return typeof value === 'string' && value.length <= 2048 ? value : null;
}
/** Access strategy checks token purpose, issuer/audience, expiry and live account state. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  /** Configures explicit HS256-only verification. */
  constructor(
    config: ConfigService,
    private readonly auth: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => cookieValue(request, 'accessToken'),
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
      issuer: config.getOrThrow<string>('JWT_ISSUER'),
      audience: config.getOrThrow<string>('JWT_AUDIENCE'),
      ignoreExpiration: false,
    });
  }
  /** Resolves a current principal rather than trusting a stale JWT role. */
  async validate(payload: unknown) {
    assertPayload(payload, 'access');
    return this.auth.validateAccess(payload);
  }
}
