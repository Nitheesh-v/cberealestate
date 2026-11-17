import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/** Requires a valid refresh-purpose JWT independently of public access-token bypasses. */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
