import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
/** Reusable local strategy; the REST login controller also validates its DTO before authentication. */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  /** Uses email rather than Passport's default username field. */
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'email' });
  }
  /** Validates raw Passport inputs before querying MongoDB. */
  async validate(email: unknown, password: unknown) {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.length > 254 ||
      Buffer.byteLength(password) > 72
    )
      throw new UnauthorizedException('Invalid credentials');
    return this.auth.validateUser(email.trim().toLowerCase(), password);
  }
}
