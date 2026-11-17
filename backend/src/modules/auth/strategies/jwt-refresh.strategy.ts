import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { assertPayload, cookieValue } from './jwt.strategy';
/** Supports an HTTP-only browser cookie or an explicit native-client body credential. */
export function extractRefreshToken(request: Request): string | null {
  const body: unknown = request.body;
  const token =
    typeof body === 'object' && body !== null && 'refreshToken' in body
      ? body.refreshToken
      : undefined;
  return (
    cookieValue(request, 'refreshToken') ??
    (typeof token === 'string' && token.length <= 2048 ? token : null)
  );
}
/** Refresh JWT verification is separate from access verification and cannot accept access tokens. */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  /** Configures refresh-only key, purpose, algorithm, issuer and audience. */
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractRefreshToken,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      algorithms: ['HS256'],
      issuer: config.getOrThrow<string>('JWT_ISSUER'),
      audience: config.getOrThrow<string>('JWT_AUDIENCE'),
      ignoreExpiration: false,
    });
  }
  /** Returns validated refresh claims; the service atomically checks and rotates the DB digest. */
  validate(payload: unknown) {
    assertPayload(payload, 'refresh');
    return payload;
  }
}
